package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var tables = []string{
	"reviews",
	"notes",
	"professor",
	"school",
	"reviews",
	"notes",
	"users",
}

func main() {
	fmt.Println("Iniciando limpieza de la base de datos...")

	db, err := sql.Open("postgres", "host=localhost port=5432 user=postgres password=postgres dbname=project sslmode=disable")
	if err != nil {
		log.Fatalf("❌ Error al conectar a la base de datos: %v", err)
	}
	defer db.Close()

	ClearDatabase(db)
}

func ClearDatabase(db *sql.DB) {
	for _, table := range tables {
		query := fmt.Sprintf("TRUNCATE TABLE %s RESTART IDENTITY CASCADE", table)
		_, err := db.Exec(query)
		if err != nil {
			log.Fatalf("❌ Error al limpiar tabla %s: %v", table, err)
		}
		log.Printf("✅ Tabla '%s' limpiada correctamente", table)
	}
}
