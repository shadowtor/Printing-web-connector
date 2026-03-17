import type { TimelapseVisibility } from "./timelapse.js";

export function buildVisibilityPolicy(isSuccessful: boolean, approved: boolean): TimelapseVisibility {
  return {
    internalVisible: true,
    customerVisible: isSuccessful || approved
  };
}
