import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';
import path from 'path';


// Firebase configuration (hardcoded for this standalone script)
const firebaseConfig = {
    apiKey: "AIzaSyBAVI_TXFjdCCwQW7KiuuXNA4__jR5HrsY",
    authDomain: "pwafruitml.firebaseapp.com",
    projectId: "pwafruitml",
    storageBucket: "pwafruitml.appspot.com",
    messagingSenderId: "989330511393",
    appId: "1:989330511393:web:e6d7337252d7a4eaa9b560",
    measurementId: "G-34W3RKLP4Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const exportData = async () => {

    try {
        const feedbackCollection = collection(db, "feedback");
        const snapshot = await getDocs(feedbackCollection);
        
        // Log the snapshot size to check if documents are retrieved
        console.log("Number of documents retrieved:", snapshot.size);

        // Map document to an array
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ensure the output directory exists
        const outputDir = path.resolve('./backend/data');
        if (!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save data to a file
        const outputPath = path.join(outputDir, 'feedbackData.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Data exported to ${outputPath}`);
    } catch (error) {
        console.error("Error exporting data: ", error);
    }
};

exportData();