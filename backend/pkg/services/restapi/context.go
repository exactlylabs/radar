package restapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/apierrors"
	"github.com/gorilla/mux"
	"golang.org/x/sync/syncmap"
)

type WebContext struct {
	tmpWriter    io.ReadWriter
	Writer       http.ResponseWriter
	Request      *http.Request
	meta         syncmap.Map
	fieldsErrors map[string]apierrors.FieldErrors
	err          *apierrors.APIError
	statusCode   int
	URLParams    map[string]string
}

func NewWebContext() *WebContext {
	return &WebContext{
		meta: syncmap.Map{},
	}
}

func NewTestContext(writer http.ResponseWriter, r *http.Request) *WebContext {
	wc := NewWebContext().PrepareRequest(writer, r)
	return wc
}

func (wc *WebContext) PrepareRequest(w http.ResponseWriter, r *http.Request) *WebContext {
	urlParams := mux.Vars(r)
	if urlParams == nil {
		urlParams = make(map[string]string)
	}
	return &WebContext{
		meta:         wc.meta,
		Writer:       w,
		Request:      r,
		fieldsErrors: make(map[string]apierrors.FieldErrors),
		tmpWriter:    bytes.NewBuffer(nil),
		statusCode:   200,
		URLParams:    urlParams,
	}
}

func (wc *WebContext) AddValue(key string, value any) {
	wc.meta.Store(key, value)
}

func (wc *WebContext) GetValue(key string) (obj any, exists bool) {
	obj, exists = wc.meta.Load(key)
	return
}

func (wc *WebContext) MustGetValue(key string) any {
	obj, exists := wc.GetValue(key)
	if !exists {
		panic(fmt.Errorf("%v not found in the context", key))
	}
	return obj
}

func (wc *WebContext) AddFieldError(field string, err apierrors.FieldErrors) {
	wc.fieldsErrors[field] = err
	wc.statusCode = http.StatusBadRequest
}

func (wc *WebContext) Reject(status int, err *apierrors.APIError) {
	wc.err = err
	wc.statusCode = status
}

func (wc *WebContext) HasErrors() bool {
	return len(wc.fieldsErrors) > 0 || wc.err != nil
}

func (wc *WebContext) JSON(status int, response any) {
	wc.Writer.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(wc.tmpWriter).Encode(response); err != nil {
		panic(errors.Wrap(err, "WebContext#JSON"))
	}
	wc.statusCode = status
}

func (wc *WebContext) Write(data []byte) (int, error) {
	n, err := wc.tmpWriter.Write(data)
	if err != nil {
		return n, errors.Wrap(err, "WebContext#Write")
	}
	return n, nil
}

func (wc *WebContext) Commit() error {
	// WriteHeader should always be called before we Write to the ResponseWriter
	// otherwise the statusCode is set to http.StatusOK and we get warnings
	wc.Writer.WriteHeader(wc.statusCode)
	if wc.err != nil {
		valError := apierrors.RequestError{Errors: []apierrors.APIError{*wc.err}}
		if err := json.NewEncoder(wc.Writer).Encode(valError); err != nil {
			panic(errors.Wrap(err, "WebContext#Commit Encode"))
		}
	} else if len(wc.fieldsErrors) > 0 {
		valError := apierrors.ValidationError{Errors: wc.fieldsErrors}
		if err := json.NewEncoder(wc.Writer).Encode(valError); err != nil {
			panic(errors.Wrap(err, "WebContext#Commit Encode"))
		}
	} else if _, err := io.Copy(wc.Writer, wc.tmpWriter); err != nil {
		return errors.Wrap(err, "WebContext#Commit Copy")
	}
	return nil
}

func (wc *WebContext) SetStatus(status int) {
	wc.statusCode = status
}

func (wc *WebContext) ResponseHeader() http.Header {
	return wc.Writer.Header()
}

func (wc *WebContext) UrlParameters() map[string]string {
	return wc.URLParams
}

func (wc *WebContext) QueryParams() url.Values {
	return wc.Request.URL.Query()
}
