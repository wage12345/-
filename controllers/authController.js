const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

function showLogin(req, res) {
  res.render('login', { error: null });
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('login', { error: '请输入用户名和密码' });
    }

    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.render('login', { error: '用户名或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: '用户名或密码错误' });
    }

    req.session.user = {
      id: user.id,
      username: user.username
    };

    res.redirect('/students');
  } catch (error) {
    res.render('login', { error: '登录失败，请稍后重试' });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

module.exports = {
  showLogin,
  login,
  logout
};