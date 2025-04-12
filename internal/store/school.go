package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

type School struct {
	ID              int64       `json:"id"`
	Name            string      `json:"name"`
	Professor       []Professor `json:"professors"`
	TotalProfessors int         `json:"total_professors"`
	Address         string      `json:"address"`
}

type SchoolStore struct {
	db *sql.DB
}

func (s *SchoolStore) Create(ctx context.Context, school *School) error {
	query := `
	INSERT INTO school (name, address)
	VALUES ($1, $2)
	RETURNING id
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		school.Name,
		school.Address,
	).Scan(
		&school.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

func (s *SchoolStore) GetSchoolByID(ctx context.Context, schoolID int64, fq PaginatedFeedQuery) (*School, error) {
	school := &School{}

	err := withTx(s.db, ctx, func(tx *sql.Tx) error {
		query := `
			SELECT id, name, address 
			FROM school 
			WHERE id = $1 
		`
		return tx.QueryRowContext(ctx, query, schoolID).Scan(&school.ID, &school.Name, &school.Address)
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get school: %w", err)
	}

	// Obtener el total de profesores sin limitación
	totalProfessors, err := s.getTotalProfessors(ctx, schoolID)
	if err != nil {
		return nil, fmt.Errorf("failed to get total professors: %w", err)
	}

	// Obtener los profesores con reseñas de manera paginada
	professors, err := s.getReviewsPerProfessor(ctx, schoolID, fq.Limit, fq.Offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get professors: %w", err)
	}

	school.Professor = professors
	school.TotalProfessors = totalProfessors // Usar el total de profesores aquí

	return school, nil
}

func (s *SchoolStore) GetSchools(ctx context.Context, fq PaginatedFeedQuery) ([]*School, error) {

	var totalProfessors int

	query :=
		`
	SELECT s.id, s.name, s.address, COUNT(p.id) AS total_professors
	FROM school s
	LEFT JOIN professor p ON p.school_id = s.id
	WHERE s.name ILIKE '%' || $1 || '%'
	GROUP BY s.id, s.name
	LIMIT $2 OFFSET $3;
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, fq.Search, fq.Limit, fq.Offset)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var schools []*School
	for rows.Next() {
		school := &School{}
		if err := rows.Scan(
			&school.ID,
			&school.Name,
			&school.Address,
			&totalProfessors,
		); err != nil {
			return nil, err
		}

		school.TotalProfessors = totalProfessors
		schools = append(schools, school)
	}

	return schools, nil
}

func (s *SchoolStore) GetProfessorsSchool(ctx context.Context, schoolName string, fq PaginatedFeedQuery) ([]*School, error) {
	query :=
		`
	SELECT 
	s.id, 
	s.name,
	s.address,
	COALESCE(json_agg(json_build_object('id', p.id, 'name', p.name, 'subject', p.subject)) FILTER (WHERE p.id IS NOT NULL), '[]') AS professors
		FROM school s 
		LEFT JOIN professor p ON s.id = p.school_id
		WHERE s.name ILIKE '%' || $1 || '%'
		GROUP BY s.id
		LIMIT $2 OFFSET $3
		`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, schoolName, fq.Limit, fq.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schools []*School
	for rows.Next() {
		school := &School{}
		var professorsJSON string

		if err := rows.Scan(
			&school.ID,
			&school.Name,
			&professorsJSON,
		); err != nil {
			return nil, err
		}

		var professors []Professor
		if err := json.Unmarshal([]byte(professorsJSON), &professors); err != nil {
			return nil, err
		}
		school.Professor = professors

		schools = append(schools, school)
	}

	return schools, nil
}

func (s *SchoolStore) GetRandomSchools(ctx context.Context, limit int) ([]*School, error) {
	query := `
	SELECT s.id, s.name, s.address
	FROM school s
	ORDER BY RANDOM()
	LIMIT $1;
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schools []*School
	for rows.Next() {
		school := &School{}
		if err := rows.Scan(
			&school.ID,
			&school.Name,
			&school.Address,
		); err != nil {
			return nil, err
		}
		schools = append(schools, school)
	}
	return schools, nil
}

func (s *SchoolStore) getTotalProfessors(ctx context.Context, schoolID int64) (int, error) {
	query := `
	SELECT COUNT(p.id) 
	FROM professor p
	WHERE p.school_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var totalProfessors int
	err := s.db.QueryRowContext(ctx, query, schoolID).Scan(&totalProfessors)
	if err != nil {
		return 0, fmt.Errorf("failed to execute query for total professors: %w", err)
	}

	return totalProfessors, nil
}

func (s *SchoolStore) getReviewsPerProfessor(ctx context.Context, schoolID int64, limit, offset int) ([]Professor, error) {
	query := `
	SELECT p.id, p.name, COUNT(r.id) AS review_count, p.subject
	FROM professor p
	LEFT JOIN reviews r ON r.professor_id = p.id
	WHERE p.school_id = $1
	GROUP BY p.id, p.name
	LIMIT $2 OFFSET $3
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, schoolID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	var results []Professor
	for rows.Next() {

		var id int64
		var professorName string
		var reviewCount int
		var subject string

		if err := rows.Scan(&id, &professorName, &reviewCount, &subject); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		results = append(results, Professor{
			ID:           id,
			Name:         professorName,
			TotalReviews: reviewCount,
			Subject:      subject,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return results, nil
}
