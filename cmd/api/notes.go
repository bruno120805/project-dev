package main

import (
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/bruno120805/project/internal/store"
	"github.com/go-chi/chi/v5"
)

type CreateNotePayload struct {
	Content     string   `json:"content" validate:"required"`
	Subject     string   `json:"subject" validate:"required"`
	Title       string   `json:"title" validate:"required"`
	FilesURL    []string `json:"files_url"`
	ProfessorID int64    `json:"professor_id"`
}

// CreateNote godoc
//
//	@Summary		Creates a note
//	@Description	Creates a note where the user can upload files
//	@Tags			notes
//	@Accept			json
//	@Produce		json
//	@Param			professorID	path		int	true	"professor ID"
//	@Success		200			{object}	CreateNotePayload
//
// Failure 400 {object} error
// Failure 404 {object} error
// Failure 500 {object} error
//
//	@Security		ApiKeyAuth
//	@Router			/notes/{professorID} [post]
func (app *application) createNoteHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("createNoteHandler")
	var payload CreateNotePayload
	professorID, err := strconv.ParseInt(chi.URLParam(r, "professorID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	if _, err = app.store.Professors.GetByID(ctx, professorID); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			app.notFoundResponse(w, r, err)
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	err = r.ParseMultipartForm(maxFileSize)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	payload.Content = r.FormValue("content")
	payload.Subject = r.FormValue("subject")
	payload.Title = r.FormValue("title")

	if err = Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	files := r.MultipartForm.File["files"]
	if len(files) == 0 {
		app.badRequestResponse(w, r, fmt.Errorf("no files uploaded"))
		return
	}

	user := app.getUserFromCtx(r)

	var fileURLs []string

	for _, handler := range files {
		if handler == nil {
			app.badRequestResponse(w, r, fmt.Errorf("no file handler provided"))
			return
		}

		if handler.Filename == "" {
			app.badRequestResponse(w, r, fmt.Errorf("no file name provided"))
			return
		}

		if !isValidExtension(handler.Filename) {
			app.badRequestResponse(w, r, fmt.Errorf("invalid file extension"))
			return
		}

		if handler.Size > maxFileSize {
			app.badRequestResponse(w, r, fmt.Errorf("file too large"))
			return
		}

		file, err := handler.Open()
		if err != nil {
			app.badRequestResponse(w, r, err)
			return
		}
		defer file.Close()

		key := handler.Filename

		err = app.uploader.UploadFile(app.config.uploader.bucket, key, file)
		if err != nil {
			app.badRequestResponse(w, r, err)
			return
		}

		// save URL to database

		fileURL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", app.config.uploader.bucket, key)
		fileURLs = append(fileURLs, fileURL)

	}
	note := &store.Note{
		Content:     payload.Content,
		Subject:     payload.Subject,
		Title:       payload.Title,
		FilesURL:    fileURLs,
		ProfessorID: professorID,
	}

	err = app.store.Notes.Create(ctx, user.ID, note)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, note); err != nil {
		app.internalServerError(w, r, err)
	}
}

func isValidExtension(fileName string) bool {
	allowedExtensions := map[string]bool{
		"jpg":  true,
		"jpeg": true,
		"png":  true,
		"pdf":  true,
	}

	ext := strings.ToLower(filepath.Ext(fileName))
	if len(ext) > 1 {
		ext = ext[1:] // remove the dot ".png" => "png"
	}

	return allowedExtensions[ext]
}

func (app *application) getNotesHandler(w http.ResponseWriter, r *http.Request) {
	professorID, err := strconv.ParseInt(chi.URLParam(r, "professorID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	notes, err := app.store.Notes.GetNotes(ctx, professorID)
	if err != nil {
		app.notFoundResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, notes); err != nil {
		app.internalServerError(w, r, err)
	}
}

func (app *application) getNoteByID(w http.ResponseWriter, r *http.Request) {
	noteID, err := strconv.ParseInt(chi.URLParam(r, "noteID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	note, err := app.store.Notes.GetNoteByID(ctx, noteID)
	if err != nil {
		app.notFoundResponse(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, note); err != nil {
		app.internalServerError(w, r, err)
	}
}

func (app *application) deleteNoteHandler(w http.ResponseWriter, r *http.Request) {
	noteID, err := strconv.ParseInt(chi.URLParam(r, "noteID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	ctx := r.Context()

	note, err := app.store.Notes.GetNoteByID(ctx, noteID)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := app.getUserFromCtx(r)

	if note.UserID != user.ID {
		app.unauthorizedResponse(w, r, fmt.Errorf("unauthorized"))
		return
	}

	if err := app.store.Notes.Delete(ctx, noteID); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// delete files from s3
	for _, fileURL := range note.FilesURL {
		key := filepath.Base(fileURL)
		if err := app.uploader.DeleteFile(app.config.uploader.bucket, key); err != nil {
			app.internalServerError(w, r, err)
			return
		}
	}
}
