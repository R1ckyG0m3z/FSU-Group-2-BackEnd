import db from "#db/client";
import bcrypt from "bcrypt";

// Bcrypt configuration
const SALT_ROUNDS = 10;

// Hash password with bcrypt
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password with hashed password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Register new user with password hashing
const registerUser = async (email, password, role = "visitor") => {
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash the password
  const passwordHash = await hashPassword(password);

  // Create the user
  const query = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING user_id, email, role, created_at, updated_at;
  `;
  const result = await db.query(query, [email, passwordHash, role]);
  return result.rows[0];
};

// Authenticate user (login)
const authenticateUser = async (email, password) => {
  // Get user by email with password hash
  const user = await getUserByEmail(email);

  if (!user) {
    return null; // User not found
  }

  // Compare provided password with stored hash
  const isValidPassword = await comparePassword(password, user.password_hash);

  if (!isValidPassword) {
    return null; // Invalid password
  }

  // Return user without password hash
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Change user password with old password verification
const changePassword = async (userId, oldPassword, newPassword) => {
  // Get user with password hash
  const query = `
    SELECT user_id, email, password_hash, role
    FROM users
    WHERE user_id = $1;
  `;
  const result = await db.query(query, [userId]);
  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  // Verify old password
  const isValidPassword = await comparePassword(
    oldPassword,
    user.password_hash
  );
  if (!isValidPassword) {
    throw new Error("Invalid old password");
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  const updateQuery = `
    UPDATE users
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
    RETURNING user_id, email, role, updated_at;
  `;
  const updateResult = await db.query(updateQuery, [newPasswordHash, userId]);
  return updateResult.rows[0];
};

// Get user by email
const getUserByEmail = async (email) => {
  const query = `
    SELECT user_id, email, password_hash, role, created_at, updated_at
    FROM users
    WHERE email = $1;
  `;
  const result = await db.query(query, [email]);
  return result.rows[0];
};

// Get user by ID
const getUserById = async (userId) => {
  const query = `
    SELECT user_id, email, role, created_at, updated_at
    FROM users
    WHERE user_id = $1;
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

// Create new user
const createUser = async (email, passwordHash, role = "visitor") => {
  const query = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING user_id, email, role, created_at, updated_at;
  `;
  const result = await db.query(query, [email, passwordHash, role]);
  return result.rows[0];
};

// Reset user password (admin function - doesn't require old password)
const resetUserPassword = async (userId, newPassword) => {
  const newPasswordHash = await hashPassword(newPassword);

  const query = `
    UPDATE users
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
    RETURNING user_id, email, role, updated_at;
  `;
  const result = await db.query(query, [newPasswordHash, userId]);
  return result.rows[0];
};

// Update user password (deprecated - use changePassword or resetUserPassword instead)
const updateUserPassword = async (userId, newPasswordHash) => {
  const query = `
    UPDATE users
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
    RETURNING user_id, email, role, updated_at;
  `;
  const result = await db.query(query, [newPasswordHash, userId]);
  return result.rows[0];
};

// Update user role
const updateUserRole = async (userId, newRole) => {
  const query = `
    UPDATE users
    SET role = $1, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
    RETURNING user_id, email, role, updated_at;
  `;
  const result = await db.query(query, [newRole, userId]);
  return result.rows[0];
};

// Get all users
const getAllUsers = async () => {
  const query = `
    SELECT user_id, email, role, created_at, updated_at
    FROM users
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Delete user
const deleteUser = async (userId) => {
  const query = `
    DELETE FROM users
    WHERE user_id = $1
    RETURNING user_id, email;
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

export {
  // Bcrypt utilities
  hashPassword,
  comparePassword,
  // Authentication
  registerUser,
  authenticateUser,
  changePassword,
  resetUserPassword,
  // User CRUD operations
  getUserByEmail,
  getUserById,
  createUser,
  updateUserPassword,
  updateUserRole,
  getAllUsers,
  deleteUser,
};
