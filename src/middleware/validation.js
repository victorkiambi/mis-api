const validation = {
  // Validate program creation
  validateProgram: (req, res, next) => {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Program name is required'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Program name must be less than 100 characters'
      });
    }

    next();
  },

  // Validate household creation
  validateHousehold: (req, res, next) => {
    const {
      program_id,
      sublocation_id,
      head_first_name,
      head_last_name,
      head_id_number,
      phone
    } = req.body;

    if (!program_id || !sublocation_id || !head_first_name || !head_last_name || !head_id_number || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Validate phone number format (assuming Kenyan format)
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone number format. Use format: 254XXXXXXXXX'
      });
    }

    // Validate ID number
    if (head_id_number.length < 5 || head_id_number.length > 20) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID number length'
      });
    }

    next();
  },

  // Validate household member creation
  validateMember: (req, res, next) => {
    const { first_name, last_name, date_of_birth, relationship } = req.body;

    if (!first_name || !last_name || !date_of_birth || !relationship) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_of_birth)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Validate relationship
    const validRelationships = ['Spouse', 'Son', 'Daughter', 'Parent', 'Other'];
    if (!validRelationships.includes(relationship)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid relationship type'
      });
    }

    next();
  },

  // Validate authentication
  validateAuth: (req, res, next) => {
    const { email, password } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters'
      });
    }

    next();
  }
};

module.exports = validation; 