const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const auth = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRolesMiddleware");
const { ROLES } = require("../constants");
const upload = require("../middlewares/uploadMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
    createEmployeeSchema,
    updateEmployeeSchema,
    updateStatusSchema,
} = require("../validators/employeeValidator");


router.get("/", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), employeeController.getAllEmployees);
router.get("/:id", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), employeeController.getEmployeeById);
router.post("/", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(createEmployeeSchema), employeeController.createEmployee);
router.put("/:id", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(updateEmployeeSchema), employeeController.updateEmployee);
router.patch("/:id/status", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(updateStatusSchema), employeeController.updateEmployeeStatus);
router.get("/:id/salary", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), employeeController.getEmployeeSalary);
router.post("/:id/upload-docs",
    auth,
    authorizeRoles(ROLES.ADMIN, ROLES.HR), 
    upload.fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "cv", maxCount: 1 },
    ]),
    employeeController.uploadEmployeeDocs
);
router.delete("/:id", auth, authorizeRoles(ROLES.ADMIN), employeeController.deleteEmployee);

module.exports = router;