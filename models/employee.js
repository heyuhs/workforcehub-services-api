const { ObjectId } = require("mongodb");

// Define the Employee data model with data types
const Employee = {
  id: ObjectId,
  email: String,
  firstName: String,
  lastName: String,
  joiningDate: Date,
  leavingDate: Date,
  department: ObjectId,
  designation: String,
};

// Function to create a new employee (using type annotations)
async function createEmployee(db, employeeData) {
  // Basic validation
  if (
    !employeeData.email ||
    !employeeData.firstName ||
    !employeeData.lastName ||
    !employeeData.joiningDate ||
    !employeeData.department ||
    !employeeData.designation
  ) {
    throw new Error("Missing mandatory fields in employee data");
  }

  const employeeCollection = db.collection("employee");

  try {
    const result = await employeeCollection.insertOne(employeeData);
    return result;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error; // Re-throw the error for handling at a higher level
  }
}

module.exports = { Employee, createEmployee };
