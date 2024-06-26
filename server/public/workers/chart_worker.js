// this dedicated worker is used to parse the chart data
// received via postMessage as a stringified JSON object
// and then send the parsed data back to the main thread

self.onmessage = async function(event) {
  self.postMessage(JSON.parse(event.data));
}