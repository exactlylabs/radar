# Radar Project

The project contains multiple tools, each in its own folder:

1. agent:
    * A Golang project responsible to communicate with the webserver and aimed to be installed in the pods

2. server:
    * Ruby on Rails webservice with backend/frontend of the radar project


## Scripts

* The first iteration of the agent is located at `setupscripts`. That folder has the shell scripts used to run both ping and speedtest, as well as the imageing process used at the time.
* The new image generation process is located at `scripts` folder

## Run

To run all projects, just call `make run` inside the root directory or, in case you want to run them separatedly, call make run inside each project's directory