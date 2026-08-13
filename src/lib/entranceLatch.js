export function createEntranceLatch() {
  let state = "idle";

  return {
    shouldAnimate(enabled, reducedMotion) {
      if (state !== "idle") return false;
      if (!enabled || reducedMotion) {
        state = "complete";
        return false;
      }
      state = "pending";
      return true;
    },
    complete() {
      if (state === "pending") state = "complete";
    },
    cancel() {
      if (state === "pending") state = "idle";
    },
  };
}
