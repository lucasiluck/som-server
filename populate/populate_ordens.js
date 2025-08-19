const axios = require('axios');
const fs = require('fs');
const path = require('path');


const ADMIN_EMAIL = 'admin@empresa.com'; 
const ADMIN_PASSWORD = 'teste';  

const loginEndpoint = 'http://localhost:3000/api/auth/login';
const createOrderEndpoint = 'http://localhost:3000/api/ordens/criar';
const createAgendaEndpoint = 'http://localhost:3000/api/agenda'; 


const serviceDurations = {
    1: "01:00:00", 2: "01:30:00", 3: "00:45:00", 4: "02:00:00", 5: "01:15:00",
    6: "03:00:00", 7: "00:50:00", 8: "01:00:00", 9: "01:40:00", 10: "02:30:00",
    11: "02:00:00", 12: "04:00:00", 13: "00:30:00", 14: "01:10:00", 15: "01:00:00",
    16: "02:15:00", 17: "00:55:00", 18: "01:50:00", 19: "01:30:00", 20: "00:40:00"
};

function parseDurationToMinutes(durationStr) {
    if (!durationStr) return 0;
    const parts = durationStr.split(':').map(Number);
    return parts[0] * 60 + parts[1];
}

async function populateOrdersAndAgenda() {
    let token = null;

    console.log('Tentando fazer login como admin para popular ordens e agendas...');
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

    let ordersData;
    try {
        const data = fs.readFileSync(path.join(__dirname, 'ordens.json'), 'utf8');
        ordersData = JSON.parse(data);
        console.log(`Lendo ${ordersData.length} ordens do arquivo ordens.json...`);
    } catch (fileError) {
        console.error('Erro ao ler ou analisar o arquivo ordens.json:', fileError.message);
        return;
    }

    console.log(`Iniciando a criação de ${ordersData.length} ordens de serviço e seus agendamentos...`);
    for (const order of ordersData) {
        let createdOrder = null;
        try {
            // Criar Ordem de Serviço
            const orderResponse = await axios.post(createOrderEndpoint, order, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            createdOrder = orderResponse.data; 
            console.log(`Ordem de serviço para Cliente ID ${order.clienteId}, Serviço ID ${order.servicoId} criada com sucesso!`);

            if (createdOrder.funcionarioId) {
                const scheduledDateTime = new Date(createdOrder.data_hora);
                const serviceDurationMinutes = parseDurationToMinutes(serviceDurations[createdOrder.servicoId]);
                
                const agendaHoraInicio = scheduledDateTime.toTimeString().slice(0, 8); 

                const agendaEndTime = new Date(scheduledDateTime.getTime() + serviceDurationMinutes * 60000);
                const agendaHoraFim = agendaEndTime.toTimeString().slice(0, 8);

                const agendaData = {
                    funcionarioId: createdOrder.funcionarioId,
                    data_inicio: scheduledDateTime.toISOString().slice(0, 10), 
                    hora_inicio: agendaHoraInicio,
                    hora_fim: agendaHoraFim,
                    status_agendamento: 1 
                };

                try {
                    const agendaResponse = await axios.post(createAgendaEndpoint, agendaData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    console.log(`  Agendamento para Funcionário ID ${createdOrder.funcionarioId} em ${agendaData.data_inicio} (${agendaData.hora_inicio}-${agendaData.hora_fim}) criado com sucesso!`);
                } catch (agendaError) {
                    console.error(`  ERRO ao criar agendamento para Ordem ID ${createdOrder.id}, Funcionario ID ${createdOrder.funcionarioId}:`);
                    console.error('    Status:', agendaError.response ? agendaError.response.status : 'N/A');
                    console.error('    Dados do erro:', agendaError.response ? agendaError.response.data : agendaError.message);
                }
            }

        } catch (orderError) {
            console.error(`Erro ao criar ordem de serviço para Cliente ID ${order.clienteId} e Serviço ID ${order.servicoId}:`);
            if (orderError.response) {
                console.error('  Status:', orderError.response.status);
                console.error('  Dados do erro:', orderError.response.data);
            } else if (orderError.request) {
                console.error('  Nenhuma resposta recebida (verifique se o servidor está rodando):', orderError.request);
            } else {
                console.error('  Erro na requisição:', orderError.message);
            }
        }
    }

    console.log('População de ordens de serviço e agendas concluída.');
}

populateOrdersAndAgenda();