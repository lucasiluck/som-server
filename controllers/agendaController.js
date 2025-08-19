const Agenda = require('../models/Agenda');
const Funcionario = require('../models/Funcionario');

const criarAgendamento = async (req, res) => {
  try {
    const { funcionarioId, data_inicio, hora_inicio, hora_fim } = req.body;
    const agendamento = await Agenda.create({
      funcionarioId,
      data_inicio,
      hora_inicio,
      hora_fim
    });
    
    const agendamentoCompleto = await Agenda.findByPk(agendamento.id, {
      include: [Funcionario]
    });
    
    res.status(201).json(agendamentoCompleto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agendamento', details: error.message });
  }
};

const listarAgendamentos = async (req, res) => {
  try {
    const { funcionarioId, data } = req.query;
    const where = {};
    
    if (funcionarioId) where.funcionarioId = funcionarioId;
    if (data) where.data_inicio = data;
    
    const agendamentos = await Agenda.findAll({
      where,
      include: [Funcionario]
    });
    
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar agendamentos', details: error.message });
  }
};

const obterAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agenda.findByPk(id, {
      include: [Funcionario]
    });
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter agendamento' });
  }
};

const atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_agendamento, data_inicio, hora_inicio, hora_fim } = req.body;
    
    const agendamento = await Agenda.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    if (status_agendamento) agendamento.status_agendamento = status_agendamento;
    if (data_inicio) agendamento.data_inicio = data_inicio;
    if (hora_inicio) agendamento.hora_inicio = hora_inicio;
    if (hora_fim) agendamento.hora_fim = hora_fim;
    
    await agendamento.save();
    
    const agendamentoAtualizado = await Agenda.findByPk(id, {
      include: [Funcionario]
    });
    
    res.json(agendamentoAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento', details: error.message });
  }
};

const deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agenda.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    await agendamento.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
};

module.exports = {
  criarAgendamento,
  listarAgendamentos,
  obterAgendamento,
  atualizarAgendamento,
  deletarAgendamento
};