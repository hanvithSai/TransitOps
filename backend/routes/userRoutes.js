const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} = require("../controllers/userController");
const { createUserValidator, updateUserValidator, enforcePasswordPolicy, enforceOptionalPasswordPolicy } = require("../validators/authValidator");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const requirePasswordUpdated = require("../middlewares/requirePasswordUpdated");

// All user routes require authentication + admin role
router.use(authenticate, requirePasswordUpdated, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUserValidator, enforcePasswordPolicy("password"), createUser);
router.put("/:id", updateUserValidator, enforceOptionalPasswordPolicy, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
