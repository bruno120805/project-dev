package store

import (
	"context"
	"database/sql"
)

type Role struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Level       int    `json:"level"`
}

type RoleStore struct {
	db *sql.DB
}

func (s *RoleStore) GetRoleByName(ctx context.Context, slug string) (*Role, error) {
	role := &Role{}

	query := `SELECT id, name, description, level FROM roles WHERE name = $1`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(ctx, query, slug).Scan(
		&role.ID,
		&role.Name,
		&role.Description,
		&role.Level,
	)
	if err != nil {
		return nil, err
	}

	return role, nil
}
