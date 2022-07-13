package web100

// The Saver interface decouples reading data from the web100 log files and
// saving those values.
type Saver interface {
	SetInt64(name string, value int64)
	SetString(name string, value string)
	SetBool(name string, value bool)
}
