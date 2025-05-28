const { 
  registerHandler, 
  loginHandler, 
} = require('./auth');

const routes = [
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
  {
    method: 'GET',
    path: '/hello',
    handler: (request, h) => {
      return 'Hello, World!';
    }
  },
];

module.exports = routes;