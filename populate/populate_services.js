const axios = require('axios'); 
const fs = require('fs');
const path = require('path');


const ADMIN_EMAIL = 'admin@empresa.com'; 
const ADMIN_PASSWORD = 'teste';         

const loginEndpoint = 'http://localhost:3000/api/auth/login';
const createServiceEndpoint = 'http://localhost:3000/api/servicos/criar'; 

const servicesData = [ 
  {
    "tipo": "manutencao",
    "media_duracao": "01:00:00",
    "descricao": "Diagnóstico e reparo de falha na conexão de internet residencial."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "01:30:00",
    "descricao": "Instalação de roteador Wi-Fi e configuração de rede doméstica."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "00:45:00",
    "descricao": "Otimização de sinal Wi-Fi e eliminação de pontos cegos."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "02:00:00",
    "descricao": "Instalação de linha telefônica fixa e configuração de aparelho."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "01:15:00",
    "descricao": "Reparo de cabo de rede rompido (RJ45)."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "03:00:00",
    "descricao": "Instalação de rede cabeada para escritórios (Pontos de rede)."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "00:50:00",
    "descricao": "Atualização de firmware de roteadores e modems."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "01:00:00",
    "descricao": "Configuração de repetidor de sinal Wi-Fi."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "01:40:00",
    "descricao": "Solução de problemas de VoIP (Voz sobre IP)."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "02:30:00",
    "descricao": "Instalação e configuração de PABX virtual/nuvem."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "02:00:00",
    "descricao": "Manutenção preventiva em infraestrutura de rede (limpeza, organização de cabos)."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "04:00:00",
    "descricao": "Implantação de sistema de telefonia IP para empresas."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "00:30:00",
    "descricao": "Verificação e substituição de conectores de fibra óptica."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "01:10:00",
    "descricao": "Instalação de câmeras IP integradas à rede."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "01:00:00",
    "descricao": "Desbloqueio e configuração de aparelhos celulares para uso de dados."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "02:15:00",
    "descricao": "Instalação de rack de telecomunicações e organização de patch panel."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "00:55:00",
    "descricao": "Diagnóstico de lentidão na internet e otimização de banda."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "01:50:00",
    "descricao": "Configuração de VPN (Rede Virtual Privada) para acesso remoto."
  },
  {
    "tipo": "manutencao",
    "media_duracao": "01:30:00",
    "descricao": "Reparo e troca de componentes em equipamentos de rede (switches, hubs)."
  },
  {
    "tipo": "instalacao",
    "media_duracao": "00:40:00",
    "descricao": "Instalação de software de gerenciamento de rede."
  }
];

async function populateServices() {
    let token = null;

    console.log('Tentando fazer login como admin...');
    try {
        const loginResponse = await axios.post(loginEndpoint, {
            email: ADMIN_EMAIL,
            senha: ADMIN_PASSWORD
        });
        token = loginResponse.data.token;
        console.log('Login admin bem-sucedido. Token obtido.');
    } catch (error) {
        console.error('Falha no login admin:', error.response ? error.response.data : error.message);
        console.error('Certifique-se de que o usuário admin existe e as credenciais estão corretas.');
        return; 
    }

    console.log(`Iniciando a criação de ${servicesData.length} serviços...`);
    for (const service of servicesData) {
        try {
            const response = await axios.post(createServiceEndpoint, service, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(`Serviço "${service.descricao.substring(0, 30)}..." criado com sucesso! Status: ${response.status}`);
        } catch (error) {
            console.error(`Erro ao criar o serviço "${service.descricao.substring(0, 30)}...":`);
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

    console.log('População de serviços concluída.');
}

populateServices();