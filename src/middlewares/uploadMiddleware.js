const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "profilePicture") {
            cb(null, "uploads/profiles/");
        }
        else if (file.fieldname === "cv") {
            cb(null, "uploads/cvs/");
        }
        else {
            cb(null, "uploads/");
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueName + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if(file.fieldname === "profilePicture") {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Profile picture must be an image"), false);
        }
    }
    else if (file.fieldname === "cv") {
        if(
            file.mimetype === "application/pdf" ||
            file.mimetype === "application/msword" ||
            file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            cb(null, true);
        } else {
            cb(new Error("CV must be PDF or word file"), false);
        }
    }
    else {
        cb(null, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;