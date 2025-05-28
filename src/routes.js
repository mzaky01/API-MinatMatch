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
  //buat tes di awal
  {
    method: 'GET',
    path: '/hello',
    handler: (request, h) => {
      return 'Hello, World!';
    }
  },
];

module.exports = routes;