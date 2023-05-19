# Radar public website

### Context

The idea behind this website is to showcase all
Radar-related apps at the moment (Pods, Speedtest and Mapping) through a 
basic client-only webapp.

### Local build

In order to run the app locally, run the 
following commands on the root directory:  

```
$ npm i
$ npm run dev
```

This will execute the app on port 3000 by default, so you can access through any web browser at http://localhost:3000.

### Production build

In order to manually create a production-ready
build of the project, run the following command
in the root directory:

```
$ npm run build
```

This will output all files to the `/dist` directory.