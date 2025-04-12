package store

import (
	"context"
	"database/sql"
)

type Professor struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Subject      string `json:"subject"`
	SchoolID     int64  `json:"school_id"`
	TotalReviews int    `json:"total_reviews"`
}

type ProfessorStore struct {
	db *sql.DB
}

func (s *ProfessorStore) GetByID(ctx context.Context, id int64) (*Professor, error) {
	query := `
	SELECT id, name, subject, school_id
	FROM professor
	WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	professor := &Professor{}
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&professor.ID,
		&professor.Name,
		&professor.Subject,
		&professor.SchoolID,
	)
	if err != nil {
		switch err {
		case sql.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return professor, nil
}

func (s *ProfessorStore) Create(ctx context.Context, professor *Professor) error {

	query := `
	INSERT INTO professor (name, subject, school_id) 
	VALUES ($1, $2, $3) 
	RETURNING id
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		professor.Name,
		professor.Subject,
		professor.SchoolID,
	).Scan(
		&professor.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

func (s *ProfessorStore) GetProfessorsByName(ctx context.Context, name string) ([]*Professor, error) {
	query := `
	SELECT id, name, subject, school_id
	FROM professor
	WHERE name ILIKE '%' || $1 || '%'
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, name)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var professors []*Professor
	for rows.Next() {
		professor := &Professor{}
		err := rows.Scan(
			&professor.ID,
			&professor.Name,
			&professor.Subject,
			&professor.SchoolID,
		)
		if err != nil {
			return nil, err
		}

		professors = append(professors, professor)
	}

	return professors, nil
}

// TODO: CHECK IF THIS METHOD IS NEEDED
func (s *ProfessorStore) GetProfessors(ctx context.Context, schoolID int64, fq PaginatedFeedQuery) ([]*Professor, error) {
	query :=
		`
		SELECT id, name, subject, school_id
		FROM professor
		WHERE school_id = $1
		LIMIT $2 OFFSET $3
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, schoolID, fq.Limit, fq.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var professors []*Professor
	for rows.Next() {
		professor := &Professor{}
		err := rows.Scan(
			&professor.ID,
			&professor.Name,
			&professor.Subject,
			&professor.SchoolID,
		)
		if err != nil {
			return nil, err
		}

		professors = append(professors, professor)
	}

	return professors, nil
}
