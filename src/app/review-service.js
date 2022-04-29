// Interacting with firebase to save data into our database
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = {
  createReview: async (resortId, userId, username, rating, body) => {
    const review = await db.collection("reviews").add({
      resortId: resortId,
      userId: userId,
      username: username,
      rating: rating,
      body: body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  },

  getReviewByResort: async (resortId) => {
    console.log(resortId);
    const reviews = await db
      .collection("reviews")
      .where("resortId", "==", `${resortId}`)
      .get();

    reviews.forEach((doc) => {
      doc.data = doc.data();
      // console.log(doc.id, "=>", doc.data);
    });

    return reviews;
  },

  deleteReviewById: async (id) => {
    const res = await db.collection("reviews").doc(id).delete();
  },

  deleteReviewByResort: async (resortId) => {
    const reviews = await db
      .collection("reviews")
      .where("resortId", "==", `${resortId}`)
      .get();

    reviews.forEach((review) => {
      db.collection("reviews").doc(review.id).delete();
    });
  },
};
