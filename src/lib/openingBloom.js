export const OPENING_BLOOM_STORAGE_KEY = "xue-studio:opening-bloom:played";
const DOCUMENT_PATH_SUFFIX = ":document-path";

export function hasOpeningBloomPlayed(storage, key = OPENING_BLOOM_STORAGE_KEY) {
  try {
    return storage?.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function markOpeningBloomPlayed(storage, key = OPENING_BLOOM_STORAGE_KEY) {
  try {
    storage?.setItem(key, "1");
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function recordOpeningBloomDocumentPath(storage, pathname, key = OPENING_BLOOM_STORAGE_KEY) {
  try {
    const pathKey = `${key}${DOCUMENT_PATH_SUFFIX}`;
    const previousPath = storage?.getItem(pathKey) ?? null;
    storage?.setItem(pathKey, pathname || "/");
    return previousPath;
  } catch {
    return null;
  }
}

export function shouldPlayOpeningBloom(
  storage,
  previousDocumentPath = null,
  pathname = "/",
  key = OPENING_BLOOM_STORAGE_KEY,
) {
  try {
    if (previousDocumentPath === pathname) return true;
    return !hasOpeningBloomPlayed(storage, key);
  } catch {
    return true;
  }
}

export function isOpeningBloomActivationKey(key) {
  return key === "Enter" || key === " ";
}

export function getNextOpeningBloomPhase(phase, event) {
  if (event === "finish" && phase !== "complete") return "complete";
  if (event === "activate" && (phase === "arriving" || phase === "ready")) return "revealing";
  if (event === "arrive" && phase === "idle") return "arriving";
  if (event === "ready" && phase === "arriving") return "ready";
  return phase;
}
