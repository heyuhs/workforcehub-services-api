const { MongoClient } = require("mongodb");

const connectionString =
  "mongodb+srv://heyuhs:98STwWqS8sV7JoUZ@cluster0.hwtxzpb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
});

async function connectToDatabase(callback) {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    const db = client.db("Cluster0");
    callback(db)
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function disconnectFromDatabase() {
  try {
    await client.close();
    console.log("Disconnected from MongoDB Atlas");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
}

module.exports = { client, connectToDatabase, disconnectFromDatabase };
