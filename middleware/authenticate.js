const jwt = require('jsonwebtoken');
const Users = require('../models/users');

module.exports = async function(req, res, next) {
  const token = req.header('X-Auth-Token');
  if (!token) {
    return res.status(400).send('no token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT);
    const user = await Users.findById(decoded.id).select('-password');
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send('invalid user');
  }
};
