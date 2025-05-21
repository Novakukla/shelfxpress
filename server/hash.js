const bcrypt = require('bcrypt');

const plainPassword = 'test123'; // replace with your real password

bcrypt.hash(plainPassword, 10).then(hash => {
  console.log('Hashed password:', hash);
});
