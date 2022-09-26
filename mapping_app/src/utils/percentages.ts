export const addPercentages = (percentage1: string, percentage2: string): string => {
  const p1: number = parseInt(percentage1?.split('%')[0] ?? 0);
  const p2: number = parseInt(percentage2?.split('%')[0] ?? 0);
  const sum: string = (p1 + p2).toFixed(1);
  return `${sum}%`;
}

export const isNotZero = (percentage: string): boolean => percentage !== '0.0%';
