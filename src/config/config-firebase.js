// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzD5iqDSCRTT0pGQ8kV9a-X0JJ6yFMqvI",
  authDomain: "toilahuong-8771b.firebaseapp.com",
  projectId: "toilahuong-8771b",
  storageBucket: "toilahuong-8771b.appspot.com",
  messagingSenderId: "759751120599",
  appId: "1:759751120599:web:60dfd2bca226d72e160292",
  measurementId: "G-8S75E29CF9"
};

// Initialize Firebase
if (typeof window !== 'undefined') {
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
}
