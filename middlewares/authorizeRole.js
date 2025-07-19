module.exports = function authorizeRole(...rolesPermitidos) {
    return (req, res, next) => {
      const { role } = req.user; // req.user vem do middleware de autenticação (JWT)
      if (!rolesPermitidos.includes(role)) {
        return res.status(403).json({ erro: 'Acesso negado para este perfil' });
      }
      next();
    };
  };
  const authorizeRole = require('../middlewares/authorizeRole');

  router.get('/admin/dashboard', authorizeRole('admin'), controller.dashboardAdmin);
    