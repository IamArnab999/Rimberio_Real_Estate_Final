import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Use an environment variable to define the path to the admin.json file
const serviceAccountPath = process.env.FIREBASE_ADMIN_JSON_PATH || path.resolve(__dirname, "./json/admin.json");

// Read and parse the service account JSON file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export default admin;