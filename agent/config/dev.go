package config

var DevConfig = &Config{
	ServerURL: "http://127.0.0.1:3000",
	PingFreq:  "15",
	SentryDsn: "",
	CRLUrl:    "file://./dist/certs/rootCRL.crl.pem",
}
