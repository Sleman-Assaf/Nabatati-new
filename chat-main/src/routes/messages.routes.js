//get the paginated messages for a specific consultationId

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const {getPMessages,
    sendMessages
} = require('../controllers/messages.controller.js');

//http://localhost:4000/api/messages/:consultationId?page=1&limit=10
router.get('/:consultationId', auth, getPMessages); // !!! ok

router.post('/send' , auth , sendMessages)  // !!! ok

module.exports = router;
