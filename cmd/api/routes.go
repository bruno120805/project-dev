package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/markbates/goth/gothic"
	"golang.org/x/oauth2"
)

var userTemplate = `
<p><a href="/logout/{{.Provider}}">logout</a></p>
<p>Name: {{.Name}} [{{.LastName}}, {{.FirstName}}]</p>
<p>Email: {{.Email}}</p>
<p>NickName: {{.NickName}}</p>
<p>Location: {{.Location}}</p>
<p>AvatarURL: {{.AvatarURL}} <img src="{{.AvatarURL}}"></p>
<p>Description: {{.Description}}</p>
<p>UserID: {{.UserID}}</p>
<p>AccessToken: {{.AccessToken}}</p>
<p>ExpiresAt: {{.ExpiresAt}}</p>
<p>RefreshToken: {{.RefreshToken}}</p>
`

type Goauth struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Picture       string `json:"picture"`
	Name          string `json:"name"`
	Locale        string `json:"locale"`
	FamilyName    string `json:"family_name"`
	GivenName     string `json:"given_name"`
}

func (app *application) getAuthCallbackFunction(w http.ResponseWriter, r *http.Request) {
	provider := chi.URLParam(r, "provider")

	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		fmt.Fprint(w, err)
		return
	}

	ctx := r.Context()

	usr := &store.User{
		Email:    user.Email,
		Username: user.FirstName,
		IsActive: true,
	}

	if err := app.store.Users.CreateOrUpdateUser(ctx, usr); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	http.Redirect(w, r, app.config.frontendURL, http.StatusTemporaryRedirect)
}

func (app *application) logoutHandler(w http.ResponseWriter, r *http.Request) {
	gothic.Logout(w, r)
	w.Header().Set("Location", "/")
	w.WriteHeader(http.StatusTemporaryRedirect)
}

func (app *application) beginAuthProviderCallback(w http.ResponseWriter, r *http.Request) {
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))
	gothic.BeginAuthHandler(w, r)
}

func (app *application) getAuthCallback(w http.ResponseWriter, r *http.Request) {
	url := app.config.oauth.AuthCodeURL("state", oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusFound)
}
