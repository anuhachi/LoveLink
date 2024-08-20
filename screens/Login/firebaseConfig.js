// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAxjJ9OYW66FsyxB55prJO7osAQwQOrMio',
  authDomain: 'datingapp-9d981.firebaseapp.com',
  databaseURL:
    'https://datingapp-9d981-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'datingapp-9d981',
  storageBucket: 'datingapp-9d981.appspot.com',
  messagingSenderId: '437861443585',
  appId: '1:437861443585:web:7792f3d5a6ff13a3e3f800',
  measurementId: 'G-1DLP1G5V5C',
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
// Get a reference to the database
export const FIREBASE_DB = getDatabase(FIREBASE_APP);
// Get a reference to the storage service
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
