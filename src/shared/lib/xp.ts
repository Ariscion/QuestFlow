export const XP_VALUES = {
  storeRedirect: 10,
  addToLibrary: 150,
} as const;

export const XP_LEVELING = {
  initialLevel: 1,
  initialThreshold: 1000,
  thresholdMultiplier: 1.5,
} as const;

export type XpProgressState = {
  userXP: number;
  userLevel: number;
  xpToNextLevel: number;
};

export function getNextLevelThreshold(currentThreshold: number): number {
  return Math.floor(currentThreshold * XP_LEVELING.thresholdMultiplier);
}

export function applyXpGain(state: XpProgressState, gainedXp: number): XpProgressState {
  const totalXp = state.userXP + gainedXp;
  if (totalXp < state.xpToNextLevel) {
    return {
      ...state,
      userXP: totalXp,
    };
  }

  return {
    userXP: totalXp - state.xpToNextLevel,
    userLevel: state.userLevel + 1,
    xpToNextLevel: getNextLevelThreshold(state.xpToNextLevel),
  };
}

export const XP_ACTIONS_UI = [
  { key: "help.xp.actions.redirect", xp: XP_VALUES.storeRedirect },
  { key: "help.xp.actions.add", xp: XP_VALUES.addToLibrary },
] as const;
