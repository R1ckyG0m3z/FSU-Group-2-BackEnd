import express from "express";
import db from "../db/client.js";
import { requireAdmin } from "../utils/jwt.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `
      SELECT id, name, description, banner_image, contact_info
      FROM departments
      ORDER BY name ASC
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
        d.id,
        d.name,
        d.description,
        d.banner_image,
        d.contact_info,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'name', f.name,
              'email', f.email,
              'bio', f.bio,
              'profile_image', f.profile_image,
              'contact_info', f.contact_info,
              'department_id', f.department_id
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) AS faculty
      FROM departments d
      LEFT JOIN faculty f ON f.department_id = d.id
      WHERE d.id = $1
      GROUP BY d.id
      `,
      [id],
    );

    const dept = rows[0];
    if (!dept) return res.status(404).json({ error: "Department not found" });

    res.json(dept);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const {
      name,
      description = "",
      banner_image = "",
      contact_info = {},
    } = req.body;

    if (!name) return res.status(400).json({ error: "name is required" });

    const { rows } = await db.query(
      `
      INSERT INTO departments (name, description, banner_image, contact_info)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, banner_image, contact_info
      `,
      [name.trim(), description, banner_image, contact_info],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Department name already exists" });
    }
    next(err);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, banner_image, contact_info } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(String(name).trim());
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (banner_image !== undefined) {
      fields.push(`banner_image = $${idx++}`);
      values.push(banner_image);
    }
    if (contact_info !== undefined) {
      fields.push(`contact_info = $${idx++}`);
      values.push(contact_info);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    const { rows } = await db.query(
      `
      UPDATE departments
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, name, description, banner_image, contact_info
      `,
      values,
    );

    const updated = rows[0];
    if (!updated)
      return res.status(404).json({ error: "Department not found" });

    res.json(updated);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Department name already exists" });
    }
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      DELETE FROM departments
      WHERE id = $1
      RETURNING id, name
      `,
      [id],
    );

    const deleted = rows[0];
    if (!deleted)
      return res.status(404).json({ error: "Department not found" });

    res.json({ deleted });
  } catch (err) {
    next(err);
  }
});

export default router;
