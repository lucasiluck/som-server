require('dotenv').config();
const { Sequelize } = require('sequelize');

async function testConnection() {
  console.log('--- Testando Conexão com o Banco de Dados ---');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);

  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      port: parseInt(process.env.DB_PORT, 10), 
      logging: console.log, 
      dialectOptions: {
        connectTimeout: 90000
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso!');
    const [results, metadata] = await sequelize.query("SELECT 1+1 AS solution");
    console.log('Query de teste bem-sucedida:', results);

  } catch (error) {
    console.error('Falha ao conectar ou autenticar no banco de dados:', error);
    if (error.parent) {
      console.error('Erro original/pai:', error.parent);
    }
    if (error.original) {
      console.error('Erro original:', error.original);
    }
  } finally {
    await sequelize.close();
    console.log('Conexão fechada.');
  }
}

testConnection();