//go:build development

package bufferedsentry

func init() {
	// Build without Sentry configured, for Development purposes
	disabled = true
}
