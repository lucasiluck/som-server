const Cliente = require('../models/Cliente');
const Pessoa = require('../models/Pessoa');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

const criarCliente = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { ...dadosPessoa } = req.body;
    
    // Verificação de duplicidade
    const pessoaExistente = await Pessoa.findOne({
      where: {
        [Op.or]: [
          { cpf: dadosPessoa.cpf },
          { email: dadosPessoa.email }
        ]
      }
    });

    if (pessoaExistente) {
      return res.status(400).json({ 
        error: 'Já existe um cliente com este CPF ou e-mail' 
      });
    }

    // Cria a Pessoa primeiro
    const pessoa = await Pessoa.create(dadosPessoa, { transaction: t });
    
    // Cria o Cliente, ligando ao ID da pessoa
    const cliente = await Cliente.create({ pessoaId: pessoa.id }, { transaction: t });

    await t.commit();
    
    // Busca o cliente completo para retornar na resposta
    const clienteCompleto = await Cliente.findByPk(cliente.id, {
      include: [Pessoa],
      attributes: { exclude: ['pessoaId'] }
    });
    
    res.status(201).json(clienteCompleto);

  } catch (error) {
    await t.rollback();
    res.status(500).json({ 
      error: 'Erro ao criar cliente',
      details: error.message 
    });
  }
};

const listarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [Pessoa],
      attributes: { exclude: ['pessoaId'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao listar clientes',
      details: error.message 
    });
  }
};

const obterCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id, {
      include: [Pessoa],
      attributes: { exclude: ['pessoaId'] }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao obter cliente',
      details: error.message 
    });
  }
};

const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { ...dadosPessoa } = req.body;
    
    const cliente = await Cliente.findByPk(id, {
      include: [Pessoa]
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    await cliente.Pessoa.update(dadosPessoa);

    const clienteAtualizado = await cliente.reload();
    
    res.json(clienteAtualizado);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao atualizar cliente',
      details: error.message 
    });
  }
};

const deletarCliente = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id, { transaction: t });
        
        if (!cliente) {
            await t.rollback();
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        const pessoa = await Pessoa.findByPk(cliente.pessoaId, { transaction: t });

        if (pessoa) {
          await pessoa.destroy({ transaction: t });
        } else {
          await cliente.destroy({ transaction: t });
        }
        
        await t.commit();
        res.status(204).send();

    } catch (error) {
        await t.rollback();
        res.status(500).json({ 
            error: 'Erro ao deletar cliente',
            details: error.message 
        });
    }
};


module.exports = {
  criarCliente,
  listarClientes,
  obterCliente,
  atualizarCliente,
  deletarCliente
};