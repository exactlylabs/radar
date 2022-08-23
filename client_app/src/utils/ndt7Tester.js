/**
 * All minified versions of each client + runner config
 * can be found in official NDT7 repository:
 * https://github.com/m-lab/ndt7-js
 */

export const downloadWorkerUrl = URL.createObjectURL(
  new Blob(
    [
      '"undefined"==typeof WebSocket&&(global.WebSocket=require("isomorphic-ws"));const workerMain=function(e){"use strict";const n=e.data["///ndt/v7/download"],o=new WebSocket(n,"net.measurementlab.ndt.v7");let t=()=>(new Date).getTime();"undefined"!=typeof performance&&void 0!==performance.now&&(t=()=>performance.now()),downloadTest(o,postMessage,t)},downloadTest=function(e,n,o){e.onclose=function(){n({MsgType:"complete"})},e.onerror=function(e){n({MsgType:"error",Error:e})};let t=o(),s=t,a=0;e.onopen=function(){t=o(),s=t,a=0,n({MsgType:"start",Data:{ClientStartTime:t}})},e.onmessage=function(e){a+=void 0!==e.data.size?e.data.size:e.data.length;const r=o();r-s>250&&(n({MsgType:"measurement",ClientData:{ElapsedTime:(r-t)/1e3,NumBytes:a,MeanClientMbps:a/(r-t)*.008},Source:"client"}),s=r),"string"==typeof e.data&&n({MsgType:"measurement",ServerMessage:e.data,Source:"server"})}};"undefined"!=typeof self?self.onmessage=workerMain:void 0!==this?this.onmessage=workerMain:"undefined"!=typeof onmessage&&(onmessage=workerMain);',
    ],
    { type: 'text/javascript' }
  )
);

export const uploadWorkerUrl = URL.createObjectURL(
  new Blob(
    [
      '"undefined"==typeof WebSocket&&(global.WebSocket=require("isomorphic-ws"));const workerMain=function(e){const n=e.data["///ndt/v7/upload"],t=new WebSocket(n,"net.measurementlab.ndt.v7");let o=()=>(new Date).getTime();"undefined"!=typeof performance&&void 0!==performance.now&&(o=()=>performance.now()),uploadTest(t,postMessage,o)},uploadTest=function(e,n,t){let o=!1;function r(s,a,i,u,f){if(o)return;const c=t();if(c>=i)return void e.close();const d=s.length>=8388608?1/0:16*s.length;f-e.bufferedAmount>=d&&(s=new Uint8Array(2*s.length));const m=7*s.length;if(e.bufferedAmount<m&&(e.send(s),f+=s.length),c>=u+250){const t=f-e.bufferedAmount,o=(c-a)/1e3;n({MsgType:"measurement",ClientData:{ElapsedTime:o,NumBytes:t,MeanClientMbps:8*t/1e6/o},Source:"client",Test:"upload"}),u=c}setTimeout((()=>r(s,a,i,u,f)),0)}e.onclose=function(){o||(o=!0,n({MsgType:"complete"}))},e.onerror=function(e){n({MsgType:"error",Error:e})},e.onmessage=function(e){void 0!==e.data&&n({MsgType:"measurement",Source:"server",ServerMessage:e.data})},e.onopen=function(){const e=new Uint8Array(8192),o=t(),s=o+1e4;n({MsgType:"start",Data:{StartTime:o/1e3,ExpectedEndTime:s/1e3}}),r(e,o,s,o,0)}};"undefined"!=typeof self?self.onmessage=workerMain:void 0!==this?this.onmessage=workerMain:"undefined"!=typeof onmessage&&(onmessage=workerMain);',
    ],
    { type: 'text/javascript' }
  )
);

export const runnerConfig = {
  userAcceptedDataPolicy: true,
  downloadWorkerFile: downloadWorkerUrl,
  uploadWorkerFile: uploadWorkerUrl,
  metadata: { client_name: 'ndt7-client' },
};