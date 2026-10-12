const ZIP_PATTERN = /^\d{3} ?\d{2}$/;

/** Returns the zip code as five digits, or null if it isn't "XXX XX" or "XXXXX". */
export const normalizeZip = (input: string): string | null => {
  const trimmed = input.trim();
  return ZIP_PATTERN.test(trimmed) ? trimmed.replace(" ", "") : null;
};

export const formatZip = (zip: string) => `${zip.slice(0, 3)} ${zip.slice(3)}`;
