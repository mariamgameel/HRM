const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const auth = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRolesMiddleware");
const { ROLES } = require("../constants");
const validate = require("../middlewares/validateMiddleware");
const {
    createDepartmentSchema,
    updateDepartmentSchema
} = require("../validators/departmentValidator");

router.get("/", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), departmentController.getAllDepartments);
router.get("/:id", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), departmentController.getDepartmentById);
router.get("/:id/employees", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), departmentController.getDepartmentEmployees);
router.post("/", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(createDepartmentSchema), departmentController.createDepartment);
router.put("/:id", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(updateDepartmentSchema), departmentController.updateDepartment);
router.delete("/:id", auth, authorizeRoles(ROLES.ADMIN), departmentController.deleteDepartment);

module.exports = router;