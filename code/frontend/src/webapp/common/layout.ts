import type { XYPosition } from "@vue-flow/core";

type HandlePosition = "top" | "bottom" | "left" | "right";

/**
 * Determines connector positions between two nodes based on their coordinates.
 *
 * @returns [HandlePosition, HandlePosition]
 */
export const getHandlePositions = (a: XYPosition, b: XYPosition): [HandlePosition, HandlePosition] => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  // Horizontal connection dominates
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      // B is to the right of A
      return ["right", "left"];
    } else {
      // B is to the left of A
      return ["left", "right"];
    }
  }

  // Vertical connection dominates (or tie)
  if (dy > 0) {
    // B is below A
    return ["bottom", "top"];
  } else {
    // B is above A
    return ["top", "bottom"];
  }
};
