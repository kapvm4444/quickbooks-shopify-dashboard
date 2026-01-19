const getFirebaseConfig = (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY || "dummy-api-key",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
        projectId: process.env.FIREBASE_PROJECT_ID || "dummy-project",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
        appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef",
    });
};

module.exports = {
    getFirebaseConfig,
};
