const permissions = require('./permissions');

exports.checkPermission = (permission) => (req, res, next) => {
  const userRole = req.user.role;
  if (!permissions[userRole] || !permissions[userRole].includes(permission)) {
    return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
  }
  next();
};
