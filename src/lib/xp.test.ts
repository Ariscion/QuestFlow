import { describe, expect, it } from "vitest";

import {
  applyXpGain,
  getNextLevelThreshold,
  XP_LEVELING,
  XP_VALUES,
  type XpProgressState,
} from "./xp";

describe("xp utils", () => {
  it("keeps level when gained XP is below threshold", () => {
    const state: XpProgressState = {
      userXP: 100,
      userLevel: 1,
      xpToNextLevel: XP_LEVELING.initialThreshold,
    };

    const next = applyXpGain(state, XP_VALUES.storeRedirect);

    expect(next).toEqual({
      userXP: 110,
      userLevel: 1,
      xpToNextLevel: XP_LEVELING.initialThreshold,
    });
  });

  it("levels up and carries remainder XP", () => {
    const state: XpProgressState = {
      userXP: 950,
      userLevel: 1,
      xpToNextLevel: XP_LEVELING.initialThreshold,
    };

    const next = applyXpGain(state, XP_VALUES.addToLibrary);

    expect(next).toEqual({
      userXP: 100,
      userLevel: 2,
      xpToNextLevel: 1500,
    });
  });

  it("calculates next threshold with floor", () => {
    expect(getNextLevelThreshold(1000)).toBe(1500);
    expect(getNextLevelThreshold(1500)).toBe(2250);
  });
});

