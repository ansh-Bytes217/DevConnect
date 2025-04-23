// validation.js
const validator = require('validator');

const validateUserSignup = (data) => {
  let errors = {};

  if (!validator.isLength(data.username, { min: 3, max: 50 })) {
    errors.username = 'Username must be between 3 and 50 characters';
  }

  if (!validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }

  if (!validator.isLength(data.password, { min: 6, max: 20 })) {
    errors.password = 'Password must be between 6 and 20 characters';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const validateUserSignin = (data) => {
  let errors = {};

  if (!validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }

  if (validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

module.exports = { validateUserSignup, validateUserSignin };
