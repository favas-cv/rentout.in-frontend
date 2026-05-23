import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";
import api from "./api";
import { toast } from "react-toastify";

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      if (token) {
        console.log("FCM Token:", token);
        // SEND TO BACKEND
        await api.post("/notifications/save-token/", { token });
        return token;
      } else {
        console.warn("No registration token available. Request permission to generate one.");
      }
    } else {
      console.warn("Notification permission denied.");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
  }
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground Message:", payload);
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
      resolve(payload);
    });
  });
