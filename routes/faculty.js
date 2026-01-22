import express from "express";
import db from "../db/client.js";
import { requireAdmin } from "../utils/jwt.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `
      SELECT
        f.id,
        f.name,
        f.email,
        f.bio,
        f.profile_image,
        f.contact_info,
        f.department_id,
        CASE WHEN d.id IS NULL THEN NULL ELSE
          json_build_object('id', d.id, 'name', d.name)
        END AS department
      FROM faculty f
      LEFT JOIN departments d ON d.id = f.department_id
      ORDER BY f.name ASC
      `,
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      SELECT
        f.id,
        f.name,
        f.email,
        f.bio,
        f.profile_image,
        f.contact_info,
        f.department_id,
        CASE WHEN d.id IS NULL THEN NULL ELSE
          json_build_object(
            'id', d.id,
            'name', d.name,
            'description', d.description,
            'banner_image', d.banner_image,
            'contact_info', d.contact_info
          )
        END AS department
      FROM faculty f
      LEFT JOIN departments d ON d.id = f.department_id
      WHERE f.id = $1
      `,
      [id],
    );

    const prof = rows[0];
    if (!prof) return res.status(404).json({ error: "Faculty not found" });

    res.json(prof);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const {
      name,
      email,
      bio = "",
      profile_image = "",
      contact_info = {},
      department_id = null,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const { rows } = await db.query(
      `
      INSERT INTO faculty (name, email, bio, profile_image, contact_info, department_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, bio, profile_image, contact_info, department_id
      `,
      [
        name.trim(),
        email.toLowerCase().trim(),
        bio,
        profile_image,
        contact_info,
        department_id,
      ],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Faculty email already exists" });
    }
    if (err.code === "23503") {
      return res.status(400).json({ error: "Invalid department_id" });
    }
    next(err);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, bio, profile_image, contact_info, department_id } =
      req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(String(name).trim());
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(String(email).toLowerCase().trim());
    }
    if (bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      values.push(bio);
    }
    if (profile_image !== undefined) {
      fields.push(`profile_image = $${idx++}`);
      values.push(profile_image);
    }
    if (contact_info !== undefined) {
      fields.push(`contact_info = $${idx++}`);
      values.push(contact_info);
    }
    if (department_id !== undefined) {
      fields.push(`department_id = $${idx++}`);
      values.push(department_id);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    const { rows } = await db.query(
      `
      UPDATE faculty
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, name, email, bio, profile_image, contact_info, department_id
      `,
      values,
    );

    const updated = rows[0];
    if (!updated) return res.status(404).json({ error: "Faculty not found" });

    res.json(updated);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Faculty email already exists" });
    }
    if (err.code === "23503") {
      return res.status(400).json({ error: "Invalid department_id" });
    }
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      DELETE FROM faculty
      WHERE id = $1
      RETURNING id, name, email
      `,
      [id],
    );

    const deleted = rows[0];
    if (!deleted) return res.status(404).json({ error: "Faculty not found" });

    res.json({ deleted });
  } catch (err) {
    next(err);
  }
});

export default router;
