const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Servico = sequelize.define('Servico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('manutencao', 'instalacao'),
    allowNull: false
  },
  media_duracao: {
    type: DataTypes.TIME,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = Servico;