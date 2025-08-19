const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Pessoa = require("./Pessoa");

const Cliente = sequelize.define(
  "Cliente",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    timestamps: true,
  }
);

Cliente.belongsTo(Pessoa, { foreignKey: "pessoaId", onDelete: "CASCADE" });

Cliente.criarCompleto = async (pessoa) => {
  try {
    console.log('Criando cliente para pessoaId:', pessoa.id); 
    const cliente = await Cliente.create({ pessoaId: pessoa.id });
    console.log('Cliente criado com ID:', cliente.id);
    return cliente;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

module.exports = Cliente;
