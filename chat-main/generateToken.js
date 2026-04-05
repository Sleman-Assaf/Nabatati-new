
// node generateToken.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); 

// إعداد بيانات المستخدم
const userPayload = {
  user_id: 36,
  name: 'jihad',
  email: 'jihad@gmail.com',
  role: 'user'
};

// إعداد بيانات المهندس
const engineerPayload = {
  user_id: 99,
  name: 'eng. ali',
  email: 'ali@agr.com',
  role: 'engineer'
};

const token1 = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '2d' });
const token2 = jwt.sign(engineerPayload, process.env.JWT_SECRET, { expiresIn: '2d' });

console.log('\n=== ✅ User Token (role: user) ===\n');
console.log(token1);

console.log('\n=== ✅ Engineer Token (role: engineer) ===\n');
console.log(token2);