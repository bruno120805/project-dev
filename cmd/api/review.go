package main

import (
	"net/http"
	"strconv"

	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
)

const maxFileSize = 6 * 1024 * 1024 // 6 MB

type Tag string

const (
	Excelente                Tag = "excelente"
	DaBuenaRetroalimentacion Tag = "buena-retroalimentacion"
	BrindaApoyo              Tag = "brinda-apoyo"
	ClasesExcelentes         Tag = "clases-excelentes"
	DaCreditoExtra           Tag = "credito-extra"

	AsistenciaObligatoria   Tag = "asistencia-obligatoria"
	RespetadoPorEstudiantes Tag = "respetado-estudiantes"
	HaceExamenesSorpresa    Tag = "examenes-sorpresa"
	ParticipacionImportante Tag = "participacion-importante"
	ClasesLargas            Tag = "clases-largas"

	CalificaDuro          Tag = "califica-duro"
	NoEnseñaNada          Tag = "no-ensena-nada"
	MuchasTareas          Tag = "muchas-tareas"
	ExamenesDificiles     Tag = "examenes-dificiles"
	PocosExamenes         Tag = "pocos-examenes"
	MuchosExamenes        Tag = "muchos-examenes"
	DejaTrabajosLargos    Tag = "deja-trabajos-largos"
	MuchosProyectos       Tag = "muchos-proyectos"
	TomariaSuClaseOtraVez Tag = "tomaria-otra-vez"
)

type CreateReviewPayload struct {
	Text           string `json:"text" validate:"required"`
	Subject        string `json:"subject" validate:"required"`
	Difficulty     int    `json:"difficulty" validate:"required,gte=1,lte=10"`
	Rating         int    `json:"rating" validate:"required,gte=1,lte=5"`
	WouldTakeAgain bool   `json:"would_take_again"`
	Tags           []Tag  `json:"tags" validate:"dive,oneof='excelente' 'buena-retroalimentacion' 'brinda-apoyo' 'clases-excelentes' 'credito-extra' 'asistencia-obligatoria' 'respetado-estudiantes' 'examenes-sorpresa' 'participacion-importante' 'clases-largas' 'califica-duro' 'no-enseña-nada' 'muchas-tareas' 'examenes-dificiles' 'pocos-examenes' 'muchos-examenes' 'deja-trabajos-largos' 'muchos-proyectos' 'tomaria-otra-vez'"`
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

func (app *application) getTagsFromProfessorHandler(w http.ResponseWriter, r *http.Request) {
	professorID, err := strconv.ParseInt(chi.URLParam(r, "professorID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	tags, err := app.store.Reviews.GetTagsFromProfessor(ctx, professorID)
	if err != nil {
		app.notFoundResponse(w, r, err)
		return
	}

	if len(tags) > 6 {
		tags = tags[:6]
	}

	if err := app.jsonResponse(w, http.StatusOK, tags); err != nil {
		app.internalServerError(w, r, err)
	}
}
