import db from "../client.js";

// Get all departments for a faculty member
const getDepartmentsByFaculty = async (facultyId) => {
  const query = `
    SELECT 
      d.department_id,
      d.name,
      d.description
    FROM faculty_departments fd
    JOIN departments d ON fd.department_id = d.department_id
    WHERE fd.faculty_id = $1
    ORDER BY d.name;
  `;
  const result = await db.query(query, [facultyId]);
  return result.rows;
};

// Get all faculty members in a department (using junction table)
const getFacultyByDepartmentRelation = async (departmentId) => {
  const query = `
    SELECT 
      f.faculty_id,
      f.first_name,
      f.last_name,
      f.title,
      f.bio
    FROM faculty_departments fd
    JOIN faculty f ON fd.faculty_id = f.faculty_id
    WHERE fd.department_id = $1
    ORDER BY f.last_name, f.first_name;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows;
};

// Add faculty to department relationship
const addFacultyToDepartment = async (facultyId, departmentId) => {
  const query = `
    INSERT INTO faculty_departments (faculty_id, department_id)
    VALUES ($1, $2)
    ON CONFLICT (faculty_id, department_id) DO NOTHING
    RETURNING faculty_id, department_id;
  `;
  const result = await db.query(query, [facultyId, departmentId]);
  return result.rows[0];
};

// Remove faculty from department relationship
const removeFacultyFromDepartment = async (facultyId, departmentId) => {
  const query = `
    DELETE FROM faculty_departments
    WHERE faculty_id = $1 AND department_id = $2
    RETURNING faculty_id, department_id;
  `;
  const result = await db.query(query, [facultyId, departmentId]);
  return result.rows[0];
};

// Remove all department relationships for a faculty member
const removeAllDepartmentsForFaculty = async (facultyId) => {
  const query = `
    DELETE FROM faculty_departments
    WHERE faculty_id = $1
    RETURNING faculty_id, department_id;
  `;
  const result = await db.query(query, [facultyId]);
  return result.rows;
};

// Remove all faculty relationships for a department
const removeAllFacultyForDepartment = async (departmentId) => {
  const query = `
    DELETE FROM faculty_departments
    WHERE department_id = $1
    RETURNING faculty_id, department_id;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows;
};

// Check if faculty-department relationship exists
const checkFacultyDepartmentRelation = async (facultyId, departmentId) => {
  const query = `
    SELECT faculty_id, department_id
    FROM faculty_departments
    WHERE faculty_id = $1 AND department_id = $2;
  `;
  const result = await db.query(query, [facultyId, departmentId]);
  return result.rows.length > 0;
};

// Get all faculty-department relationships
const getAllFacultyDepartmentRelations = async () => {
  const query = `
    SELECT 
      fd.faculty_id,
      fd.department_id,
      f.first_name,
      f.last_name,
      d.name as department_name
    FROM faculty_departments fd
    JOIN faculty f ON fd.faculty_id = f.faculty_id
    JOIN departments d ON fd.department_id = d.department_id
    ORDER BY d.name, f.last_name, f.first_name;
  `;
  const result = await db.query(query);
  return result.rows;
};

export {
  getDepartmentsByFaculty,
  getFacultyByDepartmentRelation,
  addFacultyToDepartment,
  removeFacultyFromDepartment,
  removeAllDepartmentsForFaculty,
  removeAllFacultyForDepartment,
  checkFacultyDepartmentRelation,
  getAllFacultyDepartmentRelations,
};
