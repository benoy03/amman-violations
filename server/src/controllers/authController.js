const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

/**
 * تسجيل الدخول
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * جلب بيانات المستخدم الحالي
 */
function getProfile(req, res, next) {
  try {
    const user = db.prepare('SELECT id, username, full_name, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * تغيير كلمة المرور للمستخدم الحالي
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال كلمة المرور الحالية والجديدة'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ==============================================================================
 * 👥 وظائف إدارة المستخدمين وصلاحيات المرور (للمدير فقط)
 * ==============================================================================
 */

/**
 * جلب جميع المستخدمين
 */
function getAllUsers(req, res, next) {
  try {
    const users = db.prepare(`
      SELECT id, username, full_name, role, is_active, created_at
      FROM users
      ORDER BY role ASC, id ASC
    `).all();

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
}

/**
 * إنشاء مستخدم جديد مع كلمة مرور مخصصة
 */
async function createUser(req, res, next) {
  try {
    const { username, password, full_name, role = 'user' } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور والاسم الكامل'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanFullName = full_name.trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب أن لا تقل عن 6 خانات'
      });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم آخر'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const validRole = role === 'admin' ? 'admin' : 'user';

    const info = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(cleanUsername, password_hash, cleanFullName, validRole);

    const newUser = db.prepare('SELECT id, username, full_name, role, is_active, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);

    logAction({
      req,
      action: 'إنشاء مستخدم جديد',
      entity: 'users',
      entityId: cleanUsername,
      details: `إنشاء حساب: ${cleanUsername} (${cleanFullName}) بصلاحية: ${validRole}`
    });

    res.status(201).json({
      success: true,
      message: `تم إنشاء حساب المستخدم [${cleanUsername}] بنجاح`,
      data: newUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * إعادة تعيين / تغيير كلمة مرور أي مستخدم (من قِبل المدير)
 */
async function adminResetPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن لا تقل عن 6 خانات'
      });
    }

    const user = db.prepare('SELECT id, username, full_name FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, id);

    logAction({
      req,
      action: 'إعادة تعيين كلمة مرور',
      entity: 'users',
      entityId: user.username,
      details: `تم تعيين كلمة مرور جديدة للمستخدم [${user.username} - ${user.full_name}]`
    });

    res.json({
      success: true,
      message: `تم تحديث كلمة المرور للمستخدم [${user.username}] بنجاح`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * تعديل بيانات وصلاحية المستخدم
 */
function adminUpdateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { full_name, role, is_active } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const validRole = role ? (role === 'admin' ? 'admin' : 'user') : user.role;
    const cleanFullName = full_name ? full_name.trim() : user.full_name;
    const activeStatus = is_active !== undefined ? (is_active ? 1 : 0) : user.is_active;

    db.prepare(`
      UPDATE users SET full_name = ?, role = ?, is_active = ?
      WHERE id = ?
    `).run(cleanFullName, validRole, activeStatus, id);

    logAction({
      req,
      action: 'تعديل بيانات مستخدم',
      entity: 'users',
      entityId: user.username,
      details: `تعديل المستخدم [${user.username}]: صلاحية (${validRole})، نشط (${activeStatus})`
    });

    res.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * حذف مستخدم
 */
function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (parseInt(id) === parseInt(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول منه'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    logAction({
      req,
      action: 'حذف مستخدم',
      entity: 'users',
      entityId: user.username,
      details: `تم حذف حساب المستخدم [${user.username} - ${user.full_name}]`
    });

    res.json({
      success: true,
      message: `تم حذف حساب المستخدم [${user.username}] بنجاح`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getProfile,
  changePassword,
  getAllUsers,
  createUser,
  adminResetPassword,
  adminUpdateUser,
  deleteUser
};
