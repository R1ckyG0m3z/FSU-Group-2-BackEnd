import db from "../client.js";

// Get all images for a faculty member
const getImagesByFaculty = async (facultyId) => {
  const query = `
    SELECT image_id, faculty_id, image_url, alt_text, is_profile
    FROM faculty_images
    WHERE faculty_id = $1
    ORDER BY is_profile DESC, image_id;
  `;
  const result = await db.query(query, [facultyId]);
  return result.rows;
};

// Get profile image for a faculty member
const getProfileImageByFaculty = async (facultyId) => {
  const query = `
    SELECT image_id, faculty_id, image_url, alt_text, is_profile
    FROM faculty_images
    WHERE faculty_id = $1 AND is_profile = TRUE
    LIMIT 1;
  `;
  const result = await db.query(query, [facultyId]);
  return result.rows[0];
};

// Get image by ID
const getFacultyImageById = async (imageId) => {
  const query = `
    SELECT image_id, faculty_id, image_url, alt_text, is_profile
    FROM faculty_images
    WHERE image_id = $1;
  `;
  const result = await db.query(query, [imageId]);
  return result.rows[0];
};

// Add image to faculty member
const addFacultyImage = async (
  facultyId,
  imageUrl,
  altText,
  isProfile = true
) => {
  const query = `
    INSERT INTO faculty_images (faculty_id, image_url, alt_text, is_profile)
    VALUES ($1, $2, $3, $4)
    RETURNING image_id, faculty_id, image_url, alt_text, is_profile;
  `;
  const result = await db.query(query, [
    facultyId,
    imageUrl,
    altText,
    isProfile,
  ]);
  return result.rows[0];
};

// Update faculty image
const updateFacultyImage = async (imageId, imageUrl, altText, isProfile) => {
  const query = `
    UPDATE faculty_images
    SET image_url = $1, alt_text = $2, is_profile = $3
    WHERE image_id = $4
    RETURNING image_id, faculty_id, image_url, alt_text, is_profile;
  `;
  const result = await db.query(query, [imageUrl, altText, isProfile, imageId]);
  return result.rows[0];
};

// Set image as profile (unsets other profile images for the faculty member)
const setProfileImage = async (imageId, facultyId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Unset all profile images for this faculty member
    await client.query(
      "UPDATE faculty_images SET is_profile = FALSE WHERE faculty_id = $1",
      [facultyId]
    );

    // Set the specified image as profile
    const result = await client.query(
      "UPDATE faculty_images SET is_profile = TRUE WHERE image_id = $1 RETURNING *",
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

// Delete faculty image
const deleteFacultyImage = async (imageId) => {
  const query = `
    DELETE FROM faculty_images
    WHERE image_id = $1
    RETURNING image_id, faculty_id;
  `;
  const result = await db.query(query, [imageId]);
  return result.rows[0];
};

export {
  getImagesByFaculty,
  getProfileImageByFaculty,
  getFacultyImageById,
  addFacultyImage,
  updateFacultyImage,
  setProfileImage,
  deleteFacultyImage,
};
