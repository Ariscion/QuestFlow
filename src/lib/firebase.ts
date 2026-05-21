import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Инициализация
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Экспорт сервисов для всего приложения
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Хелперы для авторизации
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Ошибка авторизации:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    return signOut(auth);
};

export const getUserDataFromDb = async (uid: string) => {
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Ошибка загрузки данных пользователя:", error);
        return null;
    }
};

export const saveUserDataToDb = async (uid: string, data: Record<string, unknown>) => {
    try {
        await setDoc(doc(db, "users", uid), data, { merge: true });
    } catch (error) {
        console.error("Ошибка сохранения данных пользователя:", error);
    }
};

// ─── Price Alert Helpers ──────────────────────────────────────────────────────

export interface PriceAlert {
    gameID: string;
    title: string;
    thumb: string;
    targetPrice: number;      // USD — пользователь хочет уведомление ниже этой цены
    currentPrice: number;     // USD — цена на момент создания алерта
    createdAt: string;        // ISO timestamp
}

/**
 * Saves a price alert for a game under /users/{uid}/priceAlerts/{gameID}.
 * Overwrites any existing alert for the same game.
 */
export const setPriceAlert = async (uid: string, alert: PriceAlert): Promise<void> => {
    try {
        await setDoc(doc(db, "users", uid, "priceAlerts", alert.gameID), alert);
    } catch (error) {
        console.error("Ошибка сохранения алерта цены:", error);
        throw error;
    }
};

/**
 * Removes a price alert for a specific game.
 */
export const removePriceAlert = async (uid: string, gameID: string): Promise<void> => {
    try {
        const { deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "users", uid, "priceAlerts", gameID));
    } catch (error) {
        console.error("Ошибка удаления алерта цены:", error);
        throw error;
    }
};

/**
 * Fetches all price alerts for a user.
 */
export const getPriceAlerts = async (uid: string): Promise<PriceAlert[]> => {
    try {
        const { collection, getDocs } = await import("firebase/firestore");
        const snap = await getDocs(collection(db, "users", uid, "priceAlerts"));
        return snap.docs.map(d => d.data() as PriceAlert);
    } catch (error) {
        console.error("Ошибка загрузки алертов:", error);
        return [];
    }
};

