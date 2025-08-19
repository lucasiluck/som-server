const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Pessoa = require('./Pessoa');

const Funcionario = sequelize.define('Funcionario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('admin', 'tecnico', 'operador'),
    allowNull: false,
    defaultValue: 'operador'
  },
  especialidade: {
    type: DataTypes.STRING(100),
    allowNull: true 
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

Funcionario.belongsTo(Pessoa, { foreignKey: 'pessoaId', onDelete: 'CASCADE' });

Funcionario.criarCompleto = async (pessoa, tipo = 'operador', especialidade = null) => {
  return await Funcionario.create({ 
    pessoaId: pessoa.id, 
    tipo,
    especialidade: tipo === 'tecnico' ? especialidade : null
  });
};


module.exports = Funcionario;