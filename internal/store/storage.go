package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	ErrNotFound          = errors.New("resource not found")
	QueryTimeoutDuration = time.Second * 5
	ErrConflict          = errors.New("resource already exists")
)

type Storage struct {
	Users interface {
		GetUserByEmail(ctx context.Context, email string) (*User, error)
		CreateAndInvite(ctx context.Context, user *User, token string, exp time.Duration) error
		Delete(ctx context.Context, id int64) error
		GetUserByID(ctx context.Context, id int64) (*User, error)
		Activate(ctx context.Context, token string) error
		CreateOrUpdateUser(ctx context.Context, user *User) error
	}
	Professors interface {
		Create(ctx context.Context, professor *Professor) error
		GetProfessors(ctx context.Context, schoolID int64, fq PaginatedFeedQuery) ([]*Professor, error)
		GetProfessorsByName(ctx context.Context, name string) ([]*Professor, error)
		GetByID(ctx context.Context, id int64) (*Professor, error)
	}
	Schools interface {
		Create(ctx context.Context, school *School) error
		GetProfessorsSchool(ctx context.Context, schoolName string, fq PaginatedFeedQuery) ([]*School, error)
		GetSchoolByID(ctx context.Context, schoolID int64, fq PaginatedFeedQuery) (*School, error)
		GetSchools(ctx context.Context, fq PaginatedFeedQuery) ([]*School, error)
		GetRandomSchools(ctx context.Context, limit int) ([]*School, error)
	}
	Roles interface {
		GetRoleByName(ctx context.Context, name string) (*Role, error)
	}
	Reviews interface {
		CreateReview(ctx context.Context, userID int64, r *Review) error
		GetProfessorReviews(ctx context.Context, professorID int64) ([]*Review, error)
		GetTagsFromProfessor(ctx context.Context, professorID int64) ([]string, error)
	}
	Notes interface {
		Create(ctx context.Context, userID int64, note *Note) error
		GetNoteByID(ctx context.Context, noteID int64) (*Note, error)
		Delete(ctx context.Context, noteID int64) error
		GetNotesByName(ctx context.Context, fq PaginatedFeedQuery, professorID int64) ([]*Note, error)
		GetNotes(ctx context.Context, professorID int64) ([]*Note, error)
	}
}

func NewPostgresStorage(db *sql.DB) Storage {
	return Storage{
		Users:      &UserStore{db},
		Professors: &ProfessorStore{db},
		Roles:      &RoleStore{db},
		Schools:    &SchoolStore{db},
		Reviews:    &ReviewStore{db},
		Notes:      &NoteStore{db},
	}
}

func withTx(db *sql.DB, ctx context.Context, fn func(tx *sql.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}
