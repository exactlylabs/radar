import {getFilterTag} from "./speeds";

export const addMetadataToResults = (originalResults) => {
  return originalResults
    .filter(
      measurement =>
        measurement.latitude &&
        measurement.longitude &&
        measurement.download_avg &&
        measurement.upload_avg
    )
    .map(measurement => {
      return {
        ...measurement,
        uploadFilterTag: getFilterTag(measurement.upload_avg, 'upload'),
        downloadFilterTag: getFilterTag(measurement.download_avg, 'download'),
      };
    });
}