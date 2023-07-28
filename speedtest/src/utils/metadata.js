import {getFilterTag} from "./speeds";

export const addMetadataToResults = (originalResults) => {
  return originalResults
    .filter(
      measurement =>
        measurement.latitude &&
        measurement.longitude
    )
    .map(measurement => {
      return {
        ...measurement,
        uploadFilterTag: getFilterTag(measurement.upload_avg, 'upload'),
        downloadFilterTag: getFilterTag(measurement.download_avg, 'download'),
      };
    });
}