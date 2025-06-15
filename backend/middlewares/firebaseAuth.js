import admin from "../config/firebaseAdmin.js";


const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Store decoded info for later use
    next();
  } catch (error) {
    return res.status(403).json({ message: "Unauthorized", error: error.message });
  }
};

export default verifyFirebaseToken;