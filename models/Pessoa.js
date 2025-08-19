const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");

const Pessoa = sequelize.define("Pessoa", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  cpf: {
    type: DataTypes.CHAR(11),
    allowNull: false,
    unique: true,
  },
  endereco: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  telefone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Pessoa.beforeSave(async (pessoa) => {
  if (pessoa.changed("senha")) {
    pessoa.senha = await bcrypt.hash(pessoa.senha, 8);
  }
});

Pessoa.prototype.verificarSenha = async function (senha) {
  return await bcrypt.compare(senha, this.senha);
};

module.exports = Pessoa;
