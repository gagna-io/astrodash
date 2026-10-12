/** Approximate southernmost latitude (°N) where aurora is visible, per Kp 0–9. */
const KP_LATITUDES = [66.5, 64.5, 62.4, 60.4, 58.3, 56.3, 54.2, 52.2, 50.1, 48.1];

/** The lowest Kp at which aurora reaches the given latitude. */
export const getKpThreshold = (latitude: number) => {
  const index = KP_LATITUDES.findIndex((boundary) => latitude >= boundary);
  return index === -1 ? 9 : index;
};

/** Kp ranges for low (green), medium (yellow) and high (red) aurora probability at a latitude. */
export const getKpBands = (latitude: number) => {
  const threshold = getKpThreshold(latitude);
  const close = Math.max(threshold - 2, 0);
  return {
    low: { from: 0, to: close },
    medium: { from: close, to: threshold },
    high: { from: threshold, to: 9 },
  };
};
