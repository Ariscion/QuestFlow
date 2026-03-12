import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDbYbTMVRWF4iklSBjPN9xMx-xvxoZxMlo",
    authDomain: "questflow-app.firebaseapp.com",
    projectId: "questflow-app",
    storageBucket: "questflow-app.firebasestorage.app",
    messagingSenderId: "616104169887",
    appId: "1:616104169887:web:7f4cb83ab8eb7e365e6daa",
    measurementId: "G-1S835MEJ0E"
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