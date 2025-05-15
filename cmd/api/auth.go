package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/bruno120805/project/internal/mail"
	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/markbates/goth/gothic"
	"golang.org/x/oauth2"
)

type RegisterUserPayload struct {
	Username string `json:"username" validate:"required,max=60"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=6,max=72"`
}

type UserWithToken struct {
	*store.User
	Token string `json:"token"`
}

// registerUserHandler godoc
//
//	@Summary		Registers a user
//	@Description	Register a new user
//	@Tags			authentication
//	@Accept			json
//	@Produce		json
//	@Param			payload	body		RegisterUserPayload	true	"User credentials"
//	@Success		204		{string}	UserWithToken		"User registered"
//	@Failure		400		{object}	error
//	@Failure		404		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/authentication/user [post]
func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	payload := RegisterUserPayload{}

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := &store.User{
		Username: payload.Username,
		Email:    payload.Email,
	}

	// hash the user password
	err := user.Password.Set(payload.Password)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	ctx := r.Context()

	plainToken := uuid.New().String()

	// store token in DB hashed
	hash := sha256.Sum256([]byte(plainToken))
	hashedToken := hex.EncodeToString(hash[:])

	// store the user
	if err = app.store.Users.CreateAndInvite(ctx, user, hashedToken, app.config.mail.exp); err != nil {
		switch err {
		case store.ErrDuplicateEmail:
			app.badRequestResponse(w, r, err)
		case store.ErrDuplicateUsername:
			app.badRequestResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	userWithToken := &UserWithToken{
		User:  user,
		Token: plainToken,
	}

	activationURL := fmt.Sprintf("%s/activate/%s", app.config.frontendURL, plainToken)

	isProdEnv := app.config.env == "production"
	vars := struct {
		Username      string
		ActivationURL string
	}{
		Username:      user.Username,
		ActivationURL: activationURL,
	}

	// send mail
	status, err := app.mailer.Send(mail.UserWelcomeTemplate, user.Username, user.Email, vars, !isProdEnv)
	if err != nil {
		app.logger.Errorw("error sending welcome email", "error", err)

		// rollback user creation if emails fails (SAGA pattern)
		if err = app.store.Users.Delete(ctx, user.ID); err != nil {
			app.logger.Errorw("error deleting user", "error", err)
		}
		app.internalServerError(w, r, err)
		return
	}

	app.logger.Infow("Email sent", "status code", status)

	if err := app.jsonResponse(w, http.StatusCreated, userWithToken); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type LoginUserPayload struct {
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,max=72"`
}

// LoginUserHandler godoc
//
//	@Summary		Creates a token for a user (login)
//	@Description	Creates a token for a user
//	@Tags			authentication
//	@Accept			json
//	@Produce		json
//	@Param			payload	body		LoginUserPayload	true	"User credentials"
//	@Success		200		{string}	string				"JWT token for authentication"
//	@Failure		400		{object}	error
//	@Failure		401		{object}	error
//	@Failure		500		{object}	error
//	@Router			/authentication/token [post]
func (app *application) loginUserHandler(w http.ResponseWriter, r *http.Request) {
	payload := LoginUserPayload{}

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	// fetch the user (check if the user exists) from the payload
	user, err := app.store.Users.GetUserByEmail(ctx, payload.Email)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			app.unauthorizedResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err = user.Password.Compare(payload.Password); err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	// generate a new token
	claims := jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(app.config.auth.token.exp).Unix(),
		"iat": time.Now().Unix(),
		"nbf": time.Now().Unix(),
		"iss": app.config.auth.token.iss,
		"aud": app.config.auth.token.iss,
	}

	token, err := app.authenticator.GenerateToken(claims)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	resp := map[string]interface{}{
		"token": token,
		"user":  user,
	}

	if err := app.jsonResponse(w, http.StatusOK, resp); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) authUserHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		app.unauthorizedResponse(w, r, fmt.Errorf("missing Authorization header"))
		return
	}

	tokenString := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	}

	jwtToken, err := app.authenticator.ValidateToken(tokenString)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	claims := jwtToken.Claims.(jwt.MapClaims)
	userID, err := strconv.ParseInt(fmt.Sprintf("%v", claims["sub"]), 10, 64)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	ctx := r.Context()
	user, err := app.store.Users.GetUserByID(ctx, userID)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			app.unauthorizedResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, user); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getAuthCallBackFunction(w http.ResponseWriter, r *http.Request) {
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(r.Context(), "provider", provider))

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	session, err := gothic.Store.Get(r, "session")
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	usr := &store.User{
		Username: user.FirstName,
		Email:    user.Email,
		IsActive: true,
	}

	ctx := r.Context()

	if _, err = app.store.Users.GetUserByID(ctx, usr.ID); err != nil {
		err = app.store.Users.CreateOrUpdateUser(ctx, usr)
		if err != nil {
			app.badRequestResponse(w, r, err)
			return
		}
	}

	// Generamos un nuevo token para asi autenticar al usuario
	claims := jwt.MapClaims{
		"sub": usr.ID,
		"exp": time.Now().Add(app.config.auth.token.exp).Unix(),
		"iat": time.Now().Unix(),
		"nbf": time.Now().Unix(),
		"iss": app.config.auth.token.iss,
		"aud": app.config.auth.token.iss,
	}

	token, err := app.authenticator.GenerateToken(claims)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Guardamos el usuario en la sesion
	session.Values["userID"] = usr.ID
	session.Values["username"] = usr.Username
	session.Values["email"] = usr.Email

	// Guarda sesión (esto genera la cookie)
	if err := session.Save(r, w); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	fmt.Println("token:", token)
	redirectURL := fmt.Sprintf("%s?token=%s", app.config.frontendURL, token)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

func (app *application) logoutHandler(w http.ResponseWriter, r *http.Request) {
	session, err := gothic.Store.Get(r, "session")
	if err != nil {
		log.Println(err)
		app.internalServerError(w, r, err)
		return
	}

	session.Options.MaxAge = -1

	session.Save(r, w)
}

func (app *application) beginAuthProviderCallback(w http.ResponseWriter, r *http.Request) {
	if gothUser, err := gothic.CompleteUserAuth(w, r); err == nil {
		// TODO: Handle the authenticated user
		fmt.Println(gothUser)
	} else {
		gothic.BeginAuthHandler(w, r)
	}
}

func (app *application) getAuthCallback(w http.ResponseWriter, r *http.Request) {
	url := app.config.oauth.AuthCodeURL("state", oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusFound)
}

func (app *application) getCurrentUser(w http.ResponseWriter, r *http.Request) {
	session, err := gothic.Store.Get(r, "session")
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	userID, _ := session.Values["userID"].(int64)
	username, _ := session.Values["username"].(string)
	email, _ := session.Values["email"].(string)

	resp := map[string]interface{}{
		"userID":   userID,
		"username": username,
		"email":    email,
	}

	if err := app.jsonResponse(w, http.StatusOK, resp); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}
