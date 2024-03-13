const { connectToDatabase } = require("./mongo.js");

module.exports = {
  getAllEmployeesWithDepartmentInfo: async (db) => {
    //const db = await connectToDatabase();
    const employeeCollection = db.collection("Employee");
    const departmentCollection = db.collection("Department");

    if (!payoutCollection || !employeeCollection) {
      throw new Error("Failed to get Payout or Employee collection");
    }

    const employees = await employeeCollection
      .aggregate([
        {
          $lookup: {
            from: "Department",
            localField: "department",
            foreignField: "_id",
            as: "departmentInfo",
          },
        },
        {
          $unwind: "$departmentInfo",
        },
        {
          $lookup: {
            from: "Employee",
            localField: "departmentInfo.deptHead",
            foreignField: "_id",
            as: "deptHeadInfo",
          },
        },
        {
          $unwind: {
            path: "$deptHeadInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            email: 1,
            firstName: 1,
            lastName: 1,
            departmentName: "$departmentInfo.name",
            departmentHeadName: {
              $concat: [
                "$deptHeadInfo.firstName",
                " ",
                "$deptHeadInfo.lastName",
              ],
            },
          },
        },
      ])
      .toArray();

    return employees;
  },

  getEmployeesTotalPayoutsForYear: async (db, year) => {
    //const db = await connectToDatabase();
    const payoutCollection = db.collection("Payout");

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    const totalPayout = await payoutCollection
      .aggregate([
        {
          $match: {
            payoutDate: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalPayout: {
              $sum: {
                $subtract: ["$fixedAmount", "$deductions", "$variableAmount"],
              },
            },
          },
        },
      ])
      .toArray();

    return totalPayout;
  },

  getTopEmployeesWithHighestVariableAmount: async (db) => {
    //const db = await connectToDatabase();
    const payoutCollection = db.collection("Payout");
    const employeeCollection = db.collection("Employee");

    if (!payoutCollection || !employeeCollection) {
      throw new Error("Failed to get Payout or Employee collection");
    }

    const topEmployees = await payoutCollection
      .aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$payoutDate" },
              year: { $year: "$payoutDate" },
            },
            maxVariableAmount: { $max: "$variableAmount" },
          },
        },
        {
          $lookup: {
            from: "Employee",
            localField: "_id",
            foreignField: "_id",
            as: "employeeInfo",
          },
        },
        {
          $unwind: "$employeeInfo",
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            year: "$_id.year",
            employeeName: {
              $concat: [
                "$employeeInfo.firstName",
                " ",
                "$employeeInfo.lastName",
              ],
            },
            totalVariableAmount: "$maxVariableAmount",
          },
        },
      ])
      .toArray();

    return topEmployees;
  },

  getEmployeesWithNoPayouts: async (db, months) => {
    //const db = await connectToDatabase();
    const employeeCollection = db.collection("Employee");
    const payoutCollection = db.collection("Payout");

    const startDate = new Date("2023-05-01");
    const endDate = new Date("2023-07-01");

    const employeesWithNoPayouts = await employeeCollection
      .aggregate([
        {
          $lookup: {
            from: "Payout",
            localField: "_id",
            foreignField: "employee",
            as: "payouts",
          },
        },
        {
          $match: {
            "payouts.payoutDate": {
              $lt: startDate,
              $gte: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              employeeId: "$_id",
              email: "$email",
              firstName: "$firstName",
              lastName: "$lastName",
            },
          },
        },
        {
          $project: {
            _id: 0,
            employeeId: "$_id.employeeId",
            email: "$_id.email",
            firstName: "$_id.firstName",
            lastName: "$_id.lastName",
          },
        },
      ])
      .toArray();

    return employeesWithNoPayouts;
  },
};
