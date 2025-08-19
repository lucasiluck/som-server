const OrdemServico = require('../models/OrdemServico');
const Servico = require('../models/Servico');
const Cliente = require('../models/Cliente');
const Funcionario = require('../models/Funcionario');
const Pessoa = require('../models/Pessoa');
const { Op } = require('sequelize');

// Função auxiliar para calcular o fim do atendimento
const calcularFimAtendimento = (dataHoraInicio, duracaoServico) => {
  const [horasStr, minutosStr] = duracaoServico.split(':').map(Number);
  const dataFim = new Date(dataHoraInicio);
  dataFim.setHours(dataFim.getHours() + horasStr);
  dataFim.setMinutes(dataFim.getMinutes() + minutosStr);
  return dataFim;
};

// Função para verificar sobreposição de agendamento
const verificarConflitoAgendamento = async (funcionarioId, dataHoraInicioNova, duracaoServicoNova, osId = null) => {
  console.log('\n--- VERIFICANDO CONFLITO DE AGENDAMENTO ---');
  console.log(`Nova OS - Funcionario ID: ${funcionarioId}, Início: ${dataHoraInicioNova.toISOString()}, Duração: ${duracaoServicoNova}`);

  const dataFimNova = calcularFimAtendimento(dataHoraInicioNova, duracaoServicoNova);
  console.log(`Nova OS - Fim Calculado: ${dataFimNova.toISOString()}`);

  const queryOptions = {
    where: {
      funcionarioId: funcionarioId,
      status: {
        [Op.in]: ["Criada", "Aguardando Atendimento", "Em Andamento"]
      }
    },
    include: [{ model: Servico }]
  };

  if (osId) {
    queryOptions.where.id = { [Op.ne]: osId };
    console.log(`Excluindo OS ID ${osId} da verificação (modo edição).`);
  }

  const conflitosPotenciais = await OrdemServico.findAll(queryOptions);

  if (conflitosPotenciais.length === 0) {
    console.log('Nenhuma OS existente para o técnico neste status para verificar.');
  }

  for (const ordemExistente of conflitosPotenciais) {
    console.log(`\nVerificando contra OS existente ID: ${ordemExistente.id}`);
    console.log(`  Status da OS existente: ${ordemExistente.status}`);
    console.log(`  Início da OS existente (data_hora): ${new Date(ordemExistente.data_hora).toISOString()}`);

    if (!ordemExistente.Servico || !ordemExistente.Servico.media_duracao) {
      console.warn(`AVISO: Ordem de Serviço ${ordemExistente.id} sem informações de duração do serviço. Pulando.`);
      continue;
    }

    const dataHoraInicioExistente = new Date(ordemExistente.data_hora);
    const duracaoServicoExistente = ordemExistente.Servico.media_duracao;
    const dataFimExistente = calcularFimAtendimento(dataHoraInicioExistente, duracaoServicoExistente);

    console.log(`  Duração do Serviço Existente: ${duracaoServicoExistente}`);
    console.log(`  Fim Calculado da OS Existente: ${dataFimExistente.toISOString()}`);

    const sobreposicao =
      dataHoraInicioNova < dataFimExistente &&
      dataHoraInicioExistente < dataFimNova;

    console.log(`  Comparando: `);
    console.log(`    Nova Início (${dataHoraInicioNova.toISOString()}) < Existente Fim (${dataFimExistente.toISOString()}) = ${dataHoraInicioNova < dataFimExistente}`);
    console.log(`    Existente Início (${dataHoraInicioExistente.toISOString()}) < Nova Fim (${dataFimNova.toISOString()}) = ${dataHoraInicioExistente < dataFimNova}`);
    console.log(`  Resultado da Sobreposição: ${sobreposicao}`);

    if (sobreposicao) {
      return true;
    }
  }
  return false;
};

// --- FUNÇÃO DE CRIAR ORDEM  ---
const criarOrdem = async (req, res) => {
  try {
    const { servicoId, clienteId, funcionarioId, data_hora, observacoes } = req.body;

    // Verificar se os dados essenciais estão presentes
    if (!servicoId || !data_hora) {
      return res.status(400).json({ error: 'Serviço e data/hora são obrigatórios.' });
    }

    // Buscar a duração do serviço
    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    if (funcionarioId) {
      // Passar a data_hora como objeto Date
      const conflito = await verificarConflitoAgendamento(funcionarioId, new Date(data_hora), servico.media_duracao);
      if (conflito) {
        return res.status(400).json({ error: 'O técnico já possui um agendamento neste horário.' });
      }
    }

    const statusOS = funcionarioId ? "Aguardando Atendimento" : "Criada";

    const ordem = await OrdemServico.create({
      servicoId,
      clienteId,
      funcionarioId,
      data_hora,
      observacoes,
      status: statusOS
    });

    const ordemCompleta = await OrdemServico.findByPk(ordem.id, {
      include: [
        { model: Servico },
        { model: Cliente, include: [{ model: Pessoa }] },
        { model: Funcionario, include: [{ model: Pessoa }] }
      ]
    });

    res.status(201).json(ordemCompleta);
  } catch (error) {
    console.error("Erro ao criar ordem de serviço:", error);
    res.status(500).json({ error: 'Erro ao criar ordem de serviço', details: error.message });
  }
};

