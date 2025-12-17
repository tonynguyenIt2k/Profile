import { readFile } from 'fs/promises';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';

async function main(){
  try{
    // load sample
    const raw = await readFile(new URL('./sample-profile.json', import.meta.url));
    const json = JSON.parse(raw.toString());
    const data = (json && json.__type === 'profile_export' && json.data) ? json.data : json;
    if(!data || typeof data !== 'object') throw new Error('Invalid sample-profile.json');

    // init firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // sign in anonymously
    const cred = await signInAnonymously(auth);
    const user = cred.user || auth.currentUser;
    if(!user || !user.uid) throw new Error('Could not get uid from anonymous auth');

    const ref = doc(db, 'users', user.uid, 'profile', 'main');
    await setDoc(ref, { data, updatedAt: new Date().toISOString() }, { merge: true });
    console.log('Pushed sample to users/' + user.uid + '/profile/main');
    process.exit(0);
  }catch(err){
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
