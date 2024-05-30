package commands

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/alexflint/go-arg"
	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/radar"
)

type NetworkInfoArgs struct {
	NetworkId           *int    `arg:"--network-id,env:RADAR_NETWORK_ID"`
	NetworkName         string  `arg:"--network-name,env:RADAR_NETWORK_NAME"`
	NetworkLatitude     float64 `arg:"--network-latitude,env:RADAR_NETWORK_LATITUDE"`
	NetworkLongitude    float64 `arg:"--network-longitude,env:RADAR_NETWORK_LONGITUDE"`
	NetworkAddress      string  `arg:"--network-address,env:RADAR_NETWORK_ADDRESS"`
	NetworkDownloadMbps float64 `arg:"--network-download-mbps,env:RADAR_NETWORK_DOWNLOAD_MBPS"`
	NetworkUploadMbps   float64 `arg:"--network-upload-mbps,env:RADAR_NETWORK_UPLOAD_MBPS"`
}

type RegisterCommand struct {
	AccountToken  string `arg:"--token,env:RADAR_ACCOUNT_TOKEN"`
	PodName       string `arg:"--pod-name,env:RADAR_POD_NAME"`
	RegisterLabel string `arg:"--label,env:RADAR_REGISTER_LABEL"`
	CreateNetwork bool   `arg:"--create-network,env:RADAR_CREATE_NETWORK"`
	Force         bool   `arg:"-f,--force,env:RADAR_FORCE"`
	NetworkInfoArgs
}

func (args RegisterCommand) Description() string {
	return "Register the agent to the Radar Platform, and assign it to an Account and Network."
}

func (args RegisterCommand) Validate(p *arg.Parser) {
	if args.CreateNetwork {
		if args.NetworkName == "" {
			p.Fail("Network name is required when creating a network")
		} else if (args.NetworkLatitude == 0 && args.NetworkLongitude == 0) && args.NetworkAddress == "" {
			p.Fail("At least one of latitude, longitude or address is required when creating a network")
		}
	}
}

func (args RegisterCommand) Run(ctx context.Context, c *config.Config) {
	cli := radar.NewClient(c.ServerURL, c.ClientId, c.Secret)
	pod := &agent.PodInfo{}
	var err error

	if c.ClientId != "" && !args.Force {
		log.Println("Client ID already exists in config file, skipping registration")
		return
	}

	log.Println("Registering Agent to Radar Platform")
	podInfo := agent.RegisterPodInfo{}
	if args.PodName != "" {
		podInfo.Name = &args.PodName
	}
	if args.RegisterLabel != "" {
		podInfo.Label = &args.RegisterLabel
	}

	pod, err = cli.Register(podInfo)
	if err != nil {
		panic(err)
	}
	c.ClientId = pod.ClientId
	c.Secret = pod.Secret

	if args.AccountToken != "" {
		var network *agent.NetworkData
		if args.CreateNetwork {
			network = &agent.NetworkData{
				ID:           args.NetworkId,
				Name:         args.NetworkName,
				Latitude:     args.NetworkLatitude,
				Longitude:    args.NetworkLongitude,
				Address:      args.NetworkAddress,
				DownloadMbps: args.NetworkDownloadMbps,
				UploadMbps:   args.NetworkUploadMbps,
			}
		}

		pod, err = cli.AssignPodToAccount(args.AccountToken, network)
		if err != nil {
			panic(err)
		}
		pod.Secret = c.Secret
	}

	if err := config.Save(c); err != nil {
		panic(err)
	}

	if pod.Id != 0 {
		data, _ := json.Marshal(pod)
		fmt.Println(string(data))
	}
}
