// Keep this list intentionally small and reviewed. It handles upstream units that
// have champion-shaped records but are not player-acquirable in standard TFT.
export const EXCLUDED_API_NAMES = new Set([
  "TFT_BlueGolem",
  "TFT_TrainingDummy",
]);

export const EXCLUDED_NAME_PATTERN = /(?:training dummy|rift scuttler|target dummy|test unit)/i;

export const NAME_OVERRIDES: Readonly<Record<string, string>> = {};
