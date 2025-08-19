const Servico = require('../models/Servico');

const criarServico = async (req, res) => {
  try {
    const { tipo, media_duracao, descricao } = req.body;
    const servico = await Servico.create({ tipo, media_duracao, descricao });
    res.status(201).json(servico);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao criar serviço',
      details: error.message 
    });
    
  }
};

const listarServicos = async (req, res) => {
  try {
    const servicos = await Servico.findAll();
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar serviços' });
  }
};

const obterServico = async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id);
    
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    res.json(servico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter serviço' });
  }
};

const atualizarServico = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, media_duracao, descricao } = req.body;
    
    const servico = await Servico.findByPk(id);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    servico.tipo = tipo;
    servico.media_duracao = media_duracao;
    servico.descricao = descricao;
    await servico.save();
    
    res.json(servico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
};

const deletarServico = async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id);
    
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    await servico.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar serviço' });
  }
};

module.exports = {
  criarServico,
  listarServicos,
  obterServico,
  atualizarServico,
  deletarServico
};