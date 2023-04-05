import { Html, Head, Main, NextScript } from 'next/document'
import {widgetJsUrl} from "../src/utils/navigation";

export default function Document() {
  return (
    <Html>
      <Head>
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