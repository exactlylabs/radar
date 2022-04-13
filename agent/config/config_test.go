package config

import (
	"io/ioutil"
	"os"
	"testing"
)

func createConfig(conf, path string) {
	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0660)
	if err != nil {
		panic(err)
	}
	f.WriteString(conf)
	f.Close()
	os.Setenv("CONF_FILE_PATH", path)
}

func clear(path string) {
	os.Remove(path)
}

func TestLoadConfig(t *testing.T) {
	expected := &Config{
		ServerURL: "127.0.0.1:3001",
		ClientId:  "1234",
		Secret:    "6666",
		TestFreq:  "600",
	}

	conf := `
	server_url=127.0.0.1:3001
	client_id=1234
	secret=6666
	test_freq=600
	`
	createConfig(conf, "/tmp/tmp_config.conf")
	defer clear("/tmp/tmp_config.conf")

	c := LoadConfig()
	if *c != *expected {
		t.Fatalf("TestLoadConfig expected %+v but got %+v", *expected, *c)
	}
}

func TestSaveConfig(t *testing.T) {
	expected := `server_url=localhost
client_id=5555
secret=
test_freq=
last_tested=
`
	c := &Config{
		ServerURL: "localhost",
		ClientId:  "5555",
	}
	os.Setenv("CONF_FILE_PATH", "/tmp/test_save.conf")
	err := Save(c)
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		os.Remove("/tmp/test_save.conf")
	}()
	f, err := os.Open("/tmp/test_save.conf")
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
