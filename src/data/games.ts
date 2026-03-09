export type Game = {
  id: string;
  title: string;
  studio: string;
  genre: string;
  tagline: string;
  playtimeMin: number;
  lastPlayedLabel: string;
  installed: boolean;
  sizeGb: number;
  installPath: string;
};

export const GAMES: Game[] = [
  {
    id: "detroit",
    title: "Detroit: Become Human",
    studio: "Quantic Dream",
    genre: "Story • Sci‑Fi",
    tagline: "Continue your story",
    playtimeMin: 2 * 60 + 13,
    lastPlayedLabel: "Today",
    installed: true,
    sizeGb: 56.4,
    installPath: "D:\\Games\\Detroit",
  },
  {
    id: "satisfactory",
    title: "Satisfactory",
    studio: "Coffee Stain Studios",
    genre: "Factory • Sandbox",
    tagline: "Build bigger",
    playtimeMin: 48,
    lastPlayedLabel: "Today",
    installed: true,
    sizeGb: 18.2,
    installPath: "D:\\SteamLibrary\\steamapps\\common\\Satisfactory",
  },
  {
    id: "hades2",
    title: "Hades II",
    studio: "Supergiant Games",
    genre: "Roguelike • Action",
    tagline: "A new underworld run",
    playtimeMin: 31,
    lastPlayedLabel: "Today",
    installed: true,
    sizeGb: 12.7,
    installPath: "E:\\Games\\Hades2",
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk 2077",
    studio: "CD PROJEKT RED",
    genre: "RPG • Open World",
    tagline: "Night City awaits",
    playtimeMin: 95,
    lastPlayedLabel: "Today",
    installed: false,
    sizeGb: 69.9,
    installPath: "C:\\Program Files (x86)\\Epic Games\\Cyberpunk2077",
  },
];

export function findGame(id: string) {
  return GAMES.find(g => g.id === id) ?? GAMES[0];
}

export function formatPlaytime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}
