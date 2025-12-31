export const environment = {
  production: true,
  // Linked to the deployed backend
  apiUrl: 'https://arogya-vault-health-record-app.onrender.com/api',
  firebase: {
    apiKey: "FIREBASE_API_KEY_PLACEHOLDER",
    authDomain: "health-app-001.firebaseapp.com",
    projectId: "health-app-001",
    storageBucket: "health-app-001.firebasestorage.app",
    messagingSenderId: "238027452024",
    appId: "1:238027452024:web:fbef94bbca26f738b4078d",
    measurementId: "G-0QQ8PJC2Q5"
  },
  useEmulator: false,
  emulatorConfig: {
    auth: { host: 'localhost', port: 9099 },
    firestore: { host: 'localhost', port: 8080 },
    storage: { host: 'localhost', port: 9199 },
    functions: { host: 'localhost', port: 5001 },
  },
  geminiApiKey: 'GEMINI_API_KEY_PLACEHOLDER',
  features: {
    enableOtpLogin: true,
    enableClientSideEncryption: true,
    enable2FA: false,
  },
  cognito: {
    userPoolId: 'us-east-1_hSYozLIn3',
    userPoolClientId: '5d1k6r0b5agdedklgsn717pdbd',
    region: 'us-east-1',
    identityPoolId: '',
    mandatorySignIn: true,
  },
};
