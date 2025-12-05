// src/firebase/config.ts

// 🔥🔥🔥 חשוב: אלו פרטי Mock, עליך להחליף אותם בפרטי הפרויקט האמיתי שלך 🔥🔥🔥
const firebaseConfig = {
  apiKey: "MOCK_API_KEY", 
  authDomain: "MOCK_PROJECT_ID.firebaseapp.com",
  projectId: "MOCK_PROJECT_ID",
  storageBucket: "MOCK_PROJECT_ID.appspot.com",
  messagingSenderId: "MOCK_SENDER_ID",
  appId: "MOCK_APP_ID",
};

// --- ייבוא Firebase ---
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// אתחול Firebase
const app = initializeApp(firebaseConfig);
// הגדרת אזור הפונקציה (חובה להתאים למה שפרסת!)
const functions = getFunctions(app, 'europe-west1'); 

// 🔥 פונקציית הקריאה ל-AI שצריך לייבא 🔥
export const generateSummaryCallable = httpsCallable(functions, 'generateBabySummary');