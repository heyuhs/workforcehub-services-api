const { ObjectId } = require("mongodb");

const createPayoutModel = (db) => {
  const payoutCollection = db.collection("payouts");

  const createPayout = async (payout) => {
    return payoutCollection.insertOne(payout);
  };

  return {
    createPayout,
  };
};

module.exports = createPayoutModel;
