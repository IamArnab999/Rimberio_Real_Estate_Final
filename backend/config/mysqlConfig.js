import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("MySQL connection pool created", pool);
async function testQuery() {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    console.log("Server time:", rows[0].time);
  } catch (err) {
    console.error("Query failed:", err);
  }
}

testQuery().catch(console.error);

export default pool;

// import dotenv from "dotenv";
// import mysql from "mysql2/promise";

// dotenv.config();

// const pool = mysql.createPool({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   port: process.env.MYSQL_PORT || 3306,
//   ssl: {
//     rejectUnauthorized: true, // Azure requires secure connection
//   },
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// console.log("✅ MySQL connection pool created.");
// console.log("🔗 MySQL connection pool details:", {
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   database: process.env.MYSQL_DATABASE,
//   port: process.env.MYSQL_PORT || 3306,
// });

// async function insertRow() {
//   try {
//     const [result] = await pool.query(
//       "INSERT INTO testtabel (name) VALUES (?)",
//       ["Tarun"]
//     );
//     console.log("🚀 Inserted with ID:", result.insertId, result);
//   } catch (err) {
//     console.error("❌ Insert failed:", err.message);
//   }
// }

// insertRow().catch(console.error);

// export default pool;
