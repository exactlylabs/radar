# Widget Installation

## Prerequisites

In order for the widget to work on your own website you require a clientId
provided by ExactlyLabs.

If you don't have one, please contact [support@exactlylabs.com](mailto:support@exactlylabs.com?subject=Speedtest Widget Client ID.).

## Embedding

For the embedding process, you need to add some HTML tags to your desired HTML
destination page, in the following order:

```html
<html>
    <head>
        ...
    </head>
    <body>
        ...
        <script type="text/javascript" src="https://speed.radartoolkit.com/widget.js"></script>
        <script>
            SpeedTest.config(configObject);
            SpeedTest.new().mount();
        </script>
    </body>
</html>
```

The `configObject` is the configuration JS object used to set up the widget's initial state and shape.

To have the widget running correctly, these are the different fields that the
`configObject` expects:

| key        | type    | description                                                                                               | required | default |
|------------|---------|-----------------------------------------------------------------------------------------------------------|----------|---------|
| elementId  | string  | DOM element id that should contain the widget                                                             | true     | -       |
| frameStyle | object  | JSON object with custom style for the main frame of the widget. The style is based on "CSS-in-JS" format. | false    | {}      |
| clientId   | string  | Provided client id                                                                                        | true     | -       |
| global     | boolean | Determine if widget instance is global (no test filtering by client id) or not                            | false    | false   |

It is recommended that the `frameStyle` object should at least include fields like `width` and `height`
for the widget to render properly under your desired dimensions, so for example:

```js
frameStyle = {
  width: '500px',
  height: '500px'
}
```

_* We would recommend at least `450px` for both width and height._

So an example `configObject` could be:

```js
const configObject = {
  clientId: 'my-client-id',
  elementId: 'root',
  frameStyle: {
    width: '500px',
    height: '500px',
  },
  global: false
}
```
