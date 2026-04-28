const express = require('express');
const ctrl = require('../controllers/studentsController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.get('/', ctrl.listStudents);
router.get('/:id', ctrl.getStudent);
module.exports = router;
