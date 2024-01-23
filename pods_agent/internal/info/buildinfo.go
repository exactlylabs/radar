package info

import (
	"fmt"
	"os"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

type buildTime string

func (b buildTime) Time() time.Time {
	if b == "Dev" {
		return time.Now()
	}
	t, err := time.Parse("200601021504", string(b))
	if err != nil {
		panic(errors.Wrap(err, "failed to parse build time").WithMetadata(errors.Metadata{"build_time": b}))
	}
	return t
}

// Versioning of the Binary
var version = "Dev"
var builtAt = "Dev"
var commit = "Dev"

// ${GOOS}-${GOARCH}
// In case of $GOARM is set: ${GOOS}-${GOARCH}v${GOARM}
var distribution = "Dev"

type Info struct {
	Version      string    `json:"version"`
	Commit       string    `json:"commit"`
	BuildTime    buildTime `json:"build_time"`
	Distribution string    `json:"distribution"`
}

// BuildInfo returns the App build information
func BuildInfo() *Info {
	return &Info{
		Version:      version,
		Commit:       commit,
		BuildTime:    buildTime(builtAt),
		Distribution: distribution,
	}
}

func (i *Info) String() string {
	return fmt.Sprintf(`Build Information:
* Version: %v
* Commit: %v
* BuildTime: %v
* Distribution: %v`, i.Version, i.Commit, i.BuildTime.Time(), i.Distribution)
}

func (i *Info) getVersionCategory(cat string) int {
	r := regexp.MustCompile(`[vV]?(?P<major>\d+)\.(?P<minor>\d+)\.(?P<patch>\d+)`)
	matches := r.FindStringSubmatch(i.Version)
	idx := r.SubexpIndex(cat)
	if idx == -1 {
		panic(errors.New("%v category not found in the regexp for %s", cat, i.Version))
	}
	strNumber := matches[idx]
	num, err := strconv.Atoi(strNumber)
	if err != nil {
		panic(errors.Wrap(err, "wrong %v version %v", cat, strNumber))
	}
	return num
}

func (i *Info) Major() int {
	return i.getVersionCategory("major")
}

func (i *Info) Minor() int {
	return i.getVersionCategory("minor")
}

func (i *Info) Patch() int {
	return i.getVersionCategory("patch")
}

func IsDev() bool {
	return version == "Dev" || strings.ToLower(os.Getenv("ENVIRONMENT")) == "dev"
}

// SetVersion modifies the binary version constant. Should be used in development mode only.
func SetVersion(v string) {
	version = v
	distribution = fmt.Sprintf("%s-%s", runtime.GOOS, runtime.GOARCH)
}
