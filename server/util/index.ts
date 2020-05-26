/**
 * Timeout wraper
 * @param ms timeout ms
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};
