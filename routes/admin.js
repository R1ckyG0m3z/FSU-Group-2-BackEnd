import express from "express";
import bcrypt from "bcrypt";
import db from "../db/client.js";
import { createToken } from "../utils/jwt.js";

const router = express.Router();

// POST /api/admin/register
router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      `
      INSERT INTO admins (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email
      `,
      [email.toLowerCase(), hash],
    );

    const admin = rows[0];
    const token = createToken({ adminId: admin.id, email: admin.email });

    res.status(201).json({ admin, token });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  }
});

// POST /api/admin/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(`SELECT * FROM admins WHERE email = $1`, [
      email.toLowerCase(),
    ]);

    const admin = rows[0];
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = createToken({ adminId: admin.id, email: admin.email });

    res.json({ admin: { id: admin.id, email: admin.email }, token });
  } catch (err) {
    next(err);
  }
});

export default router;
