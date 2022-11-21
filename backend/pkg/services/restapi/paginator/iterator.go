package paginator

type Iterator[T any] interface {
	HasNext() bool
	GetRow() (T, error)
	Count() (uint64, error)
}
