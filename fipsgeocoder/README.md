# FIPS Geocoder

This is a simple service that exposes and endpoint to obtain the fips code based on a lat/long


## Setup

Since we user a private module, first you need to configure the following:


### Set a GOPRIVATE variable

In your .bashrc or similar, do the following:

```sh
GOPRIVATE=github.com/exactlylabs/*
```


This ensures that all modules related to exactlylabs are marked as private, so GO can understand that it should go directly to the github page, instead of trying to find in a "cached" version that the language maintainers maintain.


### Configure your git 

Golang will try to connect to the private modules through an https connection. In order to have access to these private repos, you need to tell git to use an access token instead of simply trying to access directly, without it.

First, make sure to obtain an access token:
* Go to your github settings (yours, not the project's) and go to the developer settings -> Personal Access Tokens
* Make sure to mark the whole **repo** scopes


Now, with your access token configured, you can call:

```sh
git config --global url.https://<your_access_token>@github.com/exactlylabs/.insteadof https://github.com/exactlylabs/
```

## Build

### Docker Image

To build this app for deployment, you need to build a Docker image. 

First, make sure to generate the shape files through `get_shapes.sh`. Then, run:

```sh
DOCKER_BUILDKIT=1 docker build --secret id=gitconfig,src=~/.gitconfig -f deploy/Dockerfile -t fipsgeocoder:latest .
```

The command above expects you to have a .gitconfig in your home directory. That file has the configuration (`git config --global ...`) done at the `Setup` step.


To make things easier, you can simply call:

```sh
./scripts/build_image.sh <github_access_token>
```

It will download the shape files, generate a temporary .gitconfig and build the image.
