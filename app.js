require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db"); 

require('./models/Pessoa');
require('./models/Cliente');
require('./models/Funcionario');
require('./models/Servico');
require('./models/OrdemServico');
require('./models/Agenda');

const app = express();
bcrypt.genSaltSync(10); 

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("API do Sistema de Ordens de Serviço");
});

async function startApplication() {
  console.log('--- Iniciando Aplicação Principal ---');
  console.log('DB_HOST no app principal:', process.env.DB_HOST);
  console.log('DB_PORT no app principal:', process.env.DB_PORT);
  console.log('DB_USER no app principal:', process.env.DB_USER);
  console.log('DB_NAME no app principal:', process.env.DB_NAME);

  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');


    // await sequelize.sync({ alter: true }); 
    console.log('Modelos sincronizados com o banco de dados.'); 

    const { auth } = require("./middleware/auth"); 

    // Rotas
    const authRoutes = require("./routes/authRoutes");
    const clienteRoutes = require("./routes/clienteRoutes");
    const tecnicoRoutes = require("./routes/tecnicoRoutes");
    const servicoRoutes = require("./routes/servicoRoutes");
    const ordemRoutes = require("./routes/ordemRoutes");
    const agendaRoutes = require("./routes/agendaRoutes");

    app.use("/api/auth", authRoutes);

    // Rotas protegidas (após a conexão com DB ser verificada)
    app.use("/api/clientes", auth, clienteRoutes);
    app.use("/api/tecnicos", auth, tecnicoRoutes);
    app.use("/api/servicos", auth, servicoRoutes);
    app.use("/api/ordens", auth, ordemRoutes);
    app.use("/api/agenda", auth, agendaRoutes);

    // Iniciar o servidor Express
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (err) {
    console.error("Erro FATAL na inicialização do banco de dados ou da aplicação:", err);
  }
}

startApplication();

// Middleware de erro 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});