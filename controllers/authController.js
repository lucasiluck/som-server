const jwt = require("jsonwebtoken");
const Pessoa = require("../models/Pessoa");
const Cliente = require("../models/Cliente");
const Funcionario = require("../models/Funcionario");
const { Op } = require("sequelize");

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log("--- Início da tentativa de login ---");
    console.log("Tentativa de login para o email:", email);

    const pessoa = await Pessoa.findOne({ where: { email } });
    console.log("Pessoa encontrada:", pessoa ? pessoa.email : "NÃO ENCONTRADA");

    if (!pessoa || !(await pessoa.verificarSenha(senha))) {
      console.log("Credenciais inválidas para o email:", email);
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    console.log("Senha verificada com sucesso para:", pessoa.email);

    let perfil = await Funcionario.findOne({ where: { pessoaId: pessoa.id } });
    let tipoPerfil;
    console.log(
      "Perfil de Funcionário:",
      perfil ? perfil.tipo : "NÃO ENCONTRADO"
    );

    if (perfil) {
      tipoPerfil = perfil.tipo;
    } else {
      perfil = await Cliente.findOne({ where: { pessoaId: pessoa.id } });
      if (perfil) {
        tipoPerfil = "cliente";
      }
    }
    console.log("Tipo de perfil determinado:", tipoPerfil);
    console.log(
      "Perfil final encontrado (ID):",
      perfil ? perfil.id : "NÃO ENCONTRADO"
    );

    if (!perfil) {
      console.log("Perfil não encontrado para a pessoa:", pessoa.id);
      return res.status(401).json({ error: "Perfil não encontrado" });
    }

    if (tipoPerfil === "cliente") {
      console.log("Tentativa de login de um cliente detectada. Acesso negado.");
      return res
        .status(403)
        .json({
          error:
            "Acesso negado. Usuários do tipo cliente não podem logar neste sistema.",
        });
    }

    const payload = {
      id: perfil.id,
      tipo: tipoPerfil,
    };
    console.log("Payload do JWT:", payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    console.log("Token gerado com sucesso.");

    res.json({
      message: "Login bem-sucedido!",
      token,
      perfil: {
        id: perfil.id,
        nome: pessoa.nome,
        email: pessoa.email,
        tipo: tipoPerfil,
      },
    });
    console.log("--- Fim da tentativa de login (SUCESSO) ---");
  } catch (error) {
    console.error("Erro no servidor durante o login (CATCH):", error);
    res.status(500).json({ error: "Erro no servidor", details: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { nome, cpf, endereco, email, telefone, senha, tipo, especialidade } =
      req.body;

    const pessoaExistente = await Pessoa.findOne({
      where: {
        [Op.or]: [{ email }, { cpf }],
      },
    });

    if (pessoaExistente) {
      return res.status(400).json({ error: "Email ou CPF já cadastrado" });
    }

    const pessoa = await Pessoa.create({
      nome,
      cpf,
      endereco,
      email,
      telefone,
      senha,
    });

    const isFuncionario = ["admin", "tecnico", "operador"].includes(tipo);
    let perfil;
    let tipoPerfil = tipo;

    if (isFuncionario) {
      perfil = await Funcionario.create({
        pessoaId: pessoa.id,
        tipo: tipo,
        especialidade: especialidade,
      });
    } else {
      perfil = await Cliente.create({ pessoaId: pessoa.id });
      tipoPerfil = "cliente";
    }

    const payload = {
      id: perfil.id,
      tipo: tipoPerfil,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.status(201).json({
      pessoa,
      perfil,
      tipo: tipoPerfil,
      token,
    });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    res
      .status(500)
      .json({ error: "Erro ao registrar", details: error.message });
  }
};

module.exports = { login, register };
