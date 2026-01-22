DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS department_images;
DROP TABLE IF EXISTS faculty_images;
DROP TABLE IF EXISTS department_contacts;
DROP TABLE IF EXISTS faculty_contacts;
DROP TABLE IF EXISTS faculty_departments;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('visitor', 'administrator')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE faculty (
    faculty_id SERIAL PRIMARY KEY,
    department_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bio TEXT,
    title VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE CASCADE
);
CREATE TABLE department_images (
    image_id SERIAL PRIMARY KEY,
    department_id INT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_department_image
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE CASCADE
);
CREATE TABLE faculty_images (
    image_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_profile BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_faculty_image
        FOREIGN KEY (faculty_id)
        REFERENCES faculty(faculty_id)
        ON DELETE CASCADE
);
CREATE TABLE department_contacts (
    contact_id SERIAL PRIMARY KEY,
    department_id INT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    office_location VARCHAR(255),
    CONSTRAINT fk_department_contact
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE CASCADE
);
CREATE TABLE faculty_contacts (
    contact_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    office_location VARCHAR(255),
    website_url TEXT,
    CONSTRAINT fk_faculty_contact
        FOREIGN KEY (faculty_id)
        REFERENCES faculty(faculty_id)
        ON DELETE CASCADE
);
CREATE TABLE faculty_departments (
    faculty_id INT,
    department_id INT,
    PRIMARY KEY (faculty_id, department_id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
