# Speedtest app

### Dependencies

#### NDT7 client

In order for the application to run speed tests, we use NDT7's javascript client,
which can be found in https://github.com/m-lab/ndt7-js. The files required from
that repository are `ndt7-download-worker.min.js` and `ndt7-upload-worker.min.js`,
as well as their _non-minified_ versions. In 
case there is a new version of these files present in the actual repository, we
would need to replace both minified workers present in the `ndt7Tester.js`
file, as well as replacing both non-minified versions inside the `ndt7` directory.

### Internal Usage

#### Local build

In order to run the app locally, run the following commands on the root directory:

```
$ npm i
$ npm run start
```

This will execute the app on port 9999 by default, so you can access through any web browser at http://localhost:9999.

#### Production build

In order to create a production ready bundle, run the following command on the root directory:

```
$ npm run build
```

This will output all files to the `/dist` directory. For the widget to be distributable, we need to
share or deploy the following files:

```
widget.js
widget.css
ndt7-download-worker.js
ndt7-upload-worker.js
```

### External usage

For this app to work as an embeddable widget, other developers need to add some lines to their desired
HTML view.

For example, in an `index.html` file:

```
<html>
    <head>
        ...
        <script type="text/javascript" src="path/to/widget.js"></script>
        <link rel="stylesheet" href="path/to/widget.css"/>
    </head>
    <body>
        ...
        <div id="my-widget-wrapper"></div>
        ...
    </body>
    <script>
        SpeedTest.config({
            elementId: 'my-widget-wrapper',
            ...config
        });
        SpeedTest.new().mount();
    </script>
</html>
```

Where the `config` given can have the following attributes:

| key        | type    | description                                                                                               | required |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------- | -------- |
| widgetMode | boolean | Turn on if using in widget mode, embedded                                                                 | true     |
| elementId  | string  | DOM element id that should contain the widget                                                             | true     |
| frameStyle | object  | JSON object with custom style for the main frame of the widget. The style is based on "CSS-in-JS" format. | false    |
| clientId   | string  | Developer id to identify the client using the widget                                                      | true     |
