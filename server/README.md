# Radar Server


## Objective

The Radar server is a ruby on rails application. It handles both frontend and backend, specially the backend where the golang agent will connect to.

On this application it's possible to manage pods as well as upgrade them


### Setup

First, make sure to you have ruby (We recommend using rvm) installed.

Then run:

```
bundle install
rails db:create db:migrate
```