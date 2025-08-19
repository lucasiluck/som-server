const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Servico = require("./Servico");
const Cliente = require("./Cliente");
const Funcionario = require("./Funcionario");

const OrdemServico = sequelize.define("OrdemServico", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  data_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM(
      "Criada",
      "Aguardando Atendimento",
      "Em Andamento",
      "Finalizada",
      "Cancelada"
    ),
    allowNull: false,
    defaultValue: "Criada",
  },
  observacoes: {
    type: DataTypes.TEXT,
  },
  inicio_atendimento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fim_atendimento: {
    type: DataTypes.DATE,
    allowNull: true,
  }
});

OrdemServico.belongsTo(Servico, { foreignKey: "servicoId" });
OrdemServico.belongsTo(Cliente, { foreignKey: "clienteId" });
OrdemServico.belongsTo(Funcionario, { foreignKey: "funcionarioId" });

module.exports = OrdemServico;
