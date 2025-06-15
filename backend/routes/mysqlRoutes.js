import express from "express";
import { getAllClients, createClient  } from "../controllers/mysqlController.js";
import verifyFirebaseToken from "../middlewares/firebaseAuth.js";
import { deleteClient } from "../controllers/mysqlController.js";
import { updateClient } from "../controllers/mysqlController.js";
import { authMiddleware,verifyToken  } from "../auth/authMiddleware.js";
import { getAllUsers, createUser,updateUser,deleteUser, getUserRoleByEmail  } from "../controllers/mysqlController.js";
import { body, validationResult } from "express-validator";


const router = express.Router();

// router.get("/users", verifyToken, getAllUsers);
//  router.post("/users", verifyToken, addUser);
//  router.get("/users", verifyFirebaseToken, getAllUsers);

// router.get("/users", getAllUsers);
// router.post("/users", addUser);

// Define routes for clients
router.get("/clients", verifyFirebaseToken, getAllClients);
// router.post("/clients", verifyFirebaseToken, createClient);
router.delete("/clients/:id", verifyFirebaseToken, deleteClient);
router.put("/clients/:id", verifyFirebaseToken, updateClient);
router.post(
  "/clients",
  verifyFirebaseToken,
  [
    body("name").isString().notEmpty(),
    body("email").isEmail(),
    body("phone").isString().notEmpty(),
    body("status").isString().notEmpty(),
    body("type").isString().notEmpty(),
    body("last_activity").isISO8601(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createClient
);

router.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "You are authenticated!" });
  });
router.get("/users/role", getUserRoleByEmail);
router.get("/users", verifyToken, getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser); // Add this route
router.post("/users", verifyToken, createUser); // Protect the route with token verification


export default router;