const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let serviceAccount;

try {
  // Check if we have environment variables for Firebase configuration
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Default to using a local service account file (for development)
    serviceAccount = require('../firebase-service-account.json');
  }

  // Initialize the app if it hasn't been initialized already
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  
  // If we can't load the credentials, initialize with application default credentials
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

const db = admin.firestore();

module.exports = {
  admin,
  db
}; 