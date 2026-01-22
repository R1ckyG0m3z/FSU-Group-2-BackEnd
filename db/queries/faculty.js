import db from "../client.js";

// Get all faculty members
const getAllFaculty = async () => {
  const query = `
    SELECT 
      f.faculty_id,
      f.department_id,
      f.first_name,
      f.last_name,
      f.bio,
      f.title,
      f.created_at,
      f.updated_at,
      d.name as department_name
    FROM faculty f
    LEFT JOIN departments d ON f.department_id = d.department_id
    ORDER BY f.last_name, f.first_name;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Get faculty by ID
const getFacultyById = async (facultyId) => {
  const query = `
    SELECT 
      f.faculty_id,
      f.department_id,
      f.first_name,
      f.last_name,
      f.bio,
      f.title,
      f.created_at,
      f.updated_at,
      d.name as department_name
    FROM faculty f
    LEFT JOIN departments d ON f.department_id = d.department_id
    WHERE f.faculty_id = $1;
  `;
  const result = await db.query(query, [facultyId]);
  return result.rows[0];
};

// Get faculty with all details (images, contacts, departments)
const getFacultyWithDetails = async (facultyId) => {
  const query = `
    SELECT 
      f.faculty_id,
      f.department_id,
      f.first_name,
      f.last_name,
      f.bio,
      f.title,
      f.created_at,
      f.updated_at,
      d.name as primary_department_name,
      json_agg(DISTINCT jsonb_build_object(
        'image_id', fi.image_id,
        'image_url', fi.image_url,
        'alt_text', fi.alt_text,
        'is_profile', fi.is_profile
      )) FILTER (WHERE fi.image_id IS NOT NULL) AS images,
      json_agg(DISTINCT jsonb_build_object(
        'contact_id', fc.contact_id,
        'email', fc.email,
        'phone', fc.phone,
        'office_location', fc.office_location,
        'website_url', fc.website_url
      )) FILTER (WHERE fc.contact_id IS NOT NULL) AS contacts,
      json_agg(DISTINCT jsonb_build_object(
        'department_id', fd_d.department_id,
        'department_name', fd_d.name
      )) FILTER (WHERE fd_d.department_id IS NOT NULL) AS all_departments
    FROM faculty f
    LEFT JOIN departments d ON f.department_id = d.department_id
    LEFT JOIN faculty_images fi ON f.faculty_id = fi.faculty_id
    LEFT JOIN faculty_contacts fc ON f.faculty_id = fc.faculty_id
    LEFT JOIN faculty_departments fd ON f.faculty_id = fd.faculty_id
    LEFT JOIN departments fd_d ON fd.department_id = fd_d.department_id
    WHERE f.faculty_id = $1
    GROUP BY f.faculty_id, d.name;
  `;
  const result = await db.query(query, [facultyId]);
  return result.rows[0];
};

// Get faculty by department
const getFacultyByDepartment = async (departmentId) => {
  const query = `
    SELECT 
      f.faculty_id,
      f.department_id,
      f.first_name,
      f.last_name,
      f.bio,
      f.title,
      f.created_at,
      f.updated_at
    FROM faculty f
    WHERE f.department_id = $1
    ORDER BY f.last_name, f.first_name;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows;
};

// Create new faculty member
const createFaculty = async (departmentId, firstName, lastName, bio, title) => {
  const query = `
    INSERT INTO faculty (department_id, first_name, last_name, bio, title)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING faculty_id, department_id, first_name, last_name, bio, title, created_at, updated_at;
  `;
  const result = await db.query(query, [
    departmentId,
    firstName,
    lastName,
    bio,
    title,
  ]);
  return result.rows[0];
};

// Update faculty member
const updateFaculty = async (
  facultyId,
  departmentId,
  firstName,
  lastName,
  bio,
  title
) => {
  const query = `
    UPDATE faculty
    SET department_id = $1, first_name = $2, last_name = $3, bio = $4, title = $5, updated_at = CURRENT_TIMESTAMP
    WHERE faculty_id = $6
    RETURNING faculty_id, department_id, first_name, last_name, bio, title, updated_at;
  `;
  const result = await db.query(query, [
    departmentId,
    firstName,
    lastName,
    bio,
    title,
    facultyId,
  ]);
  return result.rows[0];
};

// Delete faculty member
const deleteFaculty = async (facultyId) => {
  const query = `
    DELETE FROM faculty
    WHERE faculty_id = $1
    RETURNING faculty_id, first_name, last_name;
  `;
  const result = await db.query(query, [facultyId]);
  return result.rows[0];
};

// Search faculty by name
const searchFacultyByName = async (searchTerm) => {
  const query = `
    SELECT 
      f.faculty_id,
      f.department_id,
      f.first_name,
      f.last_name,
      f.bio,
      f.title,
      d.name as department_name
    FROM faculty f
    LEFT JOIN departments d ON f.department_id = d.department_id
    WHERE LOWER(f.first_name) LIKE LOWER($1) OR LOWER(f.last_name) LIKE LOWER($1)
    ORDER BY f.last_name, f.first_name;
  `;
  const result = await db.query(query, [`%${searchTerm}%`]);
  return result.rows;
};

export {
  getAllFaculty,
  getFacultyById,
  getFacultyWithDetails,
  getFacultyByDepartment,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  searchFacultyByName,
};
