const express = require('express');
const studentController = require('../controllers/studentController');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/students', requireLogin, studentController.listStudents);
router.get('/students/new', requireLogin, studentController.showNewForm);
router.post('/students', requireLogin, studentController.createStudent);
router.get('/students/:id/edit', requireLogin, studentController.showEditForm);
router.post('/students/:id/update', requireLogin, studentController.updateStudent);
router.post('/students/:id/delete', requireLogin, studentController.deleteStudent);

module.exports = router;