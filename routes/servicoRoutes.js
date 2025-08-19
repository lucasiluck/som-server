const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  criarServico,
  listarServicos,
  obterServico,
  atualizarServico,
  deletarServico
} = require('../controllers/servicoController');

router.post('/criar', auth, authorize('admin'), criarServico);
router.get('/', auth, listarServicos);
router.get('/:id', auth, obterServico);
router.put('/:id', auth, authorize('admin','operador'), atualizarServico);
router.delete('/:id', auth, authorize('admin'), deletarServico);

module.exports = router;