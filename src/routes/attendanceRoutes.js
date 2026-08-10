const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const auth = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRolesMiddleware");
const { ROLES } = require("../constants");
const validate = require("../middlewares/validateMiddleware");
const {
    manualAttendanceSchema,
    updateAttendanceSchema,
} = require("../validators/attendanceValidator");


router.post("/clockin", auth, authorizeRoles(ROLES.EMPLOYEE), attendanceController.clockIn);
router.post("/clockout", auth, authorizeRoles(ROLES.EMPLOYEE), attendanceController.clockOut);
router.get("/my", auth, authorizeRoles(ROLES.EMPLOYEE), attendanceController.getMyAttendance);
router.get("/", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), attendanceController.getAllAttendance);
router.get("/employee/:employeeId", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), attendanceController.getEmployeeAttendance);
router.post("/manual", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(manualAttendanceSchema), attendanceController.markManualAttendance);
router.put("/:id", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(updateAttendanceSchema), attendanceController.updateAttendance);
router.delete("/:id", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), attendanceController.deleteAttendance);


module.exports = router;