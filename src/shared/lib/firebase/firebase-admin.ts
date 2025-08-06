import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(), // 또는 cert()
});

export { admin };