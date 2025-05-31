package store

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/lib/pq"
)

type Note struct {
	ID          int64    `json:"id"`
	Content     string   `json:"content"`
	Subject     string   `json:"subject"`
	Title       string   `json:"title"`
	FilesURL    []string `json:"files_url"`
	UserID      int64    `json:"user_id"`
	ProfessorID int64    `json:"professor_id"`
	CreatedAt   string   `json:"created_at"`
}

type NoteStore struct {
	db *sql.DB
}

func (s *NoteStore) GetNotes(ctx context.Context, professorID int64) ([]*Note, error) {
	query := `
		SELECT id, content, subject, title, files_url, user_id, professor_id,
		created_at
		FROM notes
		WHERE professor_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, professorID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	notes := []*Note{}

	for rows.Next() {
		n := &Note{}
		err := rows.Scan(
			&n.ID,
			&n.Content,
			&n.Subject,
			&n.Title,
			pq.Array(&n.FilesURL),
			&n.UserID,
			&n.ProfessorID,
			&n.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		notes = append(notes, n)
	}

	return notes, nil
}

func (s *NoteStore) Create(ctx context.Context, userID int64, n *Note) error {
	fmt.Println("note failed here")

	query := `
		INSERT INTO notes (content, subject, title, files_url, user_id, professor_id) 
		VALUES ($1, $2, $3, $4, $5, $6) 
		RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(ctx, query, n.Content, n.Subject, n.Title, pq.Array(n.FilesURL), userID, n.ProfessorID).Scan(&n.ID, &n.CreatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (s *NoteStore) GetNoteByID(ctx context.Context, noteID int64) (*Note, error) {
	query := `
		SELECT id, content, subject, title, files_url, user_id, professor_id, created_at
		FROM notes
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	n := &Note{}

	err := s.db.QueryRowContext(
		ctx,
		query,
		noteID,
	).Scan(
		&n.ID,
		&n.Content,
		&n.Subject,
		&n.Title,
		pq.Array(&n.FilesURL),
		&n.UserID,
		&n.ProfessorID,
		&n.CreatedAt,
	)
	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return n, nil
}

func (s *NoteStore) Delete(ctx context.Context, noteID int64) error {
	query := `
		DELETE FROM notes
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, noteID)
	if err != nil {
		return err
	}

	return nil
}
