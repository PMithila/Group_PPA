import { User } from '../models/User.js';

const isNumeric = (value) => /^\d+$/.test(value);

const HONORIFICS = ['mr', 'ms', 'mrs', 'miss', 'dr', 'prof', 'sir', 'madam'];

const stripHonorifics = (name = '') => {
  if (!name) return '';
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return '';

  const first = parts[0].replace(/\./g, '').toLowerCase();
  if (HONORIFICS.includes(first)) {
    return parts.slice(1).join(' ');
  }
  return parts.join(' ');
};

const formatUserContact = (user) => {
  if (!user) return null;
  return {
    email: user.email,
    name: user.name || user.email,
    user
  };
};

export const resolveTeacherContact = async (rawValue) => {
  if (rawValue === undefined || rawValue === null) {
    return null;
  }

  const identifier = String(rawValue).trim();
  if (!identifier) {
    return null;
  }

  try {
    if (isNumeric(identifier)) {
      const userById = await User.findById(Number(identifier));
      if (userById) {
        return formatUserContact(userById);
      }
    }

    if (identifier.includes('@')) {
      const userByEmail = await User.findByEmail(identifier);
      if (userByEmail) {
        return formatUserContact(userByEmail);
      }

      return {
        email: identifier,
        name: identifier.split('@')[0] || identifier
      };
    }

    const userByName = await User.findByName(identifier);
    if (userByName) {
      return formatUserContact(userByName);
    }

    const withoutHonorifics = stripHonorifics(identifier);
    if (withoutHonorifics && withoutHonorifics.toLowerCase() !== identifier.toLowerCase()) {
      const userByStrippedName = await User.findByName(withoutHonorifics);
      if (userByStrippedName) {
        return formatUserContact(userByStrippedName);
      }
    }
  } catch (error) {
    console.error('Failed to resolve teacher contact:', error);
  }

  return null;
};
