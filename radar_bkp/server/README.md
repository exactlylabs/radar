# Radar Server


## Objective

The Radar server is a ruby on rails application. It handles both frontend and backend, specially the backend where the golang agent will connect to.

On this application it's possible to manage pods as well as upgrade them


### Setup

First, make sure to you have ruby (We recommend using rvm) installed.

Then run:

```
bundle install
rails db:create db:migrate db:seed
```

you also need to run a script that is going to download some necessary files

`MAXMIND_KEY=<your token> ./scripts/setup.sh`

>Note: For downloading IPV4/IPV6 to ASN map you must have a [Maxmind](https://www.maxmind.com/) License Key and set it as an environment variable named `MAXMIND_KEY`

In order for Image Processing to work correctly, you need to install ImageMagick
locally on the computer running the app. Installation instructions [here](https://imagemagick.org/script/download.php).

#### RGeo and PostGIS

We use RGeo, along with Postgis to handle geographic filters. There's some dependencies that you need to make sure that are installed in order for this feature to work

* [GEOS](https://github.com/rgeo/rgeo/blob/main/doc/Installing-GEOS.md)

* [PostGIS](https://postgis.net/install/)
  * You don't need to run the `CREATE EXTENSION part`, only install the plugin so that your postgres is aware of it



### Running

To Run, simply call `foreman start -f Procfile.dev`


### Upgrading Agents

You can manage the upgrade of all registered pods through this application. To do that, we have two entities: `ClientVersion` and `UpdateGroup`.


#### Managing Versions

`ClientVersion` maps a built version with a signed binary, generated through the agent project. Each version should have an unique identifier (eg: 1.0.0).
Currently there is no interface to handle the versions, to create and store a signed binary. All is done through the rails console `rails c`:

##### Example of creating a new version

Here, we create a version called "1.0.0" and the attach a binary we have locally there

```ruby
v = ClientVersion.new version: "1.0.0"
v.signed_binary.attach({io: File.open("/path/to/radar_agent_signed"), filename: "radar_agent_signed"})
v.save
```

#### Managing Update Groups

To avoid having all agents downloading the same version at once, each client should be included into an `UpdateGroup` and this `UpdateGroup` will have a version set on it. This way, we can create groups such as "Testers Group" and any other kind of version segregation we might want to do.

To create a group, simply run

```ruby
ug = UpdateGroup.create name: "Testers" client_version: v
```

#### Adding a Client to an Update Group

Finally, once we have the group and version set, just add the clients to this group

```ruby
c = Client.first
c.update_group = ug
c.save
```

That's it, now this client will start receiving updates if it's version doesn't match the one registered at the `UpdateGroup` instance
