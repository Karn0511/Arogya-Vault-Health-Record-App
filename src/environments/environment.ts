export const environment = {
  production: false,
  apiUrl: '/api',
  geminiApiKey: '', // Deprecated: All AI calls routed through backend for security
  firebase: {

    apiKey: "AIzaSyDtc9gchAk1uKe87qr4dW8doRvo6dxHVKc",
    authDomain: "health-app-001.firebaseapp.com",
    projectId: "health-app-001",
    storageBucket: "health-app-001.firebasestorage.app",
    messagingSenderId: "238027452024",
    appId: "1:238027452024:web:fbef94bbca26f738b4078d",
    measurementId: "G-0QQ8PJC2Q5"
  },

  useEmulator: false, // Set to true to use Firebase emulators
  emulatorConfig: {
    auth: { host: 'localhost', port: 9099 },
    firestore: { host: 'localhost', port: 8080 },
    storage: { host: 'localhost', port: 9199 },
    functions: { host: 'localhost', port: 5001 },
  },
  // Feature flags
  features: {
    enableOtpLogin: true,
    enableClientSideEncryption: true,
    enable2FA: false,
  },
  // AWS Cognito Configuration
  cognito: {
    userPoolId: 'us-east-1_hSYozLIn3',
    userPoolClientId: '5d1k6r0b5agdedklgsn717pdbd', // Matches aws-config.ts
    region: 'us-east-1',
    identityPoolId: '',
    mandatorySignIn: true,
  },
};
