package main

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const userKey contextKey = "user"

func (app *application) AuthTokenMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the token from the Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			app.unauthorizedResponse(w, r, fmt.Errorf("unauthorized"))
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			app.unauthorizedResponse(w, r, fmt.Errorf("unauthorized"))
			return
		}

		token := parts[1]

		// Validate the token

		jwtToken, err := app.authenticator.ValidateToken(token)
		if err != nil {
			app.unauthorizedResponse(w, r, fmt.Errorf("unauthorized"))
			return
		}

		claims := jwtToken.Claims.(jwt.MapClaims)

		userID, err := strconv.ParseInt(fmt.Sprintf("%.f", claims["sub"]), 10, 64)
		if err != nil {
			app.unauthorizedResponse(w, r, err)
			return
		}

		ctx := r.Context()

		user, err := app.store.Users.GetUserByID(ctx, userID)
		if err != nil {
			app.unauthorizedResponse(w, r, err)
			return
		}

		// Add the userID to the context
		ctx = context.WithValue(ctx, userKey, user)

		next.ServeHTTP(w, r.WithContext(ctx))
	})

}

func (app *application) checkPostOwnership(requiredRole string, next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := app.getUserFromCtx(r)

		ctx := r.Context()

		// Check user Role
		role, err := app.store.Roles.GetRoleByName(ctx, requiredRole)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}

		if user.Role.Level < role.Level {
			app.forbiddenResponse(w, r, fmt.Errorf("forbidden"))
			return
		}

		next.ServeHTTP(w, r)
	})
}
