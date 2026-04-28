const express = require('express');
const ctrl = require('../controllers/coursesController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.get('/', ctrl.list);
module.exports = router;
