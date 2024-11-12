import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';

import axios from 'axios';

const MAX_UPLOAD_SIZE = 1 << 20;
const INIT_UPLOAD_SIZE = 1 << 13;

const protocols = ['net.measurementlab.ndt.v7'];

let clientMeasurement: Record<string, any> = {};
let serverMeasurement: Record<string, any> = {};

const getIsolateMessage = (msgType: string, data: any) => ({
  MsgType: msgType,
  Data: data,
});

const getClientMeasurement = (elapsedTime: number, numBytes: number, type: string) => {
  const meanMbps = (numBytes * 8 / 1000) / elapsedTime;
  clientMeasurement = {
    ElapsedTime: elapsedTime,
    NumBytes: numBytes,
    MeanClientMbps: meanMbps,
  };
  return {
    Source: 'client',
    Data: clientMeasurement,
    type,
  };
};

const getServerMeasurement = (measurement: string, type: string) => {
  serverMeasurement = JSON.parse(measurement);
  return {
    Source: 'server',
    Data: serverMeasurement,
    type,
  };
};

const getLastMeasurements = (type: string) => ({
  LastClientMeasurement: clientMeasurement,
  LastServerMeasurement: serverMeasurement,
  type,
});

const getError = (error: any) => ({
  Error: typeof error === 'string' ? error : error.message || 'Unknown Error',
});

const upload = async (
  url: string,
  onMeasurement?: (data: any) => void,
  onCompleted?: (data: any) => void,
  onError?: (error: any) => void
) => {
  try {
    const socket = new WebSocket(url, protocols);
    const startTime = Date.now();
    let bytesSoFar = 0;
    let lastMessageSize = INIT_UPLOAD_SIZE;
    const randomMessage = new Uint8Array(MAX_UPLOAD_SIZE);
    const generateRandomData = () => {
      for (let i = 0; i < MAX_UPLOAD_SIZE; i++) {
        randomMessage[i] = Math.floor(Math.random() * 256);
      }
    };
    generateRandomData();

    socket.onopen = () => {
      const sendChunk = () => {
        if (lastMessageSize >= MAX_UPLOAD_SIZE || lastMessageSize >= bytesSoFar / 16) {
          bytesSoFar += lastMessageSize;
          socket.send(randomMessage.slice(0, lastMessageSize));
        } else {
          lastMessageSize *= 2;
          bytesSoFar += lastMessageSize;
          socket.send(randomMessage.slice(0, lastMessageSize));
        }

        const numBytes = bytesSoFar - lastMessageSize;
        const elapsedTime = Date.now() - startTime;
        const measurement = getClientMeasurement(elapsedTime, numBytes, 'upload');
        onMeasurement?.(measurement);
      };

      const intervalId = setInterval(sendChunk, 100);
      socket.onmessage = (ev:any) => {
        if (typeof ev.data === 'string') {
          const measurement = getServerMeasurement(ev.data, 'upload');
          onMeasurement?.(measurement);
        }
      };
      socket.onclose = () => {
        clearInterval(intervalId);
        const lastMeasurements = getLastMeasurements('upload');
        onCompleted?.(lastMeasurements);
      };
      socket.onerror = (error:any) => {
        clearInterval(intervalId);
        onError?.(getError(error));
      };
    };
  } catch (error) {
    onError?.(getError(error));
    console.log("This is the data thats giving error on upload: ", error)
  }
};

const download = async (
  url: string,
  onMeasurement?: (data: any) => void,
  onCompleted?: (data: any) => void,
  onError?: (error: any) => void
) => {
  try {

    //console.log("Websocket URL: ", url)
    //console.log("protocols ", protocols)

    const socket = new WebSocket(url, protocols);
    const startTime = Date.now();
    let totalBytes = 0;

  

    socket.onmessage = (ev:any) => {
      if (typeof ev.data === 'string') {
        const elapsedTime = Date.now() - startTime;
        const measurement = getClientMeasurement(elapsedTime, totalBytes, 'download');
        onMeasurement?.(measurement);
    
      } else if (ev.data instanceof ArrayBuffer) {
        totalBytes += ev.data.byteLength;
      }
    };
    socket.onclose = () => {
      const lastMeasurements = getLastMeasurements('download');
      onCompleted?.(lastMeasurements);
    };
    socket.onerror = (error:any) => {
      onError?.(getError(error));
    };
  } catch (error) {
    onError?.(getError(error));
    console.log("This is the data thats giving error on download: ", error)
  }
};

const discoverServerURLs = async (config: { protocol?: string } = {}) => {
  const queryParams = {
    client_name: 'react-native-client',
    client_library_name: 'ndt7-react-native',
    client_library_version: '0.0.1',
  };

  const protocol = config.protocol || 'wss';
  const url = `https://locate.measurementlab.net/v2/nearest/ndt/ndt7`;

  try {
    const response = await axios.get(url, { params: queryParams });
    const data = response.data;
    const downloadUrl = data.results[0].urls[`${protocol}:///ndt/v7/download`];
    const uploadUrl = data.results[0].urls[`${protocol}:///ndt/v7/upload`];
    return { error: null, urls: [downloadUrl, uploadUrl] };
  } catch (error:any) {
    return { error: error.toString(), urls: null };
  }
};

const runTest = async ({
  config,
  onMeasurement,
  onCompleted,
  onError,
}: {
  config?: { protocol?: string };
  onMeasurement?: (data: any) => void;
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const response = await discoverServerURLs(config || {});

  //console.log("Response: ", response);

  if (response.error) {
    onError?.(getError(`Could not discover server URLs: ${response.error}`));
    return;
  }

  const [downloadUrl, uploadUrl] = response.urls || [];
  if (downloadUrl) await download(downloadUrl, onMeasurement, onCompleted, onError);
  if (uploadUrl) await upload(uploadUrl, onMeasurement, onCompleted, onError);
};

 
export default runTest;
