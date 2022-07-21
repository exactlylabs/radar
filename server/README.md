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

In order for Image Processing to work correctly, you need to install ImageMagick
locally on the computer running the app. Installation instructions [here](https://imagemagick.org/script/download.php).

### Running

To Run, simply call `rails s` or `rails s -p <port>` in case you already have an app at port 3000 (default)


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
