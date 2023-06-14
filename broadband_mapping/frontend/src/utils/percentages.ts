import {GeospaceInfo} from "../api/geospaces/types";

export const addPercentages = (percentage1: string, percentage2: string): string => {
  const p1: number = parseInt(percentage1?.split('%')[0] ?? 0);
  const p2: number = parseInt(percentage2?.split('%')[0] ?? 0);
  const sum: string = (p1 + p2).toFixed(1);
  return `${sum}%`;
}

export const isNotZero = (percentage: string): boolean => percentage !== '0.0%';

export const getPeopleCount = (percentage: number, totalAmount: number): number => Math.ceil(totalAmount * percentage);

export const getUnservedPeopleCount = (speedType: string, selectedGeospaceInfo: GeospaceInfo) => {
  const percentage: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.bad : selectedGeospaceInfo.upload_scores.bad;
  const totalSamples: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.total_samples : selectedGeospaceInfo.upload_scores.total_samples;
  return getPeopleCount(percentage, totalSamples)
}

export const getUnderservedPeopleCount = (speedType: string, selectedGeospaceInfo: GeospaceInfo) => {
  const percentage: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.medium : selectedGeospaceInfo.upload_scores.medium;
  const totalSamples: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.total_samples : selectedGeospaceInfo.upload_scores.total_samples;
  return getPeopleCount(percentage, totalSamples)
}

export const getServedPeopleCount = (speedType: string, selectedGeospaceInfo: GeospaceInfo) => {
  const percentage: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.good : selectedGeospaceInfo.upload_scores.good;
  const totalSamples: number = speedType === 'Download' ? selectedGeospaceInfo.download_scores.total_samples : selectedGeospaceInfo.upload_scores.total_samples;
  return getPeopleCount(percentage, totalSamples)
}