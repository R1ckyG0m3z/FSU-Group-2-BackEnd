import db from "../client.js";

// Get contact information for a faculty member
const getContactByFaculty = async (facultyId) => {
  const query = `
    SELECT contact_id, faculty_id, email, phone, office_location, website_url
    FROM faculty_contacts
    WHERE faculty_id = $1;
  `;
  const result = await db.query(query, [facultyId]);
  return result.rows[0];
};

// Get all faculty contacts
const getAllFacultyContacts = async () => {
  const query = `
    SELECT 
      fc.contact_id, 
      fc.faculty_id, 
      fc.email, 
      fc.phone, 
      fc.office_location,
      fc.website_url,
      f.first_name,
      f.last_name
    FROM faculty_contacts fc
    LEFT JOIN faculty f ON fc.faculty_id = f.faculty_id
    ORDER BY f.last_name, f.first_name;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Get contact by ID
const getFacultyContactById = async (contactId) => {
  const query = `
    SELECT contact_id, faculty_id, email, phone, office_location, website_url
    FROM faculty_contacts
    WHERE contact_id = $1;
  `;
  const result = await db.query(query, [contactId]);
  return result.rows[0];
};

// Create contact for faculty member
const createFacultyContact = async (
  facultyId,
  email,
  phone,
  officeLocation,
  websiteUrl
) => {
  const query = `
    INSERT INTO faculty_contacts (faculty_id, email, phone, office_location, website_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING contact_id, faculty_id, email, phone, office_location, website_url;
  `;
  const result = await db.query(query, [
    facultyId,
    email,
    phone,
    officeLocation,
    websiteUrl,
  ]);
  return result.rows[0];
};

// Update faculty contact
const updateFacultyContact = async (
  contactId,
  email,
  phone,
  officeLocation,
  websiteUrl
) => {
  const query = `
    UPDATE faculty_contacts
    SET email = $1, phone = $2, office_location = $3, website_url = $4
    WHERE contact_id = $5
    RETURNING contact_id, faculty_id, email, phone, office_location, website_url;
  `;
  const result = await db.query(query, [
    email,
    phone,
    officeLocation,
    websiteUrl,
    contactId,
  ]);
  return result.rows[0];
};

// Delete faculty contact
const deleteFacultyContact = async (contactId) => {
  const query = `
    DELETE FROM faculty_contacts
    WHERE contact_id = $1
    RETURNING contact_id, faculty_id;
  `;
  const result = await db.query(query, [contactId]);
  return result.rows[0];
};

export {
  getContactByFaculty,
  getAllFacultyContacts,
  getFacultyContactById,
  createFacultyContact,
  updateFacultyContact,
  deleteFacultyContact,
};
