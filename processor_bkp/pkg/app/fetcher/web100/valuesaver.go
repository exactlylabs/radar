package web100

type DataSaver map[string]any

func NewSaver() DataSaver {
	return DataSaver{}
}

func (ds DataSaver) SetInt64(name string, value int64) {
	ds[name] = value
}

func (ds DataSaver) SetString(name string, value string) {
	ds[name] = value
}

func (ds DataSaver) SetBool(name string, value bool) {
	ds[name] = value
}
