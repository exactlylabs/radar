package display

import "text/template"

var funcMap = template.FuncMap{
	"bold":       bold,
	"red":        red,
	"green":      green,
	"yellow":     yellow,
	"resetColor": resetColor,
}

func bold() string {
	return "\033[1m"
}

func resetColor() string {
	return "\033[0m"
}

func green() string {
	return "\033[32m"
}

func yellow() string {
	return "\033[1;33m"
}

func red() string {
	return "\033[31m"
}
