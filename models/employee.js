const { ObjectId } = require("mongodb");

const createEmployeeModel = (db) => {
  const employeeCollection = db.collection("employees");

  const createEmployee = async (employee) => {
    return employeeCollection.insertOne(employee);
  };

  return {
    createEmployee,
  };
};

module.exports = createEmployeeModel;
