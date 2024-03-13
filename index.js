// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const {
  client,
  connectToDatabase,
  disconnectFromDatabase,
} = require("./mongo");

const queries = require("./getData");

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Dummy data storage
let departments = [];
let employees = [];
let payouts = [];

app.get("/", (req, res) => {
  res.send("Hello, welcome to the WorkForceHub Services");
});

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    // Department Create
    app.post("/departments", (req, res) => {
      const newDepartment = req.body;
      newDepartment.id = departments.length + 1;
      departments.push(newDepartment);
      res.status(201).json({
        message: "Department created successfully",
        data: newDepartment,
      });
    });

    // Department Update
    app.put("/departments/:id", (req, res) => {
      const departmentId = parseInt(req.params.id);
      const updatedDepartment = req.body;

      res.json({
        message: "Department updated successfully",
        data: updatedDepartment,
      });
    });

    // Employee Create
    app.post("/employees", (req, res) => {
      const newEmployee = req.body;
      newEmployee.id = employees.length + 1;
      employees.push(newEmployee);
      res.status(201).json({
        message: "Employee created successfully",
        data: newEmployee,
      });
    });

    // Employee Update by email
    app.put("/employees/:email", (req, res) => {
      const employeeEmail = req.params.email;
      const updatedEmployee = req.body;

      res.json({
        message: "Employee updated successfully",
        data: updatedEmployee,
      });
    });

    // Employee Delete
    app.delete("/employees/:id", (req, res) => {
      const employeeId = parseInt(req.params.id);

      res.json({
        message: "Employee deleted successfully",
      });
    });

    // Payout Upload using CSV
    const upload = multer({ dest: "uploads/" });

    app.post("/payouts/upload", upload.single("payouts"), (req, res) => {
      console.log("Request received at /payouts/upload");
      console.log("File:", req.file);

      const results = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          // Process the CSV data and update payouts array
          results.forEach((row) => {
            const payout = {
              payoutDate: row.payoutDate,
              employeeEmail: row.employeeEmail,
              fixedAmount: parseFloat(row.fixedAmount),
              variableAmount: parseFloat(row.variableAmount),
              deductions: parseFloat(row.deductions),
            };
            payouts.push(payout);
          });

          res.json({
            message: "Payouts uploaded successfully",
            data: results,
          });
        });
    });

    // Custom routes for queries
    app.get("/employees-with-department-info", async (req, res) => {
      try {
        await connectToDatabase((db) => {
            queries
            .getAllEmployeesWithDepartmentInfo(db)
            .then((result) => {
              res.json(result);
            })
            .catch((error) => {
              console.error("Error executing query:", error);
              res.status(500).json({ error: "Internal Server Error" });
            });
        });
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/employees-total-payouts-for-year/:year", async (req, res) => {
      const year = parseInt(req.params.year);
      try {
        await connectToDatabase((db) => {
            queries
            .getEmployeesTotalPayouts(db, year)
            .then((result) => {
              res.json(result);
            })
            .catch((error) => {
              console.error("Error executing query:", error);
              res.status(500).json({ error: "Internal Server Error" });
            });
        });
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Similar modifications for other routes:

    app.get("/top-employees-highest-variable-amount", async (req, res) => {
      try {
        await connectToDatabase((db) => {
          queries
            .getTopEmployeesWithHighestVariableAmount(db)
            .then((result) => {
              res.json(result);
            })
            .catch((error) => {
              console.error("Error executing query:", error);
              res.status(500).json({ error: "Internal Server Error" });
            });
        });
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/employees-no-payouts/:months", async (req, res) => {
      const months = req.params.months.split(",");
      try {
        await connectToDatabase((db) => {
          queries
            .getEmployeesWithNoPayouts(db, months)
            .then((result) => {
              res.json(result);
            })
            .catch((error) => {
              console.error("Error executing query:", error);
              res.status(500).json({ error: "Internal Server Error" });
            });
        });
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Start the server
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Handle process termination to ensure graceful disconnection from MongoDB
process.on("SIGINT", () => {
  disconnectFromDatabase().then(() => {
    console.log("Disconnected from MongoDB on process termination");
    process.exit(0);
  });
});
