// Interacting with firebase to save data into our database
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = {
  createUser: async (id, email, username) => {
    const docRef = db.collection("users").doc(id);
    await docRef.set({
      email: email,
      username: username,
    });
  },

  getUserById: async (id) => {
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) {
      console.log("No such document!");
      return null;
    } else {
      return doc.data();
    }
  },

  getUsernameById: async (id) => {
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) {
      console.log("No such document!");
      return null;
    } else {
      const username = doc.data().username;
      return username;
    }
  },
};
