package config

import (
	"io/ioutil"
	"os"
	"testing"
)

func createConfig(conf string) {
	SetBasePath("/tmp")
	f, err := os.OpenFile("/tmp/config.conf", os.O_WRONLY|os.O_CREATE, 0660)
	if err != nil {
		panic(err)
	}
	f.WriteString(conf)
	f.Close()
}

func clear() {
	os.Remove("/tmp/config.conf")
}

func TestLoadConfig(t *testing.T) {
	expected := DevConfig
	expected.ServerURL = "127.0.0.1:3001"
	expected.ClientId = "1234"
	expected.Secret = "6666"
	expected.PingFreq = "15"

	conf := `
	server_url=127.0.0.1:3001
	client_id=1234
	secret=6666
	`
	createConfig(conf)
	defer clear()

	c := LoadConfig()
	if *c != *expected {
		t.Fatalf("TestLoadConfig expected %+v but got %+v", *expected, *c)
	}
}

func TestSaveConfig(t *testing.T) {
	expected := `server_url=localhost
client_id=5555
secret=
ping_freq=
last_tested=
last_updated=
last_download_speed=
last_upload_speed=
`
	c := &Config{
		ServerURL: "localhost",
		ClientId:  "5555",
	}
	SetBasePath("/tmp")
	err := Save(c)
	if err != nil {
		t.Fatal(err)
	}
	defer clear()
	f, err := os.Open("/tmp/config.conf")
	if err != nil {
		t.Fatal(err)
	}
	data, err := ioutil.ReadAll(f)
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != expected {
		t.Fatalf("TestSaveConfig expected:\n%v\n\nbut got:\n\n%v", expected, string(data))
	}
}
