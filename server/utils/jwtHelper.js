const jwt = require('jsonwebtoken');

exports.sign = (payload, expiresIn = '7d') => jwt.sign(payload, process.env.JWT_SECRET || 'devsecret', { expiresIn });
