import db from "../client.js";

// Get all images for a department
const getImagesByDepartment = async (departmentId) => {
  const query = `
    SELECT image_id, department_id, image_url, alt_text, is_primary
    FROM department_images
    WHERE department_id = $1
    ORDER BY is_primary DESC, image_id;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows;
};

// Get primary image for a department
const getPrimaryImageByDepartment = async (departmentId) => {
  const query = `
    SELECT image_id, department_id, image_url, alt_text, is_primary
    FROM department_images
    WHERE department_id = $1 AND is_primary = TRUE
    LIMIT 1;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows[0];
};

// Get image by ID
const getDepartmentImageById = async (imageId) => {
  const query = `
    SELECT image_id, department_id, image_url, alt_text, is_primary
    FROM department_images
    WHERE image_id = $1;
  `;
  const result = await db.query(query, [imageId]);
  return result.rows[0];
};

// Add image to department
const addDepartmentImage = async (
  departmentId,
  imageUrl,
  altText,
  isPrimary = false
) => {
  const query = `
    INSERT INTO department_images (department_id, image_url, alt_text, is_primary)
    VALUES ($1, $2, $3, $4)
    RETURNING image_id, department_id, image_url, alt_text, is_primary;
  `;
  const result = await db.query(query, [
    departmentId,
    imageUrl,
    altText,
    isPrimary,
  ]);
  return result.rows[0];
};

// Update department image
const updateDepartmentImage = async (imageId, imageUrl, altText, isPrimary) => {
  const query = `
    UPDATE department_images
    SET image_url = $1, alt_text = $2, is_primary = $3
    WHERE image_id = $4
    RETURNING image_id, department_id, image_url, alt_text, is_primary;
  `;
  const result = await db.query(query, [imageUrl, altText, isPrimary, imageId]);
  return result.rows[0];
};

// Set image as primary (unsets other primary images for the department)
const setPrimaryImage = async (imageId, departmentId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Unset all primary images for this department
    await client.query(
      "UPDATE department_images SET is_primary = FALSE WHERE department_id = $1",
      [departmentId]
    );

    // Set the specified image as primary
    const result = await client.query(
      "UPDATE department_images SET is_primary = TRUE WHERE image_id = $1 RETURNING *",
      [imageId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Delete department image
const deleteDepartmentImage = async (imageId) => {
  const query = `
    DELETE FROM department_images
    WHERE image_id = $1
    RETURNING image_id, department_id;
  `;
  const result = await db.query(query, [imageId]);
  return result.rows[0];
};

export {
  getImagesByDepartment,
  getPrimaryImageByDepartment,
  getDepartmentImageById,
  addDepartmentImage,
  updateDepartmentImage,
  setPrimaryImage,
  deleteDepartmentImage,
};
