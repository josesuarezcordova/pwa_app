import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

console.log("Firebase Config=====>", {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
});


console.log('####Environment Variables:####', process.env);


const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const authReady = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => { 
        if (user) {
            console.log("User is signed in:", user.uid);
            resolve(user);
        }
    });
});

export const ensureAuth = async () => {
    if (auth.currentUser) return auth.currentUser;
    try{
        const cred = await signInAnonymously(auth);
        console.log("[ensureAuth] anon uid:", cred.user.uid);
        return cred.user; 
    } catch(e){
        console.error("Error during anonymous sign-in:", e);
        throw e;
    }
};

signInAnonymously(auth).catch((error) => {
    console.error("[auth] intial anonymous sign-in:", error);
});

console.log("[Firebase] projectId", app.options.projectId);

//    apiKey: "AIzaSyBAVI_TXFjdCCwQW7KiuuXNA4__jR5HrsY",
//    authDomain: "pwafruitml.firebaseapp.com",
//    projectId: "pwafruitml",
//    storageBucket: "pwafruitml.firebasestorage.app",
//    messagingSenderId: "989330511393",
//    appId: "1:989330511393:web:e6d7337252d7a4eaa9b560",
//    measurementId: "G-34W3RKLP4Q"
