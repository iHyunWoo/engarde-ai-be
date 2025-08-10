import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? ""),
});

export { admin };