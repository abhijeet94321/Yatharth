'use client';

import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { getFirestore, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function requestNotificationPermission(userId: string) {
  const supported = await isSupported();
  if (!supported || !VAPID_KEY) {
    console.log('Firebase Messaging is not supported in this browser or VAPID key is missing.');
    return;
  }

  const app = getApp();
  const messaging = getMessaging(app);
  const firestore = getFirestore(app);

  try {
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      // Save the token to the user's profile
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        fcmTokens: arrayUnion(currentToken),
        updatedAt: serverTimestamp()
      });
      console.log('FCM Token saved for user:', userId);
    } else {
      // Show permission request UI
      console.log('No registration token available. Requesting permission...');
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Retry getting the token
        const newToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (newToken) {
          const userDocRef = doc(firestore, 'users', userId);
          await updateDoc(userDocRef, {
            fcmTokens: arrayUnion(newToken),
            updatedAt: serverTimestamp()
          });
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
}
