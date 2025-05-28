const { 
  registerHandler, 
  loginHandler, 
} = require('./auth');

const routes = [
  // Autentikasi
  {
    method: 'POST',
    path: '/register',
    handler: registerHandler
  },
  {
    method: 'POST',
    path: '/login',
    handler: loginHandler
  },
];

module.exports = routes;