package main

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
)

type CreateProfessorPayload struct {
	Name    string `json:"name" validate:"required,min=2,max=40"`
	Subject string `json:"subject" validate:"required,min=2,max=40"`
}

func (app *application) createProfessorHandler(w http.ResponseWriter, r *http.Request) {
	schoolID, err := strconv.ParseInt(chi.URLParam(r, "schoolID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}
	ctx := r.Context()

	fq := store.PaginatedFeedQuery{
		Limit:  10,
		Offset: 0,
		Sort:   "desc",
		Search: "",
	}

	if _, err := app.store.Schools.GetSchoolByID(ctx, schoolID, fq); err != nil {
		app.notFoundResponse(w, r, err)
		return
	}

	var payload CreateProfessorPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	professor := &store.Professor{
		Name:     payload.Name,
		Subject:  payload.Subject,
		SchoolID: schoolID,
	}

	if err := app.store.Professors.Create(ctx, professor); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, professor); err != nil {
		app.internalServerError(w, r, err)
	}

}

func (app *application) getProfessorReviewsHandler(w http.ResponseWriter, r *http.Request) {
	professorID, err := strconv.ParseInt(chi.URLParam(r, "professorID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}
	ctx := r.Context()

	professor, err := app.store.Reviews.GetProfessorReviews(ctx, professorID)
	if err != nil {
		app.notFoundResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, professor); err != nil {
		app.internalServerError(w, r, err)
	}
}

func (app *application) getProfessorsHandler(w http.ResponseWriter, r *http.Request) {
	professorName := r.URL.Query().Get("q")
	if professorName == "" {
		app.badRequestResponse(w, r, fmt.Errorf("missing professor name"))
		return
	}

	fq := store.PaginatedFeedQuery{
		Limit:  10,
		Offset: 0,
		Sort:   "desc",
		Search: professorName,
	}

	fq, err := fq.Parse(r)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	professors, err := app.store.Professors.GetProfessorsByName(ctx, fq.Search)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, professors); err != nil {
		app.internalServerError(w, r, err)
	}
}
