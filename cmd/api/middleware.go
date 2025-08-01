package main

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"golang.org/x/time/rate"
)

var (
	visitors  = make(map[string]*rate.Limiter)
	mu        sync.Mutex
	rateLimit = rate.Every(5 * time.Hour)
	burst     = 1
)

type contextKey string

const userKey contextKey = "user"

func (app *application) AuthTokenMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			app.unauthorizedResponse(w, r, fmt.Errorf("unauthorized"))
			return
		}

		if authHeader != "" {
			// Si el header está presente, valida el JWT
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				app.unauthorizedResponse(w, r, fmt.Errorf("unauthorized"))
				return
			}

			token := parts[1]

			// Valida el token
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

			// Recupera el usuario desde la base de datos
			ctx := r.Context()
			user, err := app.store.Users.GetUserByID(ctx, userID)
			if err != nil {
				app.unauthorizedResponse(w, r, err)
				return
			}

			// Agrega el usuario al contexto
			ctx = context.WithValue(ctx, userKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}
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

func getVisitor(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	limiter, exists := visitors[ip]
	if !exists {
		limiter = rate.NewLimiter(rateLimit, burst)
		visitors[ip] = limiter
	}
	return limiter
}

func (app *application) RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		if limiter := getVisitor(ip); !limiter.Allow() {
			app.rateLimitExceededResponse(w, r, "5 minutos")
			return
		}

		next.ServeHTTP(w, r)
	})
}

// func(app *application) getSessionUser(r *http.Request) *User {
//   session, _ := gothic.Store.Get(r, "session")
//   if user, ok := session.Values["userID"]
// }

func (app *application) getSessionUser(r *http.Request) (goth.User, error) {
	session, err := gothic.Store.Get(r, "session")
	if err != nil {
		return goth.User{}, err
	}

	u := session.Values["user"]
	if u == nil {
		return goth.User{}, fmt.Errorf("user is not authenticated")
	}

	return u.(goth.User), nil
}
