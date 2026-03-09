export interface GameMeta {
    id: string;
    title: string;
    steamAppId: number | null; // null, если эксклюзив Epic
    epicPrice: string | null;  // null, если эксклюзив Steam
    image: string;
}

export const GAMES_DB: GameMeta[] = [
    {
        id: "cyberpunk_2077",
        title: "Cyberpunk 2077",
        steamAppId: 1091500,
        epicPrice: "13 199 ₸", // Твоя реальная цена со скриншота!
        image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg"
    },
    {
        id: "hades_2",
        title: "Hades II",
        steamAppId: 1145350,
        epicPrice: "7 600 ₸",
        image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg"
    },
    {
        id: "rdr_2",
        title: "Red Dead Redemption 2",
        steamAppId: 1174180,
        epicPrice: "19 999 ₸",
        image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg"
    },
    {
        id: "alan_wake_2",
        title: "Alan Wake 2",
        steamAppId: null, // ЭКСКЛЮЗИВ EPIC GAMES
        epicPrice: "12 400 ₸",
        image: "https://cdn2.unrealengine.com/egs-alanwake2-remedyentertainment-g1a-00-1920x1080-19a9d7bb3240.jpg"
    },
    {
        id: "cs_2",
        title: "Counter-Strike 2",
        steamAppId: 730,
        epicPrice: null, // ЭКСКЛЮЗИВ STEAM (Бесплатно, добавим ради теста)
        image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg"
    },
    {
        id: "gta_v",
        title: "Grand Theft Auto V",
        steamAppId: 271590,
        epicPrice: "8 000 ₸",
        image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg"
    },
    {
        id: "bg_3",
        title: "Baldur's Gate 3",
        steamAppId: 1086940,
        epicPrice: "18 000 ₸", // Примерная
        image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg"
    }
];