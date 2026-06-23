const studentModel = require('../models/studentModel');

function getFormData(req) {
  return {
    student_no: req.body.student_no ? req.body.student_no.trim() : '',
    name: req.body.name ? req.body.name.trim() : '',
    gender: req.body.gender || '男',
    class_name: req.body.class_name ? req.body.class_name.trim() : '',
    phone: req.body.phone ? req.body.phone.trim() : ''
  };
}

function validateStudent(student) {
  if (!student.student_no) return '学号不能为空';
  if (!student.name) return '姓名不能为空';
  if (!student.class_name) return '班级不能为空';
  return null;
}

async function listStudents(req, res) {
  const keyword = req.query.keyword ? req.query.keyword.trim() : '';
  const students = await studentModel.findAll(keyword);

  res.render('students', {
    students,
    keyword,
    user: req.session.user
  });
}

function showNewForm(req, res) {
  res.render('student-form', {
    mode: 'create',
    student: {},
    error: null,
    formAction: '/students'
  });
}

async function createStudent(req, res) {
  const student = getFormData(req);
  const error = validateStudent(student);

  if (error) {
    return res.render('student-form', {
      mode: 'create',
      student,
      error,
      formAction: '/students'
    });
  }

  const exists = await studentModel.findByStudentNo(student.student_no);
  if (exists) {
    return res.render('student-form', {
      mode: 'create',
      student,
      error: '学号已存在',
      formAction: '/students'
    });
  }

  await studentModel.create(student);
  res.redirect('/students');
}

async function showEditForm(req, res) {
  const student = await studentModel.findById(req.params.id);

  if (!student) {
    return res.redirect('/students');
  }

  res.render('student-form', {
    mode: 'edit',
    student,
    error: null,
    formAction: `/students/${student.id}/update`
  });
}

async function updateStudent(req, res) {
  const student = getFormData(req);
  const error = validateStudent(student);
  const id = req.params.id;

  if (error) {
    student.id = id;
    return res.render('student-form', {
      mode: 'edit',
      student,
      error,
      formAction: `/students/${id}/update`
    });
  }

  const exists = await studentModel.findByStudentNoExceptId(student.student_no, id);
  if (exists) {
    student.id = id;
    return res.render('student-form', {
      mode: 'edit',
      student,
      error: '学号已存在',
      formAction: `/students/${id}/update`
    });
  }

  await studentModel.update(id, student);
  res.redirect('/students');
}

async function deleteStudent(req, res) {
  await studentModel.remove(req.params.id);
  res.redirect('/students');
}

module.exports = {
  listStudents,
  showNewForm,
  createStudent,
  showEditForm,
  updateStudent,
  deleteStudent
};