package config

var ProdConfig = &Config{
	Environment: "Prod",
	ServerURL:   "https://pods.radartoolkit.com",
	PingFreq:    "15",
	SentryDsn:   "https://23c5c9069e774f3abda19c4f9993ad93@o1197382.ingest.sentry.io/6369668",
	CRLUrl:      "https://pods.radartoolkit.com/clients/crl",
}
