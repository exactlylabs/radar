package webcontext

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/apierrors"
	"github.com/gorilla/mux"
	"golang.org/x/sync/syncmap"
)

type Context struct {
	tmpWriter    io.ReadWriter
	Writer       http.ResponseWriter
	Request      *http.Request
	meta         syncmap.Map
	fieldsErrors map[string]apierrors.FieldErrors
	err          *apierrors.APIError
	statusCode   int
	URLParams    map[string]string
}

func New() *Context {
	return &Context{
		meta: syncmap.Map{},
	}
}

func NewTestContext(writer http.ResponseWriter, r *http.Request) *Context {
	wc := New().PrepareRequest(writer, r)
	return wc
}

func (wc *Context) PrepareRequest(w http.ResponseWriter, r *http.Request) *Context {
	urlParams := mux.Vars(r)
	if urlParams == nil {
		urlParams = make(map[string]string)
	}
	return &Context{
		meta:         wc.meta,
		Writer:       w,
		Request:      r,
		fieldsErrors: make(map[string]apierrors.FieldErrors),
		tmpWriter:    bytes.NewBuffer(nil),
		statusCode:   200,
		URLParams:    urlParams,
	}
}

func (wc *Context) SetValue(key string, value any) {
	wc.meta.Store(key, value)
}

func (wc *Context) GetValue(key string) (obj any, exists bool) {
	obj, exists = wc.meta.Load(key)
	return
}

func (wc *Context) MustGetValue(key string) any {
	obj, exists := wc.GetValue(key)
	if !exists {
		panic(fmt.Errorf("%v not found in the context", key))
	}
	return obj
}

func (wc *Context) AddFieldError(field string, err apierrors.FieldErrors) {
	wc.fieldsErrors[field] = err
	wc.statusCode = http.StatusBadRequest
}

func (wc *Context) Reject(status int, err *apierrors.APIError) {
	wc.err = err
	wc.statusCode = status
}

func (wc *Context) HasErrors() bool {
	return len(wc.fieldsErrors) > 0 || wc.err != nil
}

func (wc *Context) JSON(status int, response any) {
	wc.Writer.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(wc.tmpWriter).Encode(response); err != nil {
		panic(errors.Wrap(err, "WebContext#JSON"))
	}
	wc.statusCode = status
}

func (wc *Context) Write(data []byte) (int, error) {
	n, err := wc.tmpWriter.Write(data)
	if err != nil {
		return n, errors.Wrap(err, "WebContext#Write")
	}
	return n, nil
}

func (wc *Context) Commit() error {
	// WriteHeader should always be called before we Write to the ResponseWriter
	// otherwise the statusCode is set to http.StatusOK and we get warnings
	wc.Writer.WriteHeader(wc.statusCode)
	if wc.err != nil {
		valError := apierrors.RequestError{
			Message: wc.err.Message,
			Code:    wc.err.Code,
		}
		if err := json.NewEncoder(wc.Writer).Encode(valError); err != nil {
			panic(errors.Wrap(err, "WebContext#Commit Encode"))
		}
	} else if len(wc.fieldsErrors) > 0 {
		valError := apierrors.RequestError{
			Message: "Field validation has failed",
			Code:    "validation_failed",
			Errors:  wc.fieldsErrors,
		}
		if err := json.NewEncoder(wc.Writer).Encode(valError); err != nil {
			panic(errors.Wrap(err, "WebContext#Commit Encode"))
		}
	} else if _, err := io.Copy(wc.Writer, wc.tmpWriter); err != nil {
		return errors.Wrap(err, "WebContext#Commit Copy")
	}
	return nil
}

func (wc *Context) SetStatus(status int) {
	wc.statusCode = status
}

func (wc *Context) ResponseHeader() http.Header {
	return wc.Writer.Header()
}

func (wc *Context) UrlParameters() map[string]string {
	return wc.URLParams
}

func (wc *Context) QueryParams() url.Values {
	return wc.Request.URL.Query()
}
