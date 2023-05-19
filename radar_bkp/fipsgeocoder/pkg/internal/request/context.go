package request

const (
	RequiredErrMessage = "this field is required"
	RequiredErrCode    = "required"
)

type ErrorMessage struct {
	Message string `json:"message"`
	Code    string `json:"code"`
}

type RequestContext struct {
	errors map[string][]ErrorMessage
}

func NewRequestContext() *RequestContext {
	return &RequestContext{
		errors: make(map[string][]ErrorMessage, 0),
	}
}

func (r *RequestContext) AddFieldError(field, message, code string) {
	r.errors[field] = append(r.errors[field], ErrorMessage{
		message, code,
	})
}

func (r *RequestContext) HasErrors() bool {
	return len(r.errors) > 0
}

func (r *RequestContext) Errors() map[string][]ErrorMessage {
	return r.errors
}
