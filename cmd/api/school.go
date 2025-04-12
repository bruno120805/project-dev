package main

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
)

type CreateSchoolPayload struct {
	Name    string `json:"name" validate:"required,min=2,max=40"`
	Address string `json:"address" validate:"required,min=2,max=40"`
}

func (app *application) createSchoolHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateSchoolPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	school := &store.School{
		Name:    payload.Name,
		Address: payload.Address,
	}

	ctx := r.Context()

	if err := app.store.Schools.Create(ctx, school); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, school); err != nil {
		app.internalServerError(w, r, err)
	}

}

func (app *application) getProfessorFromSchoolsHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateProfessorPayload

	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	fq := store.PaginatedFeedQuery{
		Limit:  10,
		Offset: 0,
		Sort:   "desc",
		Search: "",
	}

	school := &store.School{
		Name: payload.Name,
	}

	fq, err := fq.Parse(r)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(fq); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	schools, err := app.store.Schools.GetProfessorsSchool(ctx, school.Name, fq)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, schools); err != nil {
		app.internalServerError(w, r, err)
	}
}

// GetSchool gdoc
//
//	@Summary		Gets a school
//	@Description	Gets a school by ID
//	@Tags			schools
//	@Accept			json
//	@Produce		json
//	@Param			SchoolID	path		int		true	"School ID"
//	@Success		204			{string}	string	"good"
//	@Failure		400			{object}	error
//	@Failure		404			{object}	error
//	@Security		ApiKeyAuth
//	@Router			/school/{schoolID} [get]
func (app *application) getSchoolHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "schoolID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	fq := store.PaginatedFeedQuery{
		Limit:  10,
		Offset: 0,
		Sort:   "desc",
		Search: "",
	}

	fq, err = fq.Parse(r)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	school, err := app.store.Schools.GetSchoolByID(ctx, id, fq)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, school); err != nil {
		app.internalServerError(w, r, err)
	}

}

// GetSchools gdoc
//
//	@Summary		Gets all schools by similar name
//	@Description	Gets a school by its name
//	@Tags			search
//	@Accept			json
//	@Produce		json
//	@Param			q	query		string	true	"School Name"
//	@Success		200	{string}	string	map[string]interface{}
//	@Failure		400	{object}	error
//	@Failure		404	{object}	error
//	@Security		ApiKeyAuth
//	@Router			/search/school [get]
func (app *application) getSchoolsHandler(w http.ResponseWriter, r *http.Request) {
	schoolName := r.URL.Query().Get("q")
	if schoolName == "" {
		app.badRequestResponse(w, r, errors.New("missing school name"))
		return
	}

	fq := store.PaginatedFeedQuery{
		Limit:  10,
		Offset: 0,
		Sort:   "desc",
		Search: schoolName,
	}

	fq, err := fq.Parse(r)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	schools, err := app.store.Schools.GetSchools(ctx, fq)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, schools); err != nil {
		app.internalServerError(w, r, err)
	}

}

func (app *application) getRandomSchoolsHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	schools, err := app.store.Schools.GetRandomSchools(ctx, 3)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, schools); err != nil {
		app.internalServerError(w, r, err)
	}
}
