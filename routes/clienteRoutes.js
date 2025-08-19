const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  criarCliente,
  listarClientes,
  obterCliente,
  atualizarCliente,
  deletarCliente
} = require('../controllers/clienteController');

// Rotas protegidas por autenticação
router.post('/', auth, authorize('admin'), criarCliente);
router.get('/', auth,authorize('admin','operador'), listarClientes);
router.get('/:id', auth, obterCliente);
router.put('/:id', auth, authorize('admin','operador'), atualizarCliente);
router.delete('/:id', auth, authorize('admin'), deletarCliente);

module.exports = router;