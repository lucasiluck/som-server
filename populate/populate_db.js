const axios = require('axios'); 
const fs = require('fs');
const path = require('path');

const usersDataPath = path.join(__dirname, 'Json.txt'); 
const registerEndpoint = 'http://localhost:3000/api/auth/register';

async function populateDatabase() {
    try {
        const data = fs.readFileSync(usersDataPath, 'utf8');
        const users = JSON.parse(data); 

        console.log(`Iniciando a população do banco de dados com ${users.length} usuários...`);

        for (const user of users) {
            try {
                const userData = {
                    nome: user.nome,
                    cpf: user.cpf,
                    endereco: user.endereco,
                    email: user.email,
                    telefone: user.telefone,
                    senha: user.senha,
                    ...(user.tipo && { tipo: user.tipo }),
                    ...(user.especialidade && { especialidade: user.especialidade })
                };

                const response = await axios.post(registerEndpoint, userData);
                console.log(`Usuário ${user.email} registrado com sucesso! Status: ${response.status}`);
            } catch (error) {
                console.error(`Erro ao registrar o usuário ${user.email}:`);
                if (error.response) {
                    console.error('  Status:', error.response.status);
                    console.error('  Dados do erro:', error.response.data);
                } else if (error.request) {
                    console.error('  Nenhuma resposta recebida:', error.request);
                } else {
                    console.error('  Erro na requisição:', error.message);
                }
            }
        }

        console.log('População do banco de dados concluída.');

    } catch (fileError) {
        console.error('Erro ao ler ou analisar o arquivo JSON:', fileError);
    }
}

populateDatabase();