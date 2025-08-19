const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  criarAgendamento,
  listarAgendamentos,
  obterAgendamento,
  atualizarAgendamento,
  deletarAgendamento
} = require('../controllers/agendaController');

router.post('/', auth, authorize('admin', 'operador'), criarAgendamento);
router.get('/', auth, listarAgendamentos);
router.get('/:id', auth, obterAgendamento);
router.put('/:id', auth, authorize('admin', 'operador'), atualizarAgendamento);
router.delete('/:id', auth, authorize('admin', 'operador'), deletarAgendamento);

module.exports = router;