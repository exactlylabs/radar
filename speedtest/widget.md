# Widget installation

## Prerequisites

In order for the widget to work on your own website you require a clientId
provided by ExactlyLabs.

## Embedding

For the embedding process, you need to add some HTML tags to your desired HTML
destination page, in the following order:

```html
<html>
    <head>
        ...
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css"
              integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=="
              crossorigin=""/>
        <link rel="stylesheet" href="https://speed.radartoolkit.com/widget.css"/>
    </head>
    <body>
        ...
        <script type="text/javascript" src="https://speed.radartoolkit.com/widget.js"></script>
    </body>
    <script>
        SpeedTest.config(configObject);
        SpeedTest.new().mount();
    </script>
</html>
```

The `configObject` is the configuration JSON object to setup the widget's initial state and shape.

To have the widget running correctly, these are the different fields that the
`configObject` expects:

| key        | type    | description                                                                                              | required |
| ---------- | ------- |----------------------------------------------------------------------------------------------------------|----------|
| widgetMode | boolean | Turn on if using in widget mode, embedded                                                                | false    |
| elementId  | string  | DOM element id that should contain the widget                                                            | true     |
| frameStyle | object  | JSON object with custom style for the main frame of the widget. The style is based on "CSS-in-JS" format. | false    |
| clientId   | string  | Provided client id                                                | true     |

So an example `configObject` could be:

```js
configObject = {
  clientId: 'my-client-id',
  elementId: 'root',
  widgetMode: true,
  frameStyle: {
    width: '500px',
    height: '500px',
  }
}
```
