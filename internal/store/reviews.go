package store

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/lib/pq"
)

type Review struct {
	ID             int64    `json:"id"`
	Text           string   `json:"text"`
	Subject        string   `json:"subject"`
	Difficulty     int      `json:"difficulty"`
	CreatedAt      string   `json:"created_at"`
	UserID         int64    `json:"user_id"`
	Rating         int      `json:"rating"`
	ProfessorID    int64    `json:"professor_id"`
	WouldTakeAgain bool     `json:"would_take_again"`
	Tags           []string `json:"tags"`
}

type ReviewStore struct {
	db *sql.DB
}

func (s *ReviewStore) CreateReview(ctx context.Context, userID int64, r *Review) error {

	return withTx(s.db, ctx, func(tx *sql.Tx) error {
		// CHECK IF PROFESSOR  EXISTS
		var professorID int64
		query := `
			SELECT id FROM professor WHERE id = $1
		`

		err := tx.QueryRowContext(ctx, query, r.ProfessorID).Scan(&professorID)
		if err != nil {
			switch {
			case err == sql.ErrNoRows:
				return ErrNotFound
			default:
				return err
			}
		}

		// INSERT REVIEW
		query2 := `
			INSERT INTO reviews (text, subject, difficulty, user_id, professor_id, rating, would_take_again, tags)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING id, created_at
		`

		ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
		defer cancel()

		err = tx.QueryRowContext(
			ctx,
			query2,
			r.Text,
			r.Subject,
			r.Difficulty,
			userID,
			r.ProfessorID,
			r.Rating,
			r.WouldTakeAgain,
			pq.Array(r.Tags),
		).Scan(
			&r.ID,
			&r.CreatedAt,
		)
		if err != nil {
			switch {
			case err.Error() == "pq: new row for relation \"reviews\" violates check constraint \"reviews_difficulty_check\"":
				return fmt.Errorf("difficulty must be between 1 and 10")
			default:
				return err
			}
		}

		return nil

	})

}

func (s *ReviewStore) GetTagsFromProfessor(ctx context.Context, professorID int64) ([]string, error) {
	query := `
	SELECT DISTINCT unnest(tags) 
	FROM reviews 
	WHERE professor_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, professorID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var tags []string
	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

func (s *ReviewStore) GetProfessorReviews(ctx context.Context, professorID int64) ([]*Review, error) {
	query := `
	SELECT r.id, r.subject, r.difficulty, r.text , r.created_at, r.rating, r.would_take_again, r.tags
	FROM reviews r 
	JOIN professor p ON p.id = r.professor_id
	WHERE p.id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, professorID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var reviews []*Review
	for rows.Next() {
		var r Review
		err := rows.Scan(
			&r.ID,
			&r.Subject,
			&r.Difficulty,
			&r.Text,
			&r.CreatedAt,
			&r.Rating,
			&r.WouldTakeAgain,
			pq.Array(&r.Tags),
		)
		if err != nil {
			return nil, err
		}

		reviews = append(reviews, &r)
	}

	return reviews, nil
}
