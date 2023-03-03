package apierrors

var (
	InternalAPIError APIError = APIError{
		Message: "Internal Server Error",
		Code:    "internal_error",
	}
	MissingFieldError APIError = APIError{
		Message: "This field is required.",
		Code:    "required",
	}
)

type APIError struct {
	Message string `json:"message"`
	Code    string `json:"code"`
}

type FieldErrors []APIError

// RequestError is returned when the API has errors not associated with the request content
type RequestError struct {
	Message string                 `json:"message"`
	Code    string                 `json:"status"`
	Errors  map[string]FieldErrors `json:"errors,omitempty"`
}

func SingleFieldError(message, code string) FieldErrors {
	return FieldErrors{
		{Message: message, Code: code},
	}
}
