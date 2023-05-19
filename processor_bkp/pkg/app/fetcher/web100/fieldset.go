package web100

// fieldSet provides the ordered list of Web100 variable specifications.
type fieldSet struct {
	Fields   []Variable
	FieldMap map[string]int // Map from field name to index in Fields.
	// Total length of each record, in bytes, including preamble, e.g. BEGIN_SNAP_DATA
	// For example, for the standard "/read" snapshot record, the length is 669 bytes.
	Length int
}

// find returns the variable spec of a given name, or nil.
func (fs *fieldSet) find(name string) *Variable {
	index, ok := fs.FieldMap[name]
	if !ok {
		return nil
	}
	return &fs.Fields[index]
}
