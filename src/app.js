require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const {
    helmetMiddleware,
    generalLimiter,
    mongoSanitizeMiddleware,
} = require("./middlewares/securityMiddleware");

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(helmetMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(generalLimiter);

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRequestRoutes = require("./routes/LeaveRequestRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRequestRoutes);

// const connectedDB = require("./src/config/db");
// connectedDB();

app.use((req, res) => {
    res.status(404).json({msg: "Route not found"});
});

const errorMiddleware = require("./middlewares/errorMiddleware");
app.use(errorMiddleware);

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

module.exports = app;