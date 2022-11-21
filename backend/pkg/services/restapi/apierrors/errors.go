package apierrors

var (
	InternalAPIError APIError = APIError{
		Message: "Internal Server Error",
		Code:    "internal_error",
	}
	MissingFieldError FieldErrors = FieldErrors{
		Errors: []*APIError{
			{Message: "This field is required.", Code: "required"},
		},
	}
)

type APIError struct {
	Message string `json:"message"`
	Code    string `json:"code"`
}

type FieldErrors struct {
	Nested map[string]FieldErrors `json:"nested,omitempty"`
	Errors []*APIError            `json:"errors"`
}

// FieldsValidationError is returned when the API has errors associated to the request content
type FieldsValidationError struct {
	// Errors has dictionary of errors for each field
	Errors map[string]FieldErrors `json:"errors"`
}

// ValidationError is returned when the API has errors not associated with the request content
type ValidationError struct {
	Errors []APIError `json:"errors"`
}

func SingleFieldError(message, code string) FieldErrors {
	return FieldErrors{
		Errors: []*APIError{
			{Message: message, Code: code},
		},
	}
}
