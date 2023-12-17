import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";
import {readUserData} from "./firebaseDb.js"
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

function writeUserData(lineId, threadId, token) {
  const db = getDatabase();
  set(ref(db, "users/" + lineId), {
    threadId: threadId,
    token: token,
  });
}

// function readUserData(lineId) {
//   const dbRef = ref(getDatabase());
//   get(child(dbRef, `users/${lineId}`))
//     .then((snapshot) => {
//       if (snapshot.exists()) {
//         return snapshot.val();
//       } else {
//         return null;
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

// async function readUserData(lineId) {
//     try {
//       const dbRef = ref(getDatabase());
//       const snapshot = await get(child(dbRef, `users/${lineId}`));
  
//       if (snapshot.exists()) {
//         return snapshot.val();
//       } else {
//         return null;
//       }
//     } catch (error) {
//       console.error(error);
//       throw error; // You can choose to re-throw the error or handle it differently
//     }
//   }
  

function checkUserExist(lineId) {
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/${lineId}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return 1;
      } else {
        return 0;
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
//line id U7d8da62e1b6d3b3846f954b57c98e8b4
//thread id thread_d9RgeObP9DWaScroeyWD4hTH
//token 100
async function main() {
  const lineId = "U7d8da62e1b6d3b3846f954b57c98e8b4";
  const threadId = "thread_d9RgeObP9DWaScroeyWD4hTH";
  const token = 100;
  //writeUserData(lineId,threadId,token)
  //readUserData(lineId);
  
  const userdata = await readUserData(lineId);
  if (userdata!= null){
    console.log("user found")
    console.log(userdata.threadId)
  } else {
    console.log("user not found")
  }
  
}

main();
