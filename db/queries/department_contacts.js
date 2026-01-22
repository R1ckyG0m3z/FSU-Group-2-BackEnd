import db from "../client.js";

// Get contact information for a department
const getContactByDepartment = async (departmentId) => {
  const query = `
    SELECT contact_id, department_id, email, phone, office_location
    FROM department_contacts
    WHERE department_id = $1;
  `;
  const result = await db.query(query, [departmentId]);
  return result.rows[0];
};

// Get all department contacts
const getAllDepartmentContacts = async () => {
  const query = `
    SELECT 
      dc.contact_id, 
      dc.department_id, 
      dc.email, 
      dc.phone, 
      dc.office_location,
      d.name as department_name
    FROM department_contacts dc
    LEFT JOIN departments d ON dc.department_id = d.department_id
    ORDER BY d.name;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Get contact by ID
const getDepartmentContactById = async (contactId) => {
  const query = `
    SELECT contact_id, department_id, email, phone, office_location
    FROM department_contacts
    WHERE contact_id = $1;
  `;
  const result = await db.query(query, [contactId]);
  return result.rows[0];
};

// Create contact for department
const createDepartmentContact = async (
  departmentId,
  email,
  phone,
  officeLocation
) => {
  const query = `
    INSERT INTO department_contacts (department_id, email, phone, office_location)
    VALUES ($1, $2, $3, $4)
    RETURNING contact_id, department_id, email, phone, office_location;
  `;
  const result = await db.query(query, [
    departmentId,
    email,
    phone,
    officeLocation,
  ]);
  return result.rows[0];
};

// Update department contact
const updateDepartmentContact = async (
  contactId,
  email,
  phone,
  officeLocation
) => {
  const query = `
    UPDATE department_contacts
    SET email = $1, phone = $2, office_location = $3
    WHERE contact_id = $4
    RETURNING contact_id, department_id, email, phone, office_location;
  `;
  const result = await db.query(query, [
    email,
    phone,
    officeLocation,
    contactId,
  ]);
  return result.rows[0];
};

// Delete department contact
const deleteDepartmentContact = async (contactId) => {
  const query = `
    DELETE FROM department_contacts
    WHERE contact_id = $1
    RETURNING contact_id, department_id;
  `;
  const result = await db.query(query, [contactId]);
  return result.rows[0];
};

export {
  getContactByDepartment,
  getAllDepartmentContacts,
  getDepartmentContactById,
  createDepartmentContact,
  updateDepartmentContact,
  deleteDepartmentContact,
};
