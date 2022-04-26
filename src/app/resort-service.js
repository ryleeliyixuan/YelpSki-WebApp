// Interacting with firebase to save data into our database
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = {
  createResort: async (
    userId,
    title,
    location,
    price,
    description,
    imageUrl
  ) => {
    const res = await db.collection("resorts").add({
      userId: userId,
      title: title,
      location: location,
      price: price,
      description: description,
      imageUrl: imageUrl,
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

  getAllResorts: async () => {
    const doc = db.collection("resorts");
    const resorts = await doc.get();

    resorts.forEach((doc) => {
      doc.data = doc.data();
      // console.log(doc.id, "=>", doc.data);
    });

    return resorts;
  },
};
