const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Funcionario = require('./Funcionario');

const Agenda = sequelize.define('Agenda', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status_agendamento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  data_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: false
  }
});

Agenda.belongsTo(Funcionario, { foreignKey: 'funcionarioId' });

module.exports = Agenda;