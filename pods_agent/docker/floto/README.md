# FLOTO Docker Image

## Usage

This image is intended to run the Radar Agent service in a FLOTO device.

FLOTO devices make available persistent volumes in the `/public/` folder inside the Container.
This image makes use of that to store the config file, which has to be persisted otherwise every new run it will register the pod again.

## Configuration

The agent configuration is done through environment variables, where it lets you assign the pod to an account, add a label to it, and optionally assign it to a Network (new or existing).


If nothing is given, the pod just registers itself, and it's up to you to claim it through the ClientID displayed in the logs.


Following is a list of the variables that can be set:

* RADAR_POD_NAME: When registering, it can set the pod name to a specific name

* RADAR_ACCOUNT_TOKEN: When registering, assign the pod to the user-account that owns the token

* RADAR_REGISTER_LABEL*: Set a label in the pod when it is registered, to help trace it

* RADAR_NETWORK_ID*: Set to assign to an existing Network

* RADAR_NETWORK_NAME*: Set the name of the Network to be created

* RADAR_NETWORK_LATITUDE*: Set the latitude of the Network to be created. If not set, RADAR_NETWORK_ADDRESS is required

* RADAR_NETWORK_LONGITUDE*: Set the longitude of the Network to be created. If not set, RADAR_NETWORK_ADDRESS is required

* RADAR_NETWORK_ADDRESS*: Set the address of the Network to be created. If not set, RADAR_LONGITUDE, and RADAR_LATITUDE are required.


\*Can only be set if RADAR_ACCOUNT_TOKEN is set
