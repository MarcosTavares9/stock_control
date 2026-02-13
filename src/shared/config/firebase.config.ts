import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCSBieex8cMrtrVrYk_foUmenI3LMXR3r0',
  authDomain: 'rabeloprojetos-12f6e.firebaseapp.com',
  projectId: 'rabeloprojetos-12f6e',
  storageBucket: 'rabeloprojetos-12f6e.firebasestorage.app',
  messagingSenderId: '195510446339',
  appId: '1:195510446339:web:980e8eaf519fb1f5e62136',
  measurementId: 'G-81SQYN4M9J',
}

const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
