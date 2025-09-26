import { collection, getDocs } from "firebase/firestore";
import { db } from "./src/firebase.js";
import fs from 'fs';
import path from "path";

const exportData = async () => {

    try {
        const feedbackCollection = collection(db, "feedback");
        const snapshot = await getDocs(feedbackCollection);
        
        // Map document to an array
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       
        // Ensure the output directory exists
        const outputDir = path.resolve('./backend');
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