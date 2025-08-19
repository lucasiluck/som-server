const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  criarTecnico,
  listarTecnicos,
  obterTecnico,
  atualizarTecnico,
  deletarTecnico
} = require('../controllers/tecnicoController');

router.post('/criar', auth, authorize('admin'), criarTecnico);
router.get('/', auth, listarTecnicos);
router.get('/:id', auth, obterTecnico);
router.put('/:id', auth, authorize('admin'), atualizarTecnico);
router.delete('/:id', auth, authorize('admin'), deletarTecnico);

module.exports = router;