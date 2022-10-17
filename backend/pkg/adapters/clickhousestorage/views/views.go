package views

import (
	_ "embed"
)

//go:embed summary_alltime.sql
var summaryAlltime string

//go:embed summary_geospace_alltime.sql
var summaryGeospaceAlltime string

//go:embed summary_year.sql
var summaryYear string

//go:embed summary_geospace_year.sql
var summaryGeospaceYear string

//go:embed summary_semester.sql
var summarySemester string

//go:embed summary_geospace_semester.sql
var summaryGeospaceSemester string

//go:embed summary_month.sql
var summaryMonth string

//go:embed summary_geospace_month.sql
var summaryGeospaceMonth string

//go:embed summary_week.sql
var summaryWeek string

//go:embed summary_geospace_week.sql
var summaryGeospaceWeek string

//go:embed us_asns.sql
var usAsns string

// maps all views that should be created at each update
var MaterializedViews = map[string]string{
	"summary_alltime":           summaryAlltime,
	"summary_geospace_alltime":  summaryGeospaceAlltime,
	"summary_year":              summaryYear,
	"summary_geospace_year":     summaryGeospaceYear,
	"summary_semester":          summarySemester,
	"summary_geospace_semester": summaryGeospaceSemester,
	"summary_month":             summaryMonth,
	"summary_geospace_month":    summaryGeospaceMonth,
	"summary_week":              summaryWeek,
	"summary_geospace_week":     summaryGeospaceWeek,
	"us_asns":                   usAsns,
}

var ViewsCreationOrder = []string{
	"summary_alltime", "summary_geospace_alltime", "summary_year",
	"summary_geospace_year", "summary_semester", "summary_geospace_semester",
	"summary_month", "summary_geospace_month", "summary_week",
	"summary_geospace_week", "us_asns",
}
