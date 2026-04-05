const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  getConsultations,
  acceptConsultation,
} = require("../controllers/engineer.controller");

// accept a consultation
router.put("/:id/accept", auth, acceptConsultation);  // !!! ok

// get the consultations for a specific status for engineer
router.get("/:status", auth, getConsultations);
  //ok

module.exports = router;
