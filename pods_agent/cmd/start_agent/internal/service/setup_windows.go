package service

import (
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"

	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/hectane/go-acl"
	"github.com/kardianos/service"
	"github.com/natefinch/lumberjack"
	"golang.org/x/sys/windows"
)

func Setup() {
	// Before starting, make sure we enable logging for windows
	if !service.Interactive() {
		f := setupLogging()
		defer f.Close()
	}
}

func setupLogging() *os.File {
	p := path.Join(config.BasePath(), "logs.txt")
	f, err := os.OpenFile(p, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Println(fmt.Errorf("error opening file: %w", err))
		panic(err)
	}
	log.SetOutput(&lumberjack.Logger{
		Filename:   p,
		MaxSize:    1,
		MaxBackups: 3,
	})
	return f
}

func setupInstall() {
	// We need to set some permissions, due to windows permission error
	// when running as a LocalService user
	sid, err := windows.CreateWellKnownSid(windows.WinLocalServiceSid)
	if err != nil {
		log.Println(fmt.Sprintf("service.setupInstall sid err: %v", err))
		panic(fmt.Errorf("service.setupInstall sid err: %w", err))
	}
	err = acl.Apply(
		config.BasePath(),
		false,
		false,
		acl.GrantSid(windows.GENERIC_ALL, sid),
	)
	if err != nil {
		// Logs before panic, since panics are not being shown when running as a service
		log.Println(fmt.Sprintf("service.setupInstall err chowning config dir at %s: %v", config.BasePath(), err))
		panic(fmt.Sprintf("service.setupInstall err chowning config dir: %w", err))
	}

	caller, err := os.Executable()
	if err != nil {
		log.Println(fmt.Sprintf("service.setupInstall err obtaining exec path: %v", err))
		panic(fmt.Errorf("service.setupInstall err obtaining exec path: %w", err))
	}

	err = acl.Apply(
		filepath.Dir(caller),
		false,
		false,
		acl.GrantSid(windows.GENERIC_ALL, sid),
	)
	if err != nil {
		log.Println(fmt.Sprintf("service.setupInstall err chowning exec dir at %s: %w", caller, err))
		panic(fmt.Sprintf("service.setupInstall err chowning exec dir at %s: %w", path.Dir(caller), err))
	}

}

func getConfig() *service.Config {
	conf := &service.Config{
		Name:        "radar-agent",
		DisplayName: "Radar Agent",
		Description: "Daemon service responsible for running speedtests",
		UserName:    "NT AUTHORITY\\LocalService",
		Option: map[string]interface{}{
			// Windows configurations
			"OnFailure":              "restart",
			"OnFailureDelayDuration": "10s",
			"Password":               "",
		},
	}
	return conf
}
