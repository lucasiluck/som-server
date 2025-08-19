const Funcionario = require('../models/Funcionario');
const Pessoa = require('../models/Pessoa');

const criarTecnico = async (req, res) => {
  try {
    if (req.body.tipo === 'admin' && req.funcionario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem criar outros admins' });
    }
    const { tipo, especialidade, ...dadosPessoa } = req.body;
    const tecnico = await Funcionario.criarCompleto(
      dadosPessoa, 
      tipo || 'tecnico', 
      especialidade
    );
    
    res.status(201).json(tecnico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar técnico' });
  }
};

const listarTecnicos = async (req, res) => {
  try {
    const tecnicos = await Funcionario.findAll({
      where: { ativo: true },
      include: [Pessoa]
    });
    res.json(tecnicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar técnicos' });
  }
};

const obterTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const tecnico = await Funcionario.findByPk(id, {
      include: [Pessoa]
    });
    
    if (!tecnico) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    res.json(tecnico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter técnico' });
  }
};

const atualizarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const { especialidade, ativo, ...dadosPessoa } = req.body;
    
    const tecnico = await Funcionario.findByPk(id, {
      include: [Pessoa]
    });
    
    if (!tecnico) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    if (especialidade) tecnico.especialidade = especialidade;
    if (ativo !== undefined) tecnico.ativo = ativo;
    await tecnico.save();
    
    await tecnico.Pessoa.atualizar(dadosPessoa);
    
    const tecnicoAtualizado = await Funcionario.findByPk(id, {
      include: [Pessoa]
    });
    
    res.json(tecnicoAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar técnico', details: error.message });
  }
};

const deletarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const tecnico = await Funcionario.findByPk(id);
    
    if (!tecnico) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    tecnico.ativo = false;
    await tecnico.save();
    
    res.json({ message: 'Técnico desativado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar técnico', details: error.message });
  }
};

module.exports = {
  criarTecnico,
  listarTecnicos,
  obterTecnico,
  atualizarTecnico,
  deletarTecnico
};