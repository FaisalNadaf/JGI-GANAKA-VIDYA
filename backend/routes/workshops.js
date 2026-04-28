const express = require('express');
const ctrl = require('../controllers/workshopsController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/invite', ctrl.invite);
module.exports = router;
