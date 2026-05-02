import crypto from 'crypto';
import mongoose from 'mongoose';
import { env } from '../../config/env.js';
import Admin from '../../../models/Admin.js';
import Club from '../../../models/Club.js';
import Student from '../../../models/Student.js';
import { sendVerificationEmail } from '../../utils/email.js';
import { createError, signToken } from '../../utils/jwt.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { hashToken } from '../../utils/tokens.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const kfupmEmailPattern = /^[^\s@]+@kfupm\.edu\.sa$/i;
const studentIdPattern = /^s\d{9}$/i;
const authAccountFields =
  'fullName clubName email studentId passwordHash isVerified status createdAt updatedAt';
const sessionAccountFields =
  'fullName clubName email studentId isVerified status createdAt updatedAt';

function requiredString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(400, `${fieldName} is required`);
  }

  return value.trim();
}

function validateRegisterInput(input) {
  const name = requiredString(input?.name ?? input?.fullName, 'Name');
  const email = requiredString(input?.email, 'Email').toLowerCase();
  const password = requiredString(input?.password, 'Password');
  const rawRole = input?.role ?? 'student';
  const role = typeof rawRole === 'string' ? rawRole.trim().toLowerCase() : '';
  const studentId = requiredString(input?.studentId, 'Student ID').toLowerCase();

  if (role !== 'student') {
    throw createError(400, 'Use the student registration flow for student accounts');
  }

  if (!kfupmEmailPattern.test(email)) {
    throw createError(400, 'Email must be a KFUPM email address');
  }

  if (password.length < 8) {
    throw createError(400, 'Password must be at least 8 characters');
  }

  if (!studentIdPattern.test(studentId)) {
    throw createError(400, 'Student ID must match format s123456789');
  }

  return { name, email, password, role, studentId };
}

function validateLoginInput(input) {
  const email = requiredString(input?.email, 'Email').toLowerCase();
  const password = requiredString(input?.password, 'Password');
  const rawRole = typeof input?.role === 'string' ? input.role.trim().toLowerCase() : '';
  const role = ['student', 'club', 'admin'].includes(rawRole) ? rawRole : '';

  if (!emailPattern.test(email)) {
    throw createError(400, 'Email format is invalid');
  }

  return { email, password, role };
}

function getRoleForAccount(account) {
  const modelName = account?.constructor?.modelName;

  if (modelName === 'Student') {
    return 'student';
  }

  if (modelName === 'Club') {
    return 'club';
  }

  if (modelName === 'Admin') {
    return 'admin';
  }

  return null;
}

