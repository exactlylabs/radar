package info

import (
	"fmt"
	"regexp"
	"strconv"
	"time"
)

type buildTime string

func (b buildTime) Time() time.Time {
	if b == "Dev" {
		return time.Now()
	}
	t, err := time.Parse("200601021504", string(b))
	if err != nil {
		panic(fmt.Errorf("wrong build time: %w", err))
	}
	return t
}

// Versioning of the Binary
var version = "Dev"
var builtAt = "Dev"
var commit = "Dev"

type Info struct {
	Version   string    `json:"version"`
	Commit    string    `json:"commit"`
	BuildTime buildTime `json:"build_time"`
}

// BuildInfo returns the App build information
func BuildInfo() *Info {
	return &Info{
		Version:   version,
		Commit:    commit,
		BuildTime: buildTime(builtAt),
	}
}

func (i *Info) String() string {
	return fmt.Sprintf(`Radar Agent
* Version: %v
* Commit: %v
* BuildTime: %v`, i.Version, i.Commit, i.BuildTime.Time())
}

func (i *Info) getVersionCategory(cat string) int {
	r := regexp.MustCompile(`[vV]?(?P<major>\d+)\.(?P<minor>\d+)\.(?P<patch>\d+)`)
	matches := r.FindStringSubmatch(i.Version)
	idx := r.SubexpIndex(cat)
	if idx == -1 {
		panic(fmt.Errorf("%v category not found in the regexp for %s", cat, i.Version))
	}
	strNumber := matches[idx]
	num, err := strconv.Atoi(strNumber)
	if err != nil {
		panic(fmt.Errorf("wrong %v version %v: %w", cat, strNumber, err))
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
	return version == "Dev"
}
