import db from "../client.js";

// Get all departments
const getAllDepartments = async () => {
  const query = `
    SELECT department_id, name, description, created_at, updated_at
    FROM departments
    ORDER BY name;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Get department by ID
const getDepartmentById = async (departmentId) => {
  const query = `
    SELECT department_id, name, description, created_at, updated_at
    FROM departments
    WHERE department_id = $1;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows[0];
};

// Get department with all related data (images, contacts, faculty)
const getDepartmentWithDetails = async (departmentId) => {
  const query = `
    SELECT 
      d.department_id,
      d.name,
      d.description,
      d.created_at,
      d.updated_at,
      json_agg(DISTINCT jsonb_build_object(
        'image_id', di.image_id,
        'image_url', di.image_url,
        'alt_text', di.alt_text,
        'is_primary', di.is_primary
      )) FILTER (WHERE di.image_id IS NOT NULL) AS images,
      json_agg(DISTINCT jsonb_build_object(
        'contact_id', dc.contact_id,
        'email', dc.email,
        'phone', dc.phone,
        'office_location', dc.office_location
      )) FILTER (WHERE dc.contact_id IS NOT NULL) AS contacts,
      json_agg(DISTINCT jsonb_build_object(
        'faculty_id', f.faculty_id,
        'first_name', f.first_name,
        'last_name', f.last_name,
        'title', f.title
      )) FILTER (WHERE f.faculty_id IS NOT NULL) AS faculty
    FROM departments d
    LEFT JOIN department_images di ON d.department_id = di.department_id
    LEFT JOIN department_contacts dc ON d.department_id = dc.department_id
    LEFT JOIN faculty f ON d.department_id = f.department_id
    WHERE d.department_id = $1
    GROUP BY d.department_id;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows[0];
};

// Create new department
const createDepartment = async (name, description) => {
  const query = `
    INSERT INTO departments (name, description)
    VALUES ($1, $2)
    RETURNING department_id, name, description, created_at, updated_at;
  `;
  const result = await db.query(query, [name, description]);
  return result.rows[0];
};

// Update department
const updateDepartment = async (departmentId, name, description) => {
  const query = `
    UPDATE departments
    SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
    WHERE department_id = $3
    RETURNING department_id, name, description, updated_at;
  `;
  const result = await db.query(query, [name, description, departmentId]);
  return result.rows[0];
};

// Delete department
const deleteDepartment = async (departmentId) => {
  const query = `
    DELETE FROM departments
    WHERE department_id = $1
    RETURNING department_id, name;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows[0];
};

// Get faculty count by department
const getFacultyCountByDepartment = async (departmentId) => {
  const query = `
    SELECT COUNT(*) as faculty_count
    FROM faculty
    WHERE department_id = $1;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows[0];
};

export {
  getAllDepartments,
  getDepartmentById,
  getDepartmentWithDetails,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getFacultyCountByDepartment,
};
