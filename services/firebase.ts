import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: "AIzaSyBxte8V5Ib02IPpHDgfHeNikuMPE3ro-7o",
  authDomain: "gen-lang-client-0663739355.firebaseapp.com",
  projectId: "gen-lang-client-0663739355",
  storageBucket: "gen-lang-client-0663739355.firebasestorage.app",
  messagingSenderId: "247725186208",
  appId: "1:247725186208:web:3fe1bf39bf67376f7f7dc5",
  measurementId: "G-Y09XNE6BXP"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
