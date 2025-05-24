package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bruno120805/project/docs"
	"github.com/bruno120805/project/internal/auth"
	"github.com/bruno120805/project/internal/mail"
	"github.com/bruno120805/project/internal/services"
	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"
	"go.uber.org/zap"
	"golang.org/x/oauth2"
)

const version = "1.0.0"

type application struct {
	config        config
	store         store.Storage
	logger        *zap.SugaredLogger
	mailer        mail.Client
	authenticator auth.Authenticator
	uploader      *services.S3Uploader
}

type uploaderConfig struct {
	region string
	bucket string
}

type authConfig struct {
	token tokenConfig
}

type tokenConfig struct {
	secret string
	exp    time.Duration
	iss    string
}

type mailConfig struct {
	exp       time.Duration
	fromEmail string
	mailTrap  mailTrapConfig
}

type sendGridConfig struct {
	apiKey string
}

type mailTrapConfig struct {
	apiKey string
}

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

type config struct {
	addr        string
	db          dbConfig
	env         string
	apiURL      string
	mail        mailConfig
	frontendURL string
	auth        authConfig
	uploader    uploaderConfig
	oauth       *oauth2.Config
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/v1", func(r chi.Router) {
		docsULR := fmt.Sprintf("%s/swagger/doc.json", app.config.addr)
		r.Get("/swagger/*", httpSwagger.Handler(httpSwagger.URL(docsULR)))

		// USERS ROUTES
		r.Route("/users", func(r chi.Router) {
			r.Put("/activate/{token}", app.activateUserTokenHandler)

			r.Route("/{userID}", func(r chi.Router) {
				// r.Use(app.AuthTokenMiddleware)
				r.Get("/", app.getUserHandler)
			})
		})

		// REVIEWS ROUTES
		r.Route("/reviews", func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)
			r.Post("/{professorID}", app.createReviewHandler)
		})

		// NOTES ROUTES
		r.Route("/notes", func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)
			r.Get("/{professorID}", app.getNotesHandler)
			r.Post("/{professorID}", app.createNoteHandler)
			r.Delete("/{noteID}", app.deleteNoteHandler)
			r.Get("/{noteID}/view", app.getNoteByID)
		})

		r.Route("/professor", func(r chi.Router) {
			r.Get("/{professorID}", app.getProfessorReviewsHandler)
		})

		// SEARCH ROUTES
		r.Route("/search", func(r chi.Router) {
			// uses a query parameter to search for a school
			r.Get("/schools", app.getSchoolsHandler)

			// brings all the professors from a school
			r.Get("/professor/{schoolID}", app.getProfessorFromSchoolsHandler)
			r.Get("/professor", app.getProfessorsHandler)
		})

		// SCHOOL ROUTES
		r.Route("/school", func(r chi.Router) {
			// AUTH REQUIRED
			r.With(app.AuthTokenMiddleware).Post("/{schoolID}", app.checkPostOwnership("admin", app.createProfessorHandler))
			r.With(app.AuthTokenMiddleware).Post("/", app.checkPostOwnership("admin", app.createSchoolHandler))
			r.Get("/{schoolID}", app.getSchoolHandler)
			r.Get("/random", app.getRandomSchoolsHandler)
		})

		// AUTH ROUTES
		r.Route("/auth", func(r chi.Router) {
			r.Get("/{provider}", app.beginAuthProviderCallback)
			r.Get("/{provider}/callback", app.getAuthCallBackFunction)
			r.Get("/logout/{provider}", app.logoutHandler)
			r.Get("/oauth", app.getAuthCallback)
			r.Get("/me", app.getCurrentUser)
			r.Post("/register", app.registerUserHandler)
			r.Post("/login", app.loginUserHandler)
			r.Get("/user", app.authUserHandler)
		})
	})

	return r
}

func (app *application) run(mux http.Handler) error {
	docs.SwaggerInfo.Version = version
	docs.SwaggerInfo.Host = app.config.apiURL
	docs.SwaggerInfo.BasePath = "/v1"

	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      mux,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
		IdleTimeout:  time.Minute,
	}

	shutdown := make(chan error)

	go func() {
		quit := make(chan os.Signal, 1)

		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		s := <-quit

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		app.logger.Infow("signal caught", "signal", s.String())

		shutdown <- srv.Shutdown(ctx)
	}()

	app.logger.Infow("server has started", "addr", app.config.addr, "env", app.config.env)

	err := srv.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	err = <-shutdown
	if err != nil {
		return err
	}

	app.logger.Infow("server has stopped", "addr", app.config.addr, "env", app.config.env)

	return nil
}
