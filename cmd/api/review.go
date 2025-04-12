package main

import (
	"net/http"
	"strconv"

	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
)

const maxFileSize = 3 * 1024 * 1024 // 10 MB

type CreateReviewPayload struct {
	Text           string `json:"text" validate:"required"`
	Subject        string `json:"subject" validate:"required"`
	Difficulty     int    `json:"difficulty" validate:"required" validate:"gte=1" validate:"lte=10"`
	Rating         int    `json:"rating" validate:"required" validate:"gte=1" validate:"lte=5"`
	WouldTakeAgain bool   `json:"would_take_again"`
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

	review := &store.Review{
		Text:           payload.Text,
		Subject:        payload.Subject,
		Difficulty:     payload.Difficulty,
		Rating:         payload.Rating,
		WouldTakeAgain: payload.WouldTakeAgain,
		ProfessorID:    professorID,
	}

	if err := app.store.Reviews.CreateReview(ctx, user.ID, review); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, review); err != nil {
		app.internalServerError(w, r, err)
	}

}
