const classModel = require('../models/classModel');

function getClassFormData(req) {
  return {
    class_name: req.body.class_name ? req.body.class_name.trim() : '',
    grade: req.body.grade ? req.body.grade.trim() : '',
    major: req.body.major ? req.body.major.trim() : '',
    counselor: req.body.counselor ? req.body.counselor.trim() : '',
    monitor_name: req.body.monitor_name ? req.body.monitor_name.trim() : '',
    student_capacity: parseInt(req.body.student_capacity, 10) || 40
  };
}

function validateClass(classItem) {
  if (!classItem.class_name) return '班级名称不能为空';
  if (!classItem.grade) return '年级不能为空';
  if (!classItem.major) return '专业不能为空';
  if (!classItem.counselor) return '辅导员不能为空';
  return null;
}

function buildSummary(classes) {
  return classes.reduce(
    (result, item) => {
      result.classCount += 1;
      result.studentCount += Number(item.student_count || 0);
      result.capacity += Number(item.student_capacity || 0);
      return result;
    },
    { classCount: 0, studentCount: 0, capacity: 0 }
  );
}

async function getSidebarStats() {
  const classes = await classModel.findAll();
  return buildSummary(classes);
}

async function listClasses(req, res) {
  const classes = await classModel.findAll();
  res.render('classes', {
    classes,
    summary: buildSummary(classes),
    user: req.session.user,
    error: req.query.error || ''
  });
}

async function showNewForm(req, res) {
  res.render('class-form', {
    mode: 'create',
    classItem: {
      student_capacity: 40
    },
    error: null,
    formAction: '/classes',
    sidebarStats: await getSidebarStats(),
    user: req.session.user
  });
}

async function createClass(req, res) {
  const classItem = getClassFormData(req);
  const error = validateClass(classItem);

  if (error) {
    return res.render('class-form', {
      mode: 'create',
      classItem,
      error,
      formAction: '/classes',
      sidebarStats: await getSidebarStats(),
      user: req.session.user
    });
  }

  const exists = await classModel.existsByName(classItem.class_name);
  if (exists) {
    return res.render('class-form', {
      mode: 'create',
      classItem,
      error: '班级名称已存在',
      formAction: '/classes',
      sidebarStats: await getSidebarStats(),
      user: req.session.user
    });
  }

  await classModel.create(classItem);
  res.redirect('/classes');
}

async function showEditForm(req, res) {
  const classItem = await classModel.findById(req.params.id);

  if (!classItem) {
    return res.redirect('/classes');
  }

  res.render('class-form', {
    mode: 'edit',
    classItem,
    error: null,
    formAction: `/classes/${classItem.id}/update`,
    sidebarStats: await getSidebarStats(),
    user: req.session.user
  });
}

async function updateClass(req, res) {
  const classItem = getClassFormData(req);
  const error = validateClass(classItem);
  const id = req.params.id;
  const existing = await classModel.findById(id);

  if (!existing) {
    return res.redirect('/classes');
  }

  if (error) {
    classItem.id = id;
    return res.render('class-form', {
      mode: 'edit',
      classItem,
      error,
      formAction: `/classes/${id}/update`,
      sidebarStats: await getSidebarStats(),
      user: req.session.user
    });
  }

  const duplicate = await classModel.existsByNameExceptId(classItem.class_name, id);
  if (duplicate) {
    classItem.id = id;
    return res.render('class-form', {
      mode: 'edit',
      classItem,
      error: '班级名称已存在',
      formAction: `/classes/${id}/update`,
      sidebarStats: await getSidebarStats(),
      user: req.session.user
    });
  }

  await classModel.update(id, classItem);

  if (existing.class_name !== classItem.class_name) {
    await classModel.renameStudents(existing.class_name, classItem.class_name);
  }

  res.redirect('/classes');
}

async function deleteClass(req, res) {
  const classItem = await classModel.findById(req.params.id);

  if (!classItem) {
    return res.redirect('/classes');
  }

  const studentCount = await classModel.countStudentsByName(classItem.class_name);
  if (studentCount > 0) {
    return res.redirect('/classes?error=该班级下仍有关联学生，无法删除');
  }

  await classModel.remove(req.params.id);
  res.redirect('/classes');
}

module.exports = {
  listClasses,
  showNewForm,
  createClass,
  showEditForm,
  updateClass,
  deleteClass
};
