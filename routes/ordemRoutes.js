const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  criarOrdem,
  listarOrdens,
  obterOrdem,
  atualizarStatus,
  deletarOrdem,
  atualizarOrdem
} = require('../controllers/ordemController');

router.post('/criar', auth, authorize('admin', 'operador'), criarOrdem);
router.get('/', auth, listarOrdens);
router.get('/:id', auth, obterOrdem);
router.put('/:id', auth, authorize('admin', 'operador','tecnico'), atualizarOrdem); 
router.patch('/:id/status', auth, authorize('admin', 'tecnico', 'operador'), atualizarStatus);
router.delete('/:id', auth, authorize('admin', 'operador'), deletarOrdem);

module.exports = router;