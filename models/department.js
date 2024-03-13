const { ObjectId } = require("mongodb");

const createDepartmentModel = (db) => {
  const departmentCollection = db.collection("department");

  const createDepartment = async (department) => {
    return departmentCollection.insertOne(department);
  };

  return {
    createDepartment,
  };
};

module.exports = createDepartmentModel;
