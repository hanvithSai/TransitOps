const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} = require("../controllers/userController");
const { createUserValidator, updateUserValidator } = require("../validators/authValidator");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

// All user routes require authentication + admin role
router.use(authenticate, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUserValidator, createUser);
router.put("/:id", updateUserValidator, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
