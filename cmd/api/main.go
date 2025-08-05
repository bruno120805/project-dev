package main

import (
	"log"
	"os"
	"time"

	"github.com/bruno120805/project/internal/auth"
	"github.com/bruno120805/project/internal/db"
	"github.com/bruno120805/project/internal/env"
	"github.com/bruno120805/project/internal/mail"
	"github.com/bruno120805/project/internal/services"
	"github.com/bruno120805/project/internal/store"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

//	@title			Gopher
//	@description	API for Gopher
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	API Support
//	@contact.url	http://www.swagger.io/support
//	@contact.email	support@swagger.io

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

// @BasePath					/v1
//
// @securityDefinitions.apikey	ApiKeyAuth
// @in							header
// @name						Authorization
// @description
func main() {
	if _, err := os.Stat(".env"); err == nil {
		err := godotenv.Load(".env")
		if err != nil {
			log.Fatalf("Error loading .env file: %v", err)
		}
	} else {
		log.Println(".env file not found, continuing without loading it")
	}

	cfg := config{
		addr:        env.GetString("ADDR", ":8081"),
		apiURL:      env.GetString("API_URL", "localhost:8081"),
		frontendURL: env.GetString("FRONTEND_URL", "http://localhost:3000"),
		env:         env.GetString("ENV", "development"),
		db: dbConfig{
			addr:         env.GetString("DB_ADDR", "postgres://postgres:postgres@localhost/project?sslmode=disable"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", "15m"),
		},
		mail: mailConfig{
			fromEmail: env.GetString("FROM_EMAIL", ""),
			exp:       time.Hour * 24 * 3, // 3 days ,
			mailTrap: mailTrapConfig{
				apiKey: env.GetString("MAILTRAP_API_KEY", ""),
			},
		},
		auth: authConfig{
			token: tokenConfig{
				secret: env.GetString("JWT_SECRET", "example"),
				// TODO: change time for whatever i want
				exp: time.Hour * 24,
				iss: "project",
			},
		},
		uploader: uploaderConfig{
			region: env.GetString("AWS_REGION", "us-east-1"),
			bucket: env.GetString("AWS_BUCKET_NAME", "project"),
		},
		oauth: &oauth2.Config{
			ClientID:     env.GetString("GOOGLE_CLIENT_ID", ""),
			ClientSecret: env.GetString("GOOGLE_CLIENT_SECRET", ""),
			RedirectURL:  env.GetString("GOOGLE_REDIRECT_URL", ""),
			Scopes:       []string{"email", "profile"},
			Endpoint:     google.Endpoint,
		},
	}

	// Logger
	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync()

	// Database
	db, err := db.New(
		cfg.db.addr,
		cfg.db.maxOpenConns,
		cfg.db.maxIdleConns,
		cfg.db.maxIdleTime,
	)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()

	logger.Info("Database connection established")

	// Store
	store := store.NewPostgresStorage(db)

	// mailer
	mailer, err := mail.NewMailTrapClient(cfg.mail.mailTrap.apiKey, cfg.mail.fromEmail)
	if err != nil {
		log.Fatal(err)
	}

	// authenticator
	authenticator := auth.NewJWTAuthenticator(cfg.auth.token.secret, cfg.auth.token.iss, cfg.auth.token.iss)

	// Uploader
	uploader, err := services.NewS3Uploader(cfg.uploader.region, cfg.uploader.bucket)
	if err != nil {
		logger.Fatal(err)
	}

	auth.NewAuth()

	app := &application{
		config:        cfg,
		store:         store,
		logger:        logger,
		mailer:        mailer,
		authenticator: authenticator,
		uploader:      uploader,
	}

	mux := app.mount()
	logger.Fatal(app.run(mux))
}
