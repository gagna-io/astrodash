const SEEING_ARCSEC = [
  '< 0.5"',
  '0.5–0.75"',
  '0.75–1"',
  '1–1.25"',
  '1.25–1.5"',
  '1.5–2"',
  '2–2.5"',
  '> 2.5"',
];

/** Converts the 7Timer! seeing scale (1–8) to arcseconds. */
export const seeingToArcsec = (value: number) => SEEING_ARCSEC.at(value - 1) ?? "–";

/** Converts the 7Timer! seeing scale (1–8) to the Pickering scale (10 best). */
export const seeingToPickering = (value: number) => 11 - value;
