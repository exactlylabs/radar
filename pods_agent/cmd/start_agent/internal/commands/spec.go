package commands

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/alexflint/go-arg"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/exactlylabs/radar/pods_agent/services/bufferedsentry"
	"github.com/exactlylabs/radar/pods_agent/services/filequeue"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

type CommandHandler interface {
	Validate(p *arg.Parser)
	Run(ctx context.Context, c *config.Config) error
}

type subCommands struct {
	Register *RegisterCommand `arg:"subcommand:register"`
	Agent    *RunAgentCommand `arg:"subcommand:agent"`
	Service  *ServiceCommand  `arg:"subcommand:service"`
}

var args struct {
	Version       bool   `arg:"-v,--version"`
	JsonVersion   bool   `arg:"--vv"`
	ConfigFile    string `arg:"-c,--config-file,env:RADAR_CONFIG_PATH" help:"Path to the config.conf file to use. Defaults to the OS UserConfigDir/radar/config.conf"`
	ForcedVersion string `arg:"--set-version" help:"Set the version of the agent. Only works in Development mode."`

	subCommands
}

const (
	defaultCursorFile = "agent_errors.cursor"
	defaultErrorsFile = "agent_errors.log"
)

var defaultCommand = &RunAgentCommand{}

func Run(ctx context.Context) {
	p := arg.MustParse(&args)

	if args.ConfigFile != "" {
		log.Println("Setting Config Path to ", args.ConfigFile)
		config.SetConfigFilePath(args.ConfigFile)
	}
	c := config.LoadConfig()
	queue, err := filequeue.NewFileQueue(config.Join(defaultErrorsFile), config.Join(defaultCursorFile))
	if err != nil {
		panic(err)
	}
	defer queue.Close()

	bufferedsentry.Setup(c.SentryDsn, c.ClientId, info.BuildInfo().Version, c.Environment, "Pods Agent", queue)
	defer sentry.NotifyIfPanic()

	if args.ForcedVersion != "" {
		info.SetVersion(args.ForcedVersion)
	}

	switch {
	case args.Version:
		fmt.Println(sysinfo.Metadata())
	case args.JsonVersion:
		jsonMeta, err := json.Marshal(sysinfo.Metadata())
		if err != nil {
			panic(err)
		}
		fmt.Println(string(jsonMeta))
	case args.Register != nil:
		args.Register.Validate(p)
		args.Register.Run(ctx, c)

	case args.Service != nil:
		args.Service.Validate(p)
		args.Service.Run(ctx, c)

	case args.Agent != nil:
		args.Agent.Validate(p)
		args.Agent.Run(ctx, c)
	default:
		defaultCommand.Validate(p)
		defaultCommand.Run(ctx, c)
	}
}