// --- FUNÇÃO DE LISTAR ORDENS---
const listarOrdens = async (req, res) => {
    try {
        const usuarioLogado = req.user;

        if (!usuarioLogado || !usuarioLogado.tipo) {
            return res.status(401).json({ error: "Não autorizado. As informações do usuário estão incompletas." });
        }
        const queryOptions = {
            include: [
                { model: Servico },
                {
                    model: Cliente,
                    include: [{ model: Pessoa, attributes: ['endereco', 'nome'] }]
                },
                {
                    model: Funcionario,
                    include: [{ model: Pessoa, attributes: ['nome'] }]
                }
            ]
        };
        if (usuarioLogado.tipo === 'tecnico') {
            queryOptions.where = {
                funcionarioId: usuarioLogado.id
            };
        } else {
            const { funcionarioId } = req.query;
            if (funcionarioId) {
                queryOptions.where = {
                    funcionarioId: funcionarioId
                };
            }
        }

        const ordens = await OrdemServico.findAll(queryOptions);

        res.status(200).json(ordens);

    } catch (error) {
        console.error("Erro ao listar ordens de serviço:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
};


// --- FUNÇÃO DE OBTER UMA ORDEM ---
const obterOrdem = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogado = req.user;

        if (!usuarioLogado || !usuarioLogado.tipo) {
            return res.status(401).json({ error: "Não autorizado. As informações do usuário estão incompletas." });
        }

        const ordem = await OrdemServico.findByPk(id, {
            include: [
                { model: Servico },
                { model: Cliente, include: [{ model: Pessoa }] },
                { model: Funcionario, include: [{ model: Pessoa }] }
            ]
        });

        if (!ordem) {
            return res.status(404).json({ error: "Ordem de Serviço não encontrada." });
        }

        // Lógica de permissão
        if (usuarioLogado.tipo === 'tecnico') {
            if (ordem.funcionarioId !== usuarioLogado.id) {
                return res.status(403).json({ error: "Acesso negado. Você não tem permissão para ver esta OS." });
            }
        }

        res.status(200).json(ordem);

    } catch (error) {
        console.error("Erro ao obter ordem de serviço:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
};

const atualizarOrdem = async (req, res) => {
    try {
        const { id } = req.params;
        const { clienteId, servicoId, funcionarioId, data_hora, status, observacoes } = req.body;

        const ordem = await OrdemServico.findByPk(id, {
          include: [{ model: Servico }]
        });
        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }

        const statusAnterior = ordem.status;

        let servicoParaConflito = ordem.Servico;
        if (servicoId && servicoId !== ordem.servicoId) {
          servicoParaConflito = await Servico.findByPk(servicoId);
          if (!servicoParaConflito) {
            return res.status(404).json({ error: 'Serviço não encontrado.' });
          }
        }

        if (
            funcionarioId !== undefined && funcionarioId !== null && servicoParaConflito &&
            (
                (funcionarioId !== ordem.funcionarioId) ||
                (data_hora && new Date(data_hora).getTime() !== new Date(ordem.data_hora).getTime()) ||
                (servicoId && servicoId !== ordem.servicoId)
            )
        ) {
            const novoFuncionarioId = funcionarioId;
            const novaDataHora = data_hora ? new Date(data_hora) : new Date(ordem.data_hora);
            const novaDuracao = servicoParaConflito.media_duracao;

            const conflito = await verificarConflitoAgendamento(novoFuncionarioId, novaDataHora, novaDuracao, id);
            if (conflito) {
                return res.status(400).json({ error: 'O técnico já possui um agendamento neste horário.' });
            }
        }


        if (clienteId) ordem.clienteId = clienteId;
        if (servicoId) ordem.servicoId = servicoId;
        if (funcionarioId !== undefined) ordem.funcionarioId = funcionarioId;
        if (data_hora) ordem.data_hora = data_hora;
        if (status) ordem.status = status;
        if (observacoes) ordem.observacoes = observacoes;

        if (status === 'Em Andamento' && statusAnterior !== 'Em Andamento' && !ordem.inicio_atendimento) {
            ordem.inicio_atendimento = new Date();
        }

        if (status === 'Finalizada' && statusAnterior !== 'Finalizada' && !ordem.fim_atendimento) {
            ordem.fim_atendimento = new Date();
        }

        await ordem.save();

        const ordemAtualizada = await OrdemServico.findByPk(id, {
            include: [
                { model: Servico },
                { model: Cliente, include: [{ model: Pessoa }] },
                { model: Funcionario, include: [{ model: Pessoa }] }
            ]
        });

        res.json(ordemAtualizada);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar ordem de serviço', details: error.message });
    }
};

const atualizarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ordem = await OrdemServico.findByPk(id);
        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }

        ordem.status = status;
        await ordem.save();

        const ordemAtualizada = await OrdemServico.findByPk(id, {
            include: [
                { model: Servico },
                { model: Cliente, include: [{ model: Pessoa }] },
                { model: Funcionario, include: [{ model: Pessoa }] }
            ]
        });
        res.json(ordemAtualizada);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar status da ordem', details: error.message });
    }
};

const deletarOrdem = async (req, res) => {
    try {
        const { id } = req.params;
        const ordem = await OrdemServico.findByPk(id);

        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }

        await ordem.destroy();
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar ordem de serviço:", error);
        res.status(500).json({ error: 'Erro ao deletar ordem de serviço' });
    }
};

module.exports = {
    criarOrdem,
    listarOrdens,
    obterOrdem,
    atualizarOrdem,
    atualizarStatus,
    deletarOrdem
};