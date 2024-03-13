const { ObjectId } = require("mongodb");

// Define the Department data model with data types
const Department = {
  id: ObjectId,
  name: String,
  duties: String, // Consider using a different type if not storing HTML
  startDate: Date,
  deptHead: ObjectId, // Optional department head ID
};

// Function to create a new department (using type annotations)
async function createDepartment(db, departmentData) {
  // Basic validation
  if (!departmentData.name || !departmentData.startDate) {
    throw new Error("Missing mandatory fields in department data");
  }

  const departmentCollection = db.collection("department");

  try {
    const result = await departmentCollection.insertOne(departmentData);
    return result;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error; // Re-throw the error for handling at a higher level
  }
}

module.exports = { Department, createDepartment };
