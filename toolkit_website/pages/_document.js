import { Html, Head, Main, NextScript } from 'next/document'
import {widgetCssUrl, widgetJsUrl} from "../src/utils/navigation";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel={'stylesheet'} href={widgetCssUrl}/>
        <script type={'text/javascript'} src={widgetJsUrl}></script>
        <title></title>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}