// Interacting with firebase to save data into our database
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = {
  createResort: async (userId, title, location, price, description) => {
    const res = await db.collection("resorts").add({
      createdBy: userId,
      title: title,
      location: location,
      price: price,
      description: description,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  },

  getResortById: async (id) => {
    const doc = await db.collection("resorts").doc(id).get();
    if (!doc.exists) {
      console.log("No such resort!");
      return null;
    } else {
      return doc.data();
    }
  },
};
