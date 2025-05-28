const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/users'); 
require('./db'); 

const registerHandler = async (request, h) => {
  const { name, email, password } = request.payload;

  if (!name || !email || !password) {
    return h.response({
      status: 'fail',
      message: 'Gagal registrasi. Mohon isi semua field'
    }).code(400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return h.response({
      status: 'fail',
      message: 'Gagal registrasi. Email sudah terdaftar'
    }).code(400);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword
  });

  await newUser.save();

  return h.response({
    status: 'success',
    message: 'Registrasi berhasil'
  }).code(201);
};

const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  if (!email || !password) {
    return h.response({
      status: 'fail',
      message: 'Gagal login. Mohon isi email dan password'
    }).code(400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    return h.response({
      status: 'fail',
      message: 'Email atau password salah'
    }).code(401);
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return h.response({
      status: 'fail',
      message: 'Email atau password salah'
    }).code(401);
  }

  const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });

  return h.response({
    status: 'success',
    data: {
      token
    }
  });
};

const authMiddleware = (request, h) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return h.response({
      status: 'fail',
      message: 'Akses ditolak. Token tidak tersedia'
    }).code(401);
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret_key');
    request.auth = decoded;
    return h.continue;
  } catch {
    return h.response({
      status: 'fail',
      message: 'Token tidak valid'
    }).code(401);
  }
};

module.exports = {
  registerHandler,
  loginHandler,
  authMiddleware
};