// allowed only for registered user (JWT) to start consultation.
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { startConsultation } = require('../controllers/startConsultation.controller');
const { readConsultation ,getConsultations } = require('../controllers/readConsultation.controller');
const { getPConsultation } = require('../controllers/PConsultation.controller');
const { findExistingConsultation } = require('../controllers/readConsultation.controller');
// POST /api/consultation/start
router.post('/start', auth, startConsultation); // !!! ok

// GET /api/consultation/
//get the paginated consultations for a specific status
router.get('/', auth, getPConsultation); // !!! ok

// GET /api/consultation/:id
router.get('/read/:id', auth, readConsultation); // !!! ok

// GET api/consultation?status=:status
// get the consultations for a specific status for user
router.get("", auth, getConsultations); // !!! ok

// GET /api/consultation/existing?engineerId=XYZ
router.get('/existing', auth, findExistingConsultation);

module.exports = router;