const classModel = require('../models/classModel');
const studentModel = require('../models/studentModel');

function getStudentFormData(req) {
  return {
    student_no: req.body.student_no ? req.body.student_no.trim() : '',
    name: req.body.name ? req.body.name.trim() : '',
    gender: req.body.gender || '男',
    class_name: req.body.class_name ? req.body.class_name.trim() : '',
    phone: req.body.phone ? req.body.phone.trim() : '',
    email: req.body.email ? req.body.email.trim() : '',
    birthday: req.body.birthday ? req.body.birthday.trim() : '',
    status: req.body.status || '在读',
    dormitory: req.body.dormitory ? req.body.dormitory.trim() : '',
    emergency_contact: req.body.emergency_contact ? req.body.emergency_contact.trim() : '',
    emergency_phone: req.body.emergency_phone ? req.body.emergency_phone.trim() : '',
    notes: req.body.notes ? req.body.notes.trim() : ''
  };
}

function validateStudent(student) {
  if (!student.student_no) return '学号不能为空';
  if (!student.name) return '姓名不能为空';
  if (!student.class_name) return '班级不能为空';
  return null;
}

function normalizeFilters(req) {
  return {
    keyword: req.query.keyword ? req.query.keyword.trim() : '',
    gender: req.query.gender ? req.query.gender.trim() : '',
    class_name: req.query.class_name ? req.query.class_name.trim() : '',
    status: req.query.status ? req.query.status.trim() : ''
  };
}

function buildPagination(page, totalPages) {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }

  return pages;
}

async function getSidebarStats() {
  const classes = await classModel.findAll();

  return classes.reduce(
    (summary, item) => {
      summary.studentCount += Number(item.student_count || 0);
      summary.classCount += 1;
      summary.capacity += Number(item.student_capacity || 0);
      return summary;
    },
    { studentCount: 0, classCount: 0, capacity: 0 }
  );
}

async function listStudents(req, res) {
  const filters = normalizeFilters(req);
  const requestedPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = 8;

  const total = await studentModel.countAll(filters);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const page = Math.min(requestedPage, totalPages);

  const [students, genderStats, classStats, statusStats, recentStudents, classList] =
    await Promise.all([
      studentModel.findPage(filters, pageSize, (page - 1) * pageSize),
      studentModel.countByGender(filters),
      studentModel.countByClass(filters),
      studentModel.countByStatus(filters),
      studentModel.findRecent(5),
      classModel.findAll()
    ]);

  const genderSummary = {
    male: 0,
    female: 0,
    other: 0
  };

  genderStats.forEach((item) => {
    if (item.gender === '男') genderSummary.male = item.total;
    else if (item.gender === '女') genderSummary.female = item.total;
    else genderSummary.other += item.total;
  });

  res.render('students', {
    students,
    filters,
    stats: {
      total,
      genderSummary,
      classCount: classStats.length,
      statusStats
    },
    classStats: classStats.slice(0, 6),
    recentStudents,
    classOptions: classList.map((item) => item.class_name),
    classList: classList.slice(0, 4),
    pagination: {
      page,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      pages: buildPagination(page, totalPages)
    },
    user: req.session.user
  });
}

async function showNewForm(req, res) {
  const [classOptions, sidebarStats] = await Promise.all([
    classModel.findNames(),
    getSidebarStats()
  ]);

  res.render('student-form', {
    mode: 'create',
    student: {
      gender: '男',
      status: '在读'
    },
    classOptions,
    error: null,
    formAction: '/students',
    sidebarStats,
    user: req.session.user
  });
}

async function showStudentDetail(req, res) {
  const student = await studentModel.findById(req.params.id);

  if (!student) {
    return res.redirect('/students');
  }

  const [relatedClass, sidebarStats] = await Promise.all([
    classModel.findByName(student.class_name),
    getSidebarStats()
  ]);

  res.render('student-detail', {
    student,
    relatedClass,
    sidebarStats,
    user: req.session.user
  });
}

async function createStudent(req, res) {
  const student = getStudentFormData(req);
  const error = validateStudent(student);
  const classOptions = await classModel.findNames();

  if (error) {
    return res.render('student-form', {
      mode: 'create',
      student,
      classOptions,
      error,
      formAction: '/students',
      sidebarStats: await getSidebarStats(),
      user: req.session.user
    });
  }

  const exists = await studentModel.findByStudentNo(student.student_no);
  if (exists) {
    return res.render('student-form', {
      mode: 'create',
      student,
      classOptions,
      error: '学号已存在',
      formAction: '/students',
      sidebarStats: await getSidebarStats(),
      user: req.session.user
    });
  }

  await studentModel.create(student);
  res.redirect('/students');
}

async function showEditForm(req, res) {
  const [student, classOptions, sidebarStats] = await Promise.all([
    studentModel.findById(req.params.id),
    classModel.findNames(),
    getSidebarStats()
  ]);

  if (!student) {
    return res.redirect('/students');
  }

  res.render('student-form', {
    mode: 'edit',
    student,
    classOptions,
    error: null,
    formAction: `/students/${student.id}/update`,
    sidebarStats,
    user: req.session.user
  });
}

async function updateStudent(req, res) {
  const student = getStudentFormData(req);
  const error = validateStudent(student);
  const id = req.params.id;
  const classOptions = await classModel.findNames();

  if (error) {
    student.id = id;
    return res.render('student-form', {
      mode: 'edit',
      student,
      classOptions,
      error,
      formAction: `/students/${id}/update`,
      sidebarStats: await getSidebarStats(),
      user: req.session.user
    });
  }

  const exists = await studentModel.findByStudentNoExceptId(student.student_no, id);
  if (exists) {
    student.id = id;
    return res.render('student-form', {
      mode: 'edit',
      student,
      classOptions,
      error: '学号已存在',
      formAction: `/students/${id}/update`,
      sidebarStats: await getSidebarStats(),
      user: req.session.user
    });
  }

  await studentModel.update(id, student);
  res.redirect(`/students/${id}`);
}

async function deleteStudent(req, res) {
  await studentModel.remove(req.params.id);
  res.redirect('/students');
}

async function exportStudents(req, res) {
  const filters = normalizeFilters(req);
  const students = await studentModel.findAll(filters);
  const rows = [
    [
      '学号',
      '姓名',
      '性别',
      '班级',
      '状态',
      '电话',
      '邮箱',
      '宿舍',
      '紧急联系人',
      '紧急电话',
      '创建时间'
    ],
    ...students.map((student) => [
      student.student_no,
      student.name,
      student.gender,
      student.class_name,
      student.status,
      student.phone || '',
      student.email || '',
      student.dormitory || '',
      student.emergency_contact || '',
      student.emergency_phone || '',
      student.created_at ? new Date(student.created_at).toLocaleString('zh-CN') : ''
    ])
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
  res.send(`\uFEFF${csv}`);
}

module.exports = {
  listStudents,
  showNewForm,
  showStudentDetail,
  createStudent,
  showEditForm,
  updateStudent,
  deleteStudent,
  exportStudents
};
