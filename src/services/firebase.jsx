import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api";
import { toast } from "react-hot-toast";

// These should be in .env but I will provide a template
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      if (token) {
        console.log("FCM Token:", token);
        await api.post("/notifications/save-token/", { token });
      }
    }
  } catch (error) {
    console.error("Notification permission error:", error);
  }
};

export const onMessageListener = () => {
  return onMessage(messaging, (payload) => {
    console.log("Foreground Message received:", payload);
    if (payload.notification) {
      toast(
        (t) => (
          <div className="flex gap-4 items-start" onClick={() => toast.dismiss(t.id)}>
            <div className="text-xl mt-1">🔔</div>
            <div>
              <p className="font-bold text-slate-800">{payload.notification.title}</p>
              <p className="text-sm text-slate-500 font-medium leading-tight mt-1">{payload.notification.body}</p>
            </div>
          </div>
        ),
        { duration: 6000, position: 'top-center' }
      );
    }
  });
};

export { messaging };
