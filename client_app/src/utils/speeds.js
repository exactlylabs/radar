export const DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD = {
  HIGH: 99,
  MID: 19,
};

export const UPLOAD_SPEED_LOW_TO_MID_THRESHOLD = {
  HIGH: 19,
  MID: 2,
};

export const SPEED_FILTERS = {
  LOW: 'low',
  MID: 'mid',
  HIGH: 'high',
};

export const DOWNLOAD_RANGES = [
  [0, DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID],
  [DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID, DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH],
  [DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH, Number.MAX_VALUE],
];

export const UPLOAD_RANGES = [
  [0, UPLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID],
  [UPLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID, UPLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH],
  [UPLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH, Number.MAX_VALUE],
];

export const DOWNLOAD_LOW = 'download-low';
export const DOWNLOAD_MID = 'download-mid';
export const DOWNLOAD_HIGH = 'download-high';
export const UPLOAD_LOW = 'upload-low';
export const UPLOAD_MID = 'upload-mid';
export const UPLOAD_HIGH = 'upload-high';

export const DOWNLOAD_FILTER_TAGS = [DOWNLOAD_LOW, DOWNLOAD_MID, DOWNLOAD_HIGH];
export const UPLOAD_FILTER_TAGS = [UPLOAD_LOW, UPLOAD_MID, UPLOAD_HIGH];

export const getCorrespondingFilterTag = (type, filterIndex) => {
  return type === 'download' ? DOWNLOAD_FILTER_TAGS[filterIndex] : UPLOAD_FILTER_TAGS[filterIndex];
};

export const getFilterTag = (value, type) => {
  if (type === 'download') {
    if (value >= DOWNLOAD_RANGES[0][0] && value < DOWNLOAD_RANGES[0][1] + 1) {
      return DOWNLOAD_LOW;
    } else if (value >= DOWNLOAD_RANGES[1][0] && value < DOWNLOAD_RANGES[1][1] + 1) {
      return DOWNLOAD_MID;
    } else {
      return DOWNLOAD_HIGH;
    }
  } else {
    if (value >= UPLOAD_RANGES[0][0] && value < UPLOAD_RANGES[0][1] + 1) {
      return UPLOAD_LOW;
    } else if (value >= UPLOAD_RANGES[1][0] && value < UPLOAD_RANGES[1][1] + 1) {
      return UPLOAD_MID;
    } else {
      return UPLOAD_HIGH;
    }
  }
};
