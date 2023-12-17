import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: process.env.FIREBASE_DB,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export function writeUserData(lineId, threadId, token) {
  const db = getDatabase();
  set(ref(db, "users/" + lineId), {
    threadId: threadId,
    token: token,
  });
}

export async function readUserData(lineId) {
    try {
      const dbRef = ref(getDatabase());
      const snapshot = await get(child(dbRef, `users/${lineId}`));
  
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      throw error; // You can choose to re-throw the error or handle it differently
    }
  }

