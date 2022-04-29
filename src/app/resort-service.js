// Interacting with firebase to save data into our database
const admin = require("firebase-admin");
const db = admin.firestore();
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken =
  "pk.eyJ1IjoibGl5aXh1YW4xOTk4IiwiYSI6ImNsMmhyZWNzeTAwN2MzZXFvbmNlZjVmaWoifQ.Jm8zs9_kgcDM9B0DTZcLdg";
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports = {
  createResort: async (
    userId,
    title,
    location,
    price,
    description,
    imageUrl,
    username
  ) => {
    const geoData = await geocoder
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();
    const geometry = geoData.body.features[0].geometry;

    const res = await db.collection("resorts").add({
      userId: userId,
      title: title,
      location: location,
      price: price,
      description: description,
      imageUrl: imageUrl,
      username: username,
      geometry: geometry,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  },

  getResortById: async (id) => {
    const doc = await db.collection("resorts").doc(id).get();
    if (!doc.exists) {
      return null;
    } else {
      doc.data = doc.data();
      return doc;
    }
  },

  deleteResortById: async (id) => {
    const res = await db.collection("resorts").doc(id).delete();
  },

  getAllResorts: async () => {
    const doc = db.collection("resorts").orderBy("timestamp", "desc");
    const resorts = await doc.get();

    resorts.forEach((doc) => {
      doc.data = doc.data();
      // console.log(doc.id, "=>", doc.data);
    });

    return resorts;
  },
};
