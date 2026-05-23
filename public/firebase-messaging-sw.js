importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAFNtp3CL1XDG7poVBGziEQto6L2Xyp3_Q",
    authDomain: "rentout-in-8b207.firebaseapp.com",
    projectId: "rentout-in-8b207",
    storageBucket: "rentout-in-8b207.firebasestorage.app",
    messagingSenderId: "1053086233080",
    appId: "1:1053086233080:web:780c990014ce3e3dcae60d",
    measurementId: "G-GCM13FS7SG"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("Background Message:", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.svg'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
