const express = require('express');
const classController = require('../controllers/classController');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/classes', requireLogin, classController.listClasses);
router.get('/classes/new', requireLogin, classController.showNewForm);
router.post('/classes', requireLogin, classController.createClass);
router.get('/classes/:id/edit', requireLogin, classController.showEditForm);
router.post('/classes/:id/update', requireLogin, classController.updateClass);
router.post('/classes/:id/delete', requireLogin, classController.deleteClass);

module.exports = router;
