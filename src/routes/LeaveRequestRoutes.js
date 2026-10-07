const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/LeaveRequestController");
const auth = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRolesMiddleware");
const { ROLES } = require("../constants");
const validate = require("../middlewares/validateMiddleware");
const {
    createLeaveSchema,
    updateLeaveStatusSchema,
} = require("../validators/LeaveRequestVaidator");

router.post("/", auth, authorizeRoles(ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.HR), validate(createLeaveSchema), leaveController.createLeave);
router.get("/my", auth, authorizeRoles(ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.HR), leaveController.getMyLeaves);
router.delete("/:id", auth, authorizeRoles(ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.HR), leaveController.deleteLeave);
router.get("/", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), leaveController.getAllLeaves);
router.patch("/:id/status", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(updateLeaveStatusSchema), leaveController.updateLeaveStatus);
router.get("/:id", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE), leaveController.getLeaveById);

module.exports = router;