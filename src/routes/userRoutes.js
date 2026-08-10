const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRolesMiddleware");
const { ROLES } = require("../constants");
const upload = require("../middlewares/uploadMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { updateUserSchema } = require("../validators/userValidator");


router.get("/", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), userController.getAllUsers);
router.get("/:id", auth, userController.getUserById);
router.put("/:id", auth, authorizeRoles(ROLES.ADMIN, ROLES.HR), validate(updateUserSchema), userController.updateUser);
router.delete("/:id", auth, authorizeRoles(ROLES.ADMIN), userController.deleteUser);
router.post(
    "/upload-docs",
    auth,
    authorizeRoles(ROLES.ADMIN, ROLES.HR),
    upload.fields([
        {name: "profilePicture", maxCount: 1},
        {name: "cv", maxCount: 1}
    ]),
    (req, res) => {
        res.json({
            msg: "Files uploaded successfully",
            profilePicture: req.files.profilePicture?.[0].path,
            cv: req.files.cv?.[0].path
        });
    }
);

module.exports = router;