/**
 * Method to normalize speed test download/upload results to fit inside our
 * custom Gauge values as they aren't mapped 1:1 to their specific "circular" position.
 * There was no equation used for the values themselves, they are the result of testing
 * for visual correspondence between the gauge fill and its expected position relative
 * to the gauge value itself.
 * @param originalValue: Actual download/upload result in Mbps.
 * @returns {number|*} normalized.
 */
export const normalizeValue = originalValue => {
  if(originalValue <= 20) {
    return originalValue * 2.5;
  } else if(originalValue > 20 && originalValue <= 25) {
    return originalValue * 2.3;
  } else if(originalValue > 25 && originalValue <= 30) {
    return originalValue * 2;
  } else if(originalValue > 30 && originalValue <= 35) {
    return originalValue * 1.9;
  } else if(originalValue > 35 && originalValue <= 40) {
    return originalValue * 1.7;
  } else if(originalValue > 40 && originalValue <= 45) {
    return originalValue * 1.55;
  } else if(originalValue > 45 && originalValue <= 50) {
    return originalValue * 1.5;
  } else if(originalValue > 50 && originalValue <= 55) {
    return originalValue * 1.42;
  } else if(originalValue > 55 && originalValue <= 60) {
    return originalValue * 1.35;
  } else if(originalValue > 60 && originalValue <= 65) {
    return originalValue * 1.25;
  } else if(originalValue > 65 && originalValue <= 70) {
    return originalValue * 1.22;
  } else if(originalValue > 70 && originalValue <= 75) {
    return originalValue * 1.17;
  } else if(originalValue > 75 && originalValue <= 80) {
    return originalValue * 1.15;
  } else if(originalValue > 80 && originalValue <= 85) {
    return originalValue * 1.1;
  } else if(originalValue > 85 && originalValue <= 90) {
    return originalValue * 1.07;
  } else if(originalValue > 90 && originalValue <= 95) {
    return originalValue * 1.03;
  } else {
    return originalValue;
  }
}