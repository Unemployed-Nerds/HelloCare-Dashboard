import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC3QQH_1p479bzZZgrlfUkw0a0_GxVE9G4",
  authDomain: "hellocare-fd1b7.firebaseapp.com",
  projectId: "hellocare-fd1b7",
  storageBucket: "hellocare-fd1b7.firebasestorage.app",
  messagingSenderId: "843661331522",
  appId: "1:843661331522:web:e7cf2f5abf426367b871db",
  measurementId: "G-1PE6ZEKK2T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
