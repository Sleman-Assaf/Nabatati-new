//get the paginated messages for a specific consultationId

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const {getPMessages} = require('../controllers/PMessages.controller.js');

router.get('/:consultationId', auth, getPMessages);
module.exports = router;
