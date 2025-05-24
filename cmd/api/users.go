package main

import (
	"net/http"
	"strconv"

	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
)

// GetUser godoc
//
//	@Summary		Fetches a user profile
//	@Description	Fetches a user profile by ID
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			userID	path		int	true	"User ID"
//	@Success		200		{object}	store.User
//
// Failure 400 {object} error
// Failure 404 {object} error
// Failure 500 {object} error
//
//	@Security		ApiKeyAuth
//	@Router			/users/{userID} [get]
func (app *application) getUserHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(chi.URLParam(r, "userID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	user, err := app.store.Users.GetUserByID(ctx, userID)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, user); err != nil {
		app.internalServerError(w, r, err)
	}
}

// ActivateUser gdoc
//
//	@Summary		Activates/Register a user
//	@Description	Activates/Register a user by invitation token
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			token	path		string	true	"Invitation token"
//	@Success		204		{string}	string	"User activated"
//	@Failure		400		{object}	error
//	@Failure		404		{object}	error
//	@Security		ApiKeyAuth
//	@Router			/users/activate/{token} [put]
func (app *application) activateUserTokenHandler(w http.ResponseWriter, r *http.Request) {
	tokenString := chi.URLParam(r, "token")

	ctx := r.Context()

	if err := app.store.Users.Activate(ctx, tokenString); err != nil {
		switch err {
		case store.ErrNotFound:
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, "User activated"); err != nil {
		app.internalServerError(w, r, err)
	}

}

func (app *application) getUserFromCtx(r *http.Request) *store.User {
	ctx := r.Context()

	user, ok := ctx.Value(userKey).(*store.User)
	if !ok {
		return nil
	}

	return user
}
