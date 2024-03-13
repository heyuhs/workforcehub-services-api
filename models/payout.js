const { ObjectId } = require("mongodb");

// Define the Payout data model with data types
const Payout = {
  id: ObjectId,
  payoutDate: Date,
  fixedAmount: Number,
  variableAmount: Number,
  deductions: Number,
};

// Function to create a new payout
async function createPayout(db, payoutData) {
  // Basic validation
  if (!payoutData.payoutDate || !payoutData.fixedAmount) {
    throw new Error("Missing mandatory fields in payout data");
  }

  const payoutCollection = db.collection("payout");

  try {
    const result = await payoutCollection.insertOne(payoutData);
    return result;
  } catch (error) {
    console.error("Error creating payout:", error);
    throw error; // Re-throw the error for handling at a higher level
  }
}

module.exports = { Payout, createPayout };
