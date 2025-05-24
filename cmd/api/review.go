package main

import (
	"net/http"
	"strconv"

	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
)

const maxFileSize = 3 * 1024 * 1024 // 10 MB

type Tag string

const (
	CalificaDuro            Tag = "Califica Duro"
	MuchasTareas            Tag = "Muchas Tareas"
	ClasesExcelentes        Tag = "Clases Excelentes"
	RespetadoPorEstudiantes Tag = "Respetado por los Estudiantes"
	TomariaSuClaseOtraVez   Tag = "Tomaría su clase otra vez"
	AsistenciaObligatoria   Tag = "Asistencia Obligatoria"
	DejaTrabajosLargos      Tag = "Deja trabajos largos"
	Barco                   Tag = "Barco"
	ClasesLargas            Tag = "Las clases son largas"
	ExamenesDificiles       Tag = "Los exámenes son difíciles"
	ExamenesFaciles         Tag = "Los exámenes son fáciles"
	NoEnseñaNada            Tag = "No enseña nada"
)

type CreateReviewPayload struct {
	Text           string `json:"text" validate:"required"`
	Subject        string `json:"subject" validate:"required"`
	Difficulty     int    `json:"difficulty" validate:"required" validate:"gte=1" validate:"lte=10"`
	Rating         int    `json:"rating" validate:"required" validate:"gte=1" validate:"lte=5"`
	WouldTakeAgain bool   `json:"would_take_again"`
	Tags           []Tag  `json:"tags" validate:"dive,oneof='Califica Duro' 'Muchas Tareas' 'Clases Excelentes' 'Respetado por los Estudiantes' 'Tomaría su clase otra vez' 'Asistencia Obligatoria' 'Deja trabajos largos' 'Barco' 'Las clases son largas' 'Los exámenes son difíciles' 'Los exámenes son fáciles' 'No enseña nada'"`
}

func (app *application) createReviewHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateReviewPayload
	professorID, err := strconv.ParseInt(chi.URLParam(r, "professorID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	user := app.getUserFromCtx(r)

	tags := make([]string, len(payload.Tags))
	for i, tag := range payload.Tags {
		tags[i] = string(tag)
	}

	review := &store.Review{
		Text:           payload.Text,
		Subject:        payload.Subject,
		Difficulty:     payload.Difficulty,
		Rating:         payload.Rating,
		WouldTakeAgain: payload.WouldTakeAgain,
		ProfessorID:    professorID,
		Tags:           tags,
	}

	if err := app.store.Reviews.CreateReview(ctx, user.ID, review); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, review); err != nil {
		app.internalServerError(w, r, err)
	}
}
