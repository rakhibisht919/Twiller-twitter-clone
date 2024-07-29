
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDB8a2d_mk1Qk3YaA8A8bYIrE4VK3T1608",
  authDomain: "twiller-110d3.firebaseapp.com",
  projectId: "twiller-110d3",
  storageBucket: "twiller-110d3.appspot.com",
  messagingSenderId: "360299699306",
  appId: "1:360299699306:web:a195ac0bd981029d3a7e13",
  measurementId: "G-MGERX8360E"
};

const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export default app
// const analytics = getAnalytics(app);
