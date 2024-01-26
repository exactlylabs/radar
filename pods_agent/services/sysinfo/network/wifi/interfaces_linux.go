package wifi

import (
	"slices"

	"github.com/theojulienne/go-wireless"
)

func WlanInterfaceNames() ([]string, error) {
	names := wireless.InterfacesFromWPARunDir()
	names = append(names, wireless.InterfacesFromSysfs()...)
	slices.Sort[[]string](names)
	names = slices.Compact(names)
	return names, nil
}