export function sanitizeUser(account) {
  const role = getRoleForAccount(account);

  if (!account || !role) {
    return null;
  }

  return {
    id: String(account._id),
    name: account.fullName ?? account.clubName,
    fullName: account.fullName,
    clubName: account.clubName,
    email: account.email,
    role,
    studentId: account.studentId ?? null,
    isVerified: role === 'student' ? Boolean(account.isVerified) : true,
    isEmailVerified: role === 'student' ? Boolean(account.isVerified) : true,
    status: account.status,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

function hashVerificationValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function createVerificationCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function getVerificationExpiryDate() {
  return new Date(Date.now() + env.emailVerificationExpiresInSeconds * 1000);
}

async function saveVerificationValues(userId, code) {
  const verificationCodeHash = hashVerificationValue(code);
  const verificationExpiresAt = getVerificationExpiryDate();

  await Student.findByIdAndUpdate(userId, {
    verificationCode: verificationCodeHash,
    verificationCodeExpires: verificationExpiresAt,
  });

  return verificationExpiresAt;
}

async function issueVerificationEmail(user) {
  const code = createVerificationCode();
  const expiresAt = await saveVerificationValues(user._id, code);

  await sendVerificationEmail({
    to: user.email,
    name: user.fullName,
    code,
    expiresAt,
  });
}

function getTokenForUser(user) {
  const role = getRoleForAccount(user);

  return signToken({
    sub: String(user._id),
    email: user.email,
    role,
  });
}

async function findUserByVerificationValue(value) {
  const hashedValue = hashVerificationValue(value);
  return Student.findOne({ verificationCode: hashedValue });
}

function validateVerificationInput(input) {
  const value = requiredString(input?.code ?? input?.token, 'Verification code');
  return { value };
}

function getMatchedVerificationExpiry(user, value) {
  const hashedValue = hashVerificationValue(value);

  if (user.verificationCode === hashedValue) {
    return user.verificationCodeExpires;
  }

  return null;
}

export async function registerUser(input) {
  const payload = validateRegisterInput(input);
  const existingEmail = await Student.findOne({ email: payload.email });

  if (existingEmail) {
    throw createError(409, 'Email is already registered');
  }

  const existingStudentId = await Student.findOne({ studentId: payload.studentId });

  if (existingStudentId) {
    throw createError(409, 'Student ID is already registered');
  }

  const passwordHash = await hashPassword(payload.password);

  let user;

  try {
    user = await Student.create({
      fullName: payload.name,
      studentId: payload.studentId,
      email: payload.email,
      passwordHash,
      isVerified: false,
    });
  } catch (error) {
    if (error?.code === 11000) {
      if (error.keyPattern?.studentId || error.keyValue?.studentId) {
        throw createError(409, 'Student ID is already registered');
      }

      throw createError(409, 'Email is already registered');
    }

    throw error;
  }

  await issueVerificationEmail(user);

  return {
    message: 'Student registered successfully. Verify your email before logging in.',
    user: sanitizeUser(user),
  };
}

async function findAccountByEmail(email, role = '') {
  const normalizedEmail = email.toLowerCase();

  if (role === 'student') {
    return Student.findOne({ email: normalizedEmail }).select(authAccountFields);
  }

  if (role === 'club') {
    return Club.findOne({ email: normalizedEmail }).select(authAccountFields);
  }

  if (role === 'admin') {
    return Admin.findOne({ email: normalizedEmail }).select(authAccountFields);
  }

  const [student, club, admin] = await Promise.all([
    Student.findOne({ email: normalizedEmail }).select(authAccountFields),
    Club.findOne({ email: normalizedEmail }).select(authAccountFields),
    Admin.findOne({ email: normalizedEmail }).select(authAccountFields),
  ]);

  if (student) {
    return student;
  }

  if (club) {
    return club;
  }

  return admin;
}

export async function loginUser(input) {
  const payload = validateLoginInput(input);
  const user = await findAccountByEmail(payload.email, payload.role);

  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const accountRole = getRoleForAccount(user);

  if (accountRole === 'club' && !user.passwordHash) {
    throw createError(403, 'Set your club password using the setup email before logging in');
  }

  if (!user.passwordHash) {
    throw createError(401, 'Invalid email or password');
  }

  const isValidPassword = await verifyPassword(payload.password, user.passwordHash);

  if (!isValidPassword) {
    throw createError(401, 'Invalid email or password');
  }

  if (accountRole === 'student' && !user.isVerified) {
    throw createError(403, 'Verify your email before logging in');
  }

  if (accountRole === 'club' && user.status === 'suspended') {
    throw createError(403, 'Club account is suspended');
  }

  return {
    message: 'Login successful',
    token: getTokenForUser(user),
    user: sanitizeUser(user),
  };
}

export async function verifyEmailAddress(input) {
  const payload = validateVerificationInput(input);
  const user = await findUserByVerificationValue(payload.value);

  if (!user) {
    throw createError(400, 'Invalid verification code');
  }

  if (user.isVerified) {
    return {
      message: 'Email is already verified',
      token: getTokenForUser(user),
      user: sanitizeUser(user),
    };
  }

  const verificationExpiresAt = getMatchedVerificationExpiry(user, payload.value);

  if (!verificationExpiresAt || new Date(verificationExpiresAt).getTime() <= Date.now()) {
    throw createError(400, 'Verification code has expired');
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  const verifiedUser = await user.save();

  return {
    message: 'Email verified successfully',
    token: getTokenForUser(verifiedUser),
    user: sanitizeUser(verifiedUser),
  };
}

export async function resendVerificationEmail(input) {
  const email = requiredString(input?.email, 'Email').toLowerCase();

  if (!kfupmEmailPattern.test(email)) {
    throw createError(400, 'Email must be a KFUPM email address');
  }

  const user = await Student.findOne({ email });

  if (!user) {
    throw createError(404, 'Student not found');
  }

  if (user.isVerified) {
    throw createError(400, 'Email is already verified');
  }

  await issueVerificationEmail(user);

  return {
    message: 'Verification email sent successfully',
  };
}

function getPasswordSetupExpiryErrorMessage() {
  return 'Password setup link is invalid or expired';
}

async function findClubByPasswordSetupToken(token) {
  const hashedToken = hashToken(token);
  return Club.findOne({ passwordSetupToken: hashedToken });
}

function validatePasswordSetupToken(input) {
  return requiredString(input?.token, 'Password setup token');
}

function validatePasswordSetupInput(input) {
  const token = validatePasswordSetupToken(input);
  const password = requiredString(input?.password, 'Password');

  if (password.length < 8) {
    throw createError(400, 'Password must be at least 8 characters');
  }

  return { token, password };
}

function assertValidPasswordSetupClub(club) {
  if (!club || !club.passwordSetupToken) {
    throw createError(400, getPasswordSetupExpiryErrorMessage());
  }

  if (!club.passwordSetupExpires || club.passwordSetupExpires.getTime() <= Date.now()) {
    throw createError(400, getPasswordSetupExpiryErrorMessage());
  }
}

export async function getClubPasswordSetup(input) {
  const token = validatePasswordSetupToken(input);
  const club = await findClubByPasswordSetupToken(token);

  assertValidPasswordSetupClub(club);

  return {
    club: {
      clubName: club.clubName,
      email: club.email,
    },
  };
}

export async function setupClubPassword(input) {
  const payload = validatePasswordSetupInput(input);
  const club = await findClubByPasswordSetupToken(payload.token);

  assertValidPasswordSetupClub(club);

  club.passwordHash = await hashPassword(payload.password);
  club.passwordSetupToken = undefined;
  club.passwordSetupExpires = undefined;

  const updatedClub = await club.save();

  return {
    message: 'Club password set successfully',
    token: getTokenForUser(updatedClub),
    user: sanitizeUser(updatedClub),
  };
}

export async function findUserById(id, role) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const modelsByRole = {
    student: Student,
    club: Club,
    admin: Admin,
  };
  const model = modelsByRole[role];

  if (model) {
    return model.findById(id).select(sessionAccountFields);
  }

  return (
    (await Student.findById(id).select(sessionAccountFields)) ||
    (await Club.findById(id).select(sessionAccountFields)) ||
    Admin.findById(id).select(sessionAccountFields)
  );
}
