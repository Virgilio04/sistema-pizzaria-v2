import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { 
  PlusCircle, Pizza, Wallet, User, Save, Trash2, FileText, 
  DollarSign, CreditCard, Calendar, Users, History, CheckCircle, Lock, 
  LogOut, Shield, UserCheck, Scale, Monitor, Edit2, ChefHat, 
  Utensils, UserPlus, X, AlertTriangle, ListChecks, 
  Percent, Award, CalendarX, AlertOctagon, ArrowRightLeft, 
  Filter, FileSpreadsheet, Copy, Briefcase, Baby, Bike
} from 'lucide-react';

export default function App() {
  // --- Estados de Autenticação ---
  const [usuarioAtual, setUsuarioAtual] = useState(null); 
  const [inputPin, setInputPin] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  // ESTADOS PARA O LOGIN SEGURO DO CAIXA
  const [tokenDoDia, setTokenDoDia] = useState(''); // Token que o gerente vê
  const [inputTokenCaixa, setInputTokenCaixa] = useState(''); // O que o caixa digita
  const [pedirTokenCaixa, setPedirTokenCaixa] = useState(false); // Controla se mostra o input pro caixa

  // --- Estados Globais do App ---
  const [activeTab, setActiveTab] = useState('auditoria'); 
  const [dataMovimento, setDataMovimento] = useState(new Date().toISOString().split('T')[0]);
  
  // Saldos Iniciais (Com Memória)
  const [saldoAnterior, setSaldoAnterior] = useState(localStorage.getItem('pizzaria_troco') || ''); 
  const [reforcoCaixa, setReforcoCaixa] = useState(localStorage.getItem('pizzaria_reforco') || ''); 

  // Efeito Mágico: Salva o troco automaticamente sempre que você digita
  useEffect(() => { localStorage.setItem('pizzaria_troco', saldoAnterior); }, [saldoAnterior]);
  useEffect(() => { localStorage.setItem('pizzaria_reforco', reforcoCaixa); }, [reforcoCaixa]);

  // --- CONFIGURAÇÕES DINÂMICAS ---
  const [configCategorias, setConfigCategorias] = useState({
    entrada: [
      { id: 'venda_dinheiro', label: 'Venda (Dinheiro)', padrao: true },
      { id: 'venda_cartao', label: 'Venda (Cartão)', padrao: true },
      { id: 'venda_tuna', label: 'Venda (Tuna/App)', padrao: true },
      { id: 'venda_ifood', label: 'Venda (iFood)', padrao: true }, 
    ],
    saida: [
      { id: 'fornecedor', label: 'Pagamento Fornecedor', padrao: true },
      { id: 'diaria_motoboy', label: 'Diária Motoboy', padrao: true },
      { id: 'diaria_staff', label: 'Diária Cozinha/Salão', padrao: true },
      { id: 'vale_dinheiro', label: 'Vale Funcionário', padrao: true },
      { id: 'combustivel', label: 'Combustível/Gás', padrao: true },
      { id: 'despesa_geral', label: 'Despesas Gerais', padrao: true },
    ],
    neutro: [ 
      { id: 'vale_produto', label: 'Vale Produto (Consumo)', padrao: true },
      { id: 'cortesia', label: 'Cortesia/Promoção', padrao: true },
      { id: 'sangria', label: 'Sangria (Retirada)', padrao: false }
    ]
  });

  const [marcasMaquinetas, setMarcasMaquinetas] = useState(['Stone', 'Ton', 'Mercado Pago']);
  const [novaMarca, setNovaMarca] = useState('');

  // --- CONFIGURAÇÃO DE BENEFÍCIOS (RH) ---
  const listaBeneficiosPadrao = [
    { id: 'add_noturno', nome: 'Adicional Noturno', tipo: 'provento', calculo: 'porcentagem_base', valor: 20, descricao: '20% sobre salário base' },
    { id: 'insalubridade_min', nome: 'Insalubridade (Mín)', tipo: 'provento', calculo: 'fixo', valor: 151.80, descricao: 'Grau Mínimo (R$ 151,80)' },
    { id: 'vt', nome: 'Vale Transporte', tipo: 'desconto', calculo: 'porcentagem_base', valor: 6, descricao: '6% desconto legal' },
    { id: 'gratificacao', nome: 'Gratificação', tipo: 'provento', calculo: 'fixo', valor: 100.00, descricao: 'Bônus' }
  ];
  const [tiposBeneficios, setTiposBeneficios] = useState(listaBeneficiosPadrao);

  // --- ESTADOS DA AUDITORIA ---
  const [conferenciaFisica, setConferenciaFisica] = useState({
    dinheiroCaixa: '',      
    tunaConferido: '',
    ifoodConferido: '',        
    valoresMaquinetas: {} 
  });
  const [obsAuditoria, setObsAuditoria] = useState('');
  const [modalResumoAuditoria, setModalResumoAuditoria] = useState(false);
  const [logsAuditoria, setLogsAuditoria] = useState([]);

  // --- ESTADOS PARA MODAL DE TEXTO (RESUMO) ---
  const [textoResumo, setTextoResumo] = useState('');
  const [mostrarModalTexto, setMostrarModalTexto] = useState(false);

  // --- ESTADO DA CALCULADORA DE NOTAS ---
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [contagemNotas, setContagemNotas] = useState({
    100: '', 50: '', 20: '', 10: '', 5: '', 2: '', moedas: ''
  });

  // --- GESTÃO DE FUNCIONÁRIOS ---
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
  const [mostrarFormFuncionario, setMostrarFormFuncionario] = useState(false);
  const [modoEdicaoFunc, setModoEdicaoFunc] = useState(false); 
  const [formFuncionario, setFormFuncionario] = useState({ id: null, nome: '', salario: '', equipe: 'Cozinha', funcao: 'Auxiliar', dependentes: 0, beneficiosAtivos: [] });
  const [modoSelecao, setModoSelecao] = useState(false);
  const [idsSelecionados, setIdsSelecionados] = useState([]);
  const [modalMassa, setModalMassa] = useState(null);

  // ESTADOS GERAIS
  const [percentualPagamento, setPercentualPagamento] = useState(60); 
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0, 7));
  const [buscaHistorico, setBuscaHistorico] = useState('');
   
  // MODAIS
  const [modalAviso, setModalAviso] = useState(null); 
  const [modalDetalhes, setModalDetalhes] = useState(null); 
  const [modalConfigBeneficios, setModalConfigBeneficios] = useState(false); 
  const [modalConfigGeral, setModalConfigGeral] = useState(false);

  // Transação Atual
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('venda_dinheiro');
  const [maquinetaSelecionada, setMaquinetaSelecionada] = useState('');
  const [observacao, setObservacao] = useState('');
  const [transacoes, setTransacoes] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [transacoesRH, setTransacoesRH] = useState([]);
  const [saidaViaPix, setSaidaViaPix] = useState(false);

  // --- ESTADOS DO NOVO PAINEL DE ENTREGAS (MOTOBOYS) ---
  const [entregasPendentes, setEntregasPendentes] = useState([]);
  const [formEntrega, setFormEntrega] = useState({
    motoboyId: '',
    pedidoNumero: '',
    valorPedido: '',
    formaPagamento: 'Dinheiro',
    trocoEnviado: ''
  });
  
  // --- ESTADOS ESPECÍFICOS PARA MOTOBOY ---
  const [motoQtd, setMotoQtd] = useState('');
  const [motoValorEntregas, setMotoValorEntregas] = useState(''); // Você digita o valor total
  const [motoMeta, setMotoMeta] = useState('10'); // Meta padrão (ex: 10 entregas)
  const [motoValorAjuda, setMotoValorAjuda] = useState('15.00'); // Valor da ajuda (ex: 20 reais)

  // Seleção de edição em massa
  const [modalEdicaoMassa, setModalEdicaoMassa] = useState(false);
  const [campoMassa, setCampoMassa] = useState('salario'); // Qual campo vai mudar
  const [valorMassa, setValorMassa] = useState(''); // Novo valor

  // Filtro de RH
  const [filtroRH, setFiltroRH] = useState('');

  // Extrato de vales individual
  const [modalExtrato, setModalExtrato] = useState(null);
  
// --- EFEITO MÁGICO DO MOTOBOY ---
  useEffect(() => {
    if (categoria === 'diaria_motoboy') {
      const qtd = parseInt(motoQtd) || 0;
      const valEntregas = parseFloat(motoValorEntregas) || 0;
      const meta = parseInt(motoMeta) || 0;
      const valAjuda = parseFloat(motoValorAjuda) || 0;

      // Regra: Ganha ajuda se fizer IGUAL ou MAIS que a meta
      const ganhouAjuda = qtd >= meta;
      const valorFinal = valEntregas + (ganhouAjuda ? valAjuda : 0);

      // Atualiza o Valor Total do Lançamento
      if (valorFinal > 0) setValor(valorFinal.toFixed(2));
      else setValor('');

      // Gera a Descrição Técnica automática para o Extrato
      // Ex: "Diária: 12 Entregas (R$ 40,00) + Ajuda (R$ 15,00)"
      let descTecnica = `${qtd} Entregas`;
      if (valEntregas > 0) descTecnica += ` (R$ ${valEntregas.toFixed(2)})`;
      if (ganhouAjuda) descTecnica += ` + Ajuda (R$ ${valAjuda.toFixed(2)})`;
      
      setDescricao(descTecnica);
    }
  }, [categoria, motoQtd, motoValorEntregas, motoMeta, motoValorAjuda]);
  
  // --- EFEITOS SUPABASE (Carregamento Real) ---
  // 1. Carregar Transações do Dia
  useEffect(() => {
    fetchTransacoes();
    const channel = supabase
      .channel('realtime_transacoes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes' }, () => {
        fetchTransacoes();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [dataMovimento]);

  // 2. Carregar Funcionários e Entregas
  useEffect(() => {
    fetchFuncionarios();
    fetchEntregas();
  }, []);

  // 3. Carregar Histórico
  useEffect(() => {
    fetchHistorico();
  }, []);

  useEffect(() => {
  if (activeTab === 'funcionarios') {
    fetchTransacoesRH();
  }
}, [activeTab]); // Executa sempre que mudar de aba

  const fetchTransacoesRH = async () => {
  // Busca todas as transações que NÃO têm o info_desconto nulo
  const { data, error } = await supabase
    .from('transacoes')
    .select('*')
    .not('info_desconto', 'is', null); 

  if (error) {
    console.error('Erro ao buscar vales para RH:', error);
  } else {
    setTransacoesRH(data || []);
  }
};

  // --- FUNÇÕES DE BANCO DE DADOS ---
  const fetchTransacoes = async () => {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('data_movimento', dataMovimento)
      .order('id', { ascending: false });
    
    if (error) console.error('Erro ao buscar transações:', error);
    else setTransacoes(data || []);
  };

  // Busca as entregas que estão na rua
  const fetchEntregas = async () => {
    // Fazemos um "join" com a tabela de funcionários para já trazer o nome do motoboy
    const { data, error } = await supabase
      .from('entregas_pendentes')
      .select(`*, funcionarios(nome)`)
      .eq('status', 'pendente')
      .order('data_criacao', { ascending: true });

    if (error) console.error('Erro ao buscar entregas:', error);
    else setEntregasPendentes(data || []);
  };

  const fetchFuncionarios = async () => {
    const { data, error } = await supabase.from('funcionarios').select('*').order('nome');
    if (error) console.error('Erro func:', error);
    else setFuncionarios(data || []);
  };

  const fetchHistorico = async () => {
    const { data, error } = await supabase
      .from('historico')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
    } else {
      const formatado = data.map(h => {
        const conteudo = typeof h.conteudo_completo === 'string' 
          ? JSON.parse(h.conteudo_completo) 
          : h.conteudo_completo;
          
        return { 
          ...conteudo,
          id: h.id,
          dataBanco: h.data 
        };
      });
      setHistorico(formatado);
    }
  };

  // Função para despachar um novo pedido com o motoboy
  const despacharEntrega = async (e) => {
    e.preventDefault();
    if (!formEntrega.motoboyId || !formEntrega.pedidoNumero || !formEntrega.valorPedido) {
      return setModalAviso({ titulo: "Atenção", msg: "Preencha o Motoboy, Nº do Pedido e Valor!", tipo: 'error' });
    }

    const novaEntrega = {
      funcionario_id: formEntrega.motoboyId,
      pedido_numero: formEntrega.pedidoNumero,
      valor_pedido: parseFloat(formEntrega.valorPedido),
      forma_pagamento: formEntrega.formaPagamento,
      troco_enviado: parseFloat(formEntrega.trocoEnviado) || 0,
      status: 'pendente'
    };

    const { error } = await supabase.from('entregas_pendentes').insert([novaEntrega]);

    if (error) {
      console.error(error);
      setModalAviso({ titulo: "Erro", msg: "Erro ao despachar pedido.", tipo: 'error' });
    } else {
      fetchEntregas(); // Atualiza a tela
      // Limpa só o pedido e valor, mantém o motoboy para facilitar se ele for levar vários
      setFormEntrega({ ...formEntrega, pedidoNumero: '', valorPedido: '', trocoEnviado: '' }); 
    }
  };

  // Função que finaliza a rota do motoboy e joga o dinheiro no caixa
  const finalizarAcertoMotoboy = async (motoboyId, nomeMotoboy, entregas) => {
    if (!confirm(`Confirmar o acerto de ${nomeMotoboy}? Isso vai lançar os valores no Fluxo de Caixa do dia.`)) return;

    // 1. Separa o que foi Dinheiro e o que foi Cartão
    let totalDinheiro = 0;
    let totalCartao = 0;
    
    entregas.forEach(ent => {
      if (ent.forma_pagamento === 'Dinheiro') {
        totalDinheiro += Number(ent.valor_pedido);
      } else {
        totalCartao += Number(ent.valor_pedido);
      }
    });

    const novasTransacoes = [];
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 2. Prepara o lançamento do Dinheiro
    if (totalDinheiro > 0) {
      novasTransacoes.push({
        hora: horaAtual,
        descricao: `Moto: ${nomeMotoboy} - Acerto Entregas`,
        valor: totalDinheiro,
        categoria: 'venda_dinheiro',
        tipo: 'entrada',
        data_movimento: dataMovimento,
        forma_pagamento: 'dinheiro'
      });
    }

    // 3. Prepara o lançamento do Cartão
    if (totalCartao > 0) {
      // Pergunta a maquineta rapidinho para não desorganizar o seu fechamento de cartão
      let maq = prompt(`As vendas no cartão de ${nomeMotoboy} deram R$ ${totalCartao.toFixed(2)}. Qual maquineta ele usou? (Digite: Ton ou Cielo)`);
      if (!maq) maq = 'Ton'; // Define 'Ton' como padrão se você só der 'OK' ou fechar

      novasTransacoes.push({
        hora: horaAtual,
        descricao: `Moto: ${nomeMotoboy} - Acerto Entregas`,
        valor: totalCartao,
        categoria: 'venda_cartao',
        tipo: 'entrada',
        maquineta: maq,
        data_movimento: dataMovimento,
        forma_pagamento: 'dinheiro' 
      });
    }

    // 4. Salva tudo no Fluxo de Caixa (Tabela transacoes)
    if (novasTransacoes.length > 0) {
      const { error: erroTransacao } = await supabase.from('transacoes').insert(novasTransacoes);
      if (erroTransacao) return setModalAviso({ titulo: "Erro", msg: "Erro ao lançar no caixa.", tipo: 'error' });
    }

    // 5. Baixa as entregas (Muda o status para concluído)
    const ids = entregas.map(e => e.id);
    const { error: erroUpdate } = await supabase
      .from('entregas_pendentes')
      .update({ status: 'concluido' })
      .in('id', ids);

    if (erroUpdate) return setModalAviso({ titulo: "Erro", msg: "Erro ao limpar entregas do motoboy.", tipo: 'error' });

    // 6. Sucesso! Atualiza tudo.
    setModalAviso({ titulo: "Acerto Concluído!", msg: `O acerto de ${nomeMotoboy} foi lançado no caixa com sucesso.`, tipo: 'success' });
    fetchEntregas();   // Limpa o cartão do motoboy
    fetchTransacoes(); // Atualiza a tela de Fluxo de Caixa
  };

  // Agrupa as entregas por motoboy para mostrar nos cartões
  const entregasAgrupadas = entregasPendentes.reduce((acc, entrega) => {
    if (!acc[entrega.funcionario_id]) {
      acc[entrega.funcionario_id] = {
        nome: entrega.funcionarios?.nome || 'Desconhecido',
        entregas: [],
        totalDinheiro: 0,
        totalCartao: 0,
        totalTroco: 0
      };
    }
    acc[entrega.funcionario_id].entregas.push(entrega);
    if (entrega.forma_pagamento === 'Dinheiro') {
       acc[entrega.funcionario_id].totalDinheiro += Number(entrega.valor_pedido);
       acc[entrega.funcionario_id].totalTroco += Number(entrega.troco_enviado);
    } else {
       acc[entrega.funcionario_id].totalCartao += Number(entrega.valor_pedido);
    }
    return acc;
  }, {});

// --- Helpers ---
  const BRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const Avatar = ({ nome }) => ( <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">{typeof nome === 'string' ? nome.substring(0, 2).toUpperCase() : 'FX'}</div> );
  
  // 1. Função para calcular data do pagamento (Dia 04 ou Dia 19)
  const calcularDataDesconto = (dataTransacao) => {
    // CORREÇÃO DO FUSO HORÁRIO: Adicionamos T12:00:00 para garantir que pegue o dia certo
    const data = new Date(dataTransacao + 'T12:00:00');
    const dia = data.getDate(); 
    const mes = data.getMonth();
    const ano = data.getFullYear();

    // REGRA DO ADIANTAMENTO (Dia 19)
    // Pega vales do dia 05 até o dia 19
    if (dia >= 5 && dia <= 19) {
       return new Date(ano, mes, 19).toLocaleDateString('pt-BR');
    } 
    else {
      // REGRA DO PAGAMENTO MENSAL (Dia 04)
      // Se for dia 20 em diante, joga pro dia 4 do mês seguinte
      if (dia > 19) {
         return new Date(ano, mes + 1, 4).toLocaleDateString('pt-BR');
      }
      // Se for antes do dia 5 (dias 1, 2, 3, 4), desconta no dia 4 deste mês
      else {
         return new Date(ano, mes, 4).toLocaleDateString('pt-BR');
      }
    }
  };

  // 2. Função visual do Ciclo
  const getPeriodoAtual = (dataAtual) => {
    // Aqui também usamos o T12:00:00 para garantir que a dataAtual não volte um dia
    const dataPagamentoStr = calcularDataDesconto(dataAtual); 
    
    const [dia, mes, ano] = dataPagamentoStr.split('/').map(Number);
    
    let inicioCiclo = "";
    
    // Se a data de pagamento é dia 4
    if (dia === 4) {
      // O ciclo começou dia 20 do mês anterior
      const dataRef = new Date(ano, mes - 1 - 1, 20); 
      inicioCiclo = dataRef.toLocaleDateString('pt-BR');
    } else {
      // Se a data de pagamento é dia 19
      // O ciclo começou dia 5 deste mês
      const dataRef = new Date(ano, mes - 1, 5);
      inicioCiclo = dataRef.toLocaleDateString('pt-BR');
    }
  
    return { inicio: inicioCiclo, fim: dataPagamentoStr };
  };

  // --- CONFIGURAÇÃO ---
  const adicionarMarcaMaquineta = () => {
    if(novaMarca && !marcasMaquinetas.includes(novaMarca)) {
      setMarcasMaquinetas([...marcasMaquinetas, novaMarca]);
      setNovaMarca('');
    }
  };
  const removerMarcaMaquineta = (marca) => {
    setMarcasMaquinetas(marcasMaquinetas.filter(m => m !== marca));
  };

  // --- CÁLCULO DE NOTAS ---
  const atualizarContagemNotas = (tipo, valorInput) => {
    if(valorInput < 0) return;
    const novaContagem = { ...contagemNotas, [tipo]: valorInput };
    setContagemNotas(novaContagem);
    let totalGeral = 0;
    [100, 50, 20, 10, 5, 2].forEach(nota => { const qtd = parseInt(novaContagem[nota]) || 0; totalGeral += qtd * nota; });
    const valorMoedas = parseFloat(novaContagem.moedas) || 0;
    totalGeral += valorMoedas;
    setConferenciaFisica(prev => ({ ...prev, dinheiroCaixa: totalGeral.toFixed(2) }));
  };

  // --- CÁLCULOS GERAIS (SISTEMA) ---
  const getTipoCategoria = (catId) => {
    if(configCategorias.entrada.find(c => c.id === catId)) return 'entrada';
    if(configCategorias.saida.find(c => c.id === catId)) return 'saida';
    return 'neutro';
  };

  const totalEntradasDinheiro = transacoes.filter(t => t.categoria === 'venda_dinheiro').reduce((acc, t) => acc + t.valor, 0);
  
  // --- CÁLCULO DINÂMICO DE MAQUINETAS (NOVO MOTOR) ---
  const totaisMaquinetasSistema = {};
  marcasMaquinetas.forEach(marca => {
    totaisMaquinetasSistema[marca] = transacoes
      .filter(t => t.categoria === 'venda_cartao' && t.maquineta === marca)
      .reduce((acc, t) => acc + t.valor, 0);
  });

  // Pega TODO o cartão (mesmo se você apagar a maquineta da lista no futuro)
  const totalEntradasCartao = transacoes
    .filter(t => t.categoria === 'venda_cartao')
    .reduce((acc, t) => acc + t.valor, 0);

  // VARIÁVEIS TEMPORÁRIAS (Não apague, elas evitam que a tela quebre por enquanto)
  const totalEntradasTon = totaisMaquinetasSistema['Ton'] || 0;
  const totalEntradasCielo = totaisMaquinetasSistema['Cielo'] || 0;

  const totalEntradasTuna = transacoes.filter(t => t.categoria === 'venda_tuna').reduce((acc, t) => acc + t.valor, 0);
  const totalEntradasIfood = transacoes.filter(t => t.categoria === 'venda_ifood').reduce((acc, t) => acc + t.valor, 0);
  
  const faturamentoTotalApp = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  // 1. Total de Saídas GERAL (Para relatório financeiro - mantém tudo)
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);

  // 2. Total de Saídas QUE SAÍRAM DA GAVETA (Dinheiro - Ignora o PIX)
  const totalSaidasGaveta = transacoes
    .filter(t => t.tipo === 'saida' && t.forma_pagamento !== 'pix') 
    .reduce((acc, t) => acc + t.valor, 0);
  
  // 3. Total de Saídas PAGAS NO PIX (Apenas para controle interno)
  const totalSaidasPix = transacoes
    .filter(t => t.tipo === 'saida' && t.forma_pagamento === 'pix')
    .reduce((acc, t) => acc + t.valor, 0);
  
  const saldoInicial = (parseFloat(saldoAnterior) || 0) + (parseFloat(reforcoCaixa) || 0);
  
  // CÁLCULO FINAL DA GAVETA (AGORA CORRIGIDO)
  // O sistema agora só subtrai da gaveta o que realmente saiu em dinheiro físico.
  // Se foi pago no PIX, o dinheiro continua na gaveta, então não subtraímos aqui.
  const saldoFinalCaixaTeorico = saldoInicial + totalEntradasDinheiro - totalSaidasGaveta;
  // --- DINHEIRO LÍQUIDO DO DIA (Para o Card Visual) ---
  // Apenas o que rendeu hoje (Vendas - Saídas), ignorando o Fundo de Troco
  const dinheiroLiquidoDoDia = totalEntradasDinheiro - totalSaidasGaveta;

  // 2. Saldo Financeiro TOTAL (Relatório)
  const saldoFinanceiroTotal = saldoInicial + faturamentoTotalApp - totalSaidas;

  // --- CÁLCULOS AUDITORIA ---
  const totalFisicoDinheiro = parseFloat(conferenciaFisica.dinheiroCaixa || 0);
  const totalFisicoTuna = parseFloat(conferenciaFisica.tunaConferido || 0);
  const totalFisicoIfood = parseFloat(conferenciaFisica.ifoodConferido || 0);
  
  // --- DIFERENÇAS DINÂMICAS DE MAQUINETAS (NOVO MOTOR) ---
  const totalFisicoCartao = Object.values(conferenciaFisica.valoresMaquinetas).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  const totalFisicoGeral = totalFisicoDinheiro + totalFisicoTuna + totalFisicoIfood + totalFisicoCartao;

  const diferencasMaquinetas = {};
  marcasMaquinetas.forEach(marca => {
    const fisico = parseFloat(conferenciaFisica.valoresMaquinetas[marca] || 0);
    const sistema = totaisMaquinetasSistema[marca] || 0;
    diferencasMaquinetas[marca] = fisico - sistema;
  });

  const difDinheiro = totalFisicoDinheiro - saldoFinalCaixaTeorico; 
  const difCartao = totalFisicoCartao - totalEntradasCartao;
  const difTuna = totalFisicoTuna - totalEntradasTuna;
  const difIfood = totalFisicoIfood - totalEntradasIfood;
  const difGeral = difDinheiro + difCartao + difTuna + difIfood;

  // VARIÁVEIS TEMPORÁRIAS (Evita quebrar a tela)
  const difTon = diferencasMaquinetas['Ton'] || 0;
  const difCielo = diferencasMaquinetas['Cielo'] || 0;

  const getStatusDiferenca = (diff) => {
    if (Math.abs(diff) < 0.50) return { cor: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle size={16}/>, msg: 'Ok' };
    if (diff < -0.50) return { cor: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle size={16}/>, msg: 'Falta' };
    return { cor: 'text-blue-600', bg: 'bg-blue-100', icon: <AlertOctagon size={16}/>, msg: 'Sobra' };
  };

// --- FUNÇÃO GERAR TEXTO RESUMO (ATUALIZADA COM PIX) ---
  const gerarTextoResumo = () => {
    const valesDinheiroList = transacoes.filter(t => t.categoria === 'vale_dinheiro');
    const valesConsumoList = transacoes.filter(t => t.categoria === 'vale_produto');
    const motoboysList = transacoes.filter(t => t.categoria === 'diaria_motoboy');

    const totalValesDinheiro = valesDinheiroList.reduce((acc, t) => acc + t.valor, 0);
    const totalValesConsumo = valesConsumoList.reduce((acc, t) => acc + t.valor, 0);
    const totalMotoboys = motoboysList.reduce((acc, t) => acc + t.valor, 0);
    
    // Cálculos de Saída (Separados)
    const totalSaidasPix = transacoes.filter(t => t.tipo === 'saida' && t.forma_pagamento === 'pix').reduce((acc, t) => acc + t.valor, 0);
    const totalSaidasGaveta = totalSaidas - totalSaidasPix;

    const listaVales = [...valesDinheiroList, ...valesConsumoList].map(t => {
      const nome = t.info_desconto?.funcionarioNome || t.descricao || 'Colaborador';
      const tipo = t.categoria === 'vale_dinheiro' ? 'Dinheiro' : 'Consumo';
      const tagPix = t.forma_pagamento === 'pix' ? ' [PIX]' : '';
      return `   - ${nome}: ${BRL(t.valor)} (${tipo})${tagPix}`;
    }).join('\n');

    const listaMotoboys = motoboysList.map(t => {
      const tagPix = t.forma_pagamento === 'pix' ? ' [PIX]' : '';
      return `   - ${t.descricao || 'Moto'}: ${BRL(t.valor)}${tagPix}`;
    }).join('\n');

    const listaMovimentacoes = transacoes.map(t => {
      const simbolo = t.tipo === 'entrada' ? '+' : t.tipo === 'saida' ? '-' : '•';
      const catLabel = configCategorias.entrada.concat(configCategorias.saida).concat(configCategorias.neutro).find(c=>c.id===t.categoria)?.label || t.categoria;
      const descFinal = t.descricao || catLabel;
      const extraInfo = t.maquineta ? ` [${t.maquineta}]` : '';
      const tagPix = t.forma_pagamento === 'pix' ? ' [PIX]' : ''; // Marca no extrato
      return `${t.hora} | ${simbolo} ${BRL(t.valor)} | ${descFinal}${extraInfo}${tagPix}`;
    }).join('\n');

    // --- GERA A LISTA DINÂMICA DE MAQUINETAS PARA O ZAP ---
    const listaMaquinetasTexto = marcasMaquinetas.map((marca, index) => {
      const isLast = index === marcasMaquinetas.length - 1;
      return `   ${isLast ? '└─' : '├─'} ${marca}: ${BRL(totaisMaquinetasSistema[marca] || 0)}`;
    }).join('\n');

    const texto = `🍕 FECHAMENTO PIZZARIA - ${new Date(dataMovimento).toLocaleDateString('pt-BR')}
👤 Resp: ${usuarioAtual.nome}

💰 Faturamento Total: ${BRL(faturamentoTotalApp)}
💵 Dinheiro: ${BRL(totalEntradasDinheiro)}
💳 Cartão: ${BRL(totalEntradasCartao)}
${listaMaquinetasTexto}
🎫 Tuna: ${BRL(totalEntradasTuna)}
🎫 Tuna: ${BRL(totalEntradasTuna)}
🛵 iFood: ${BRL(totalEntradasIfood)}

👇 DETALHAMENTO DE SAÍDAS:
💸 Vales (${BRL(totalValesDinheiro + totalValesConsumo)})
${listaVales.length > 0 ? listaVales : '   (Sem vales)'}

🏍️ Motoboys (${BRL(totalMotoboys)})
${listaMotoboys.length > 0 ? listaMotoboys : '   (Sem motoboys)'}

📱 Pagos via PIX: ${BRL(totalSaidasPix)}
🛑 Saídas em Dinheiro: ${BRL(totalSaidasGaveta)}
----------------------------------
✅ Saldo Final (Gaveta): ${BRL(saldoFinalCaixaTeorico)}

📋 Extrato Completo:
${listaMovimentacoes.length > 0 ? listaMovimentacoes : '(Nenhuma movimentação)'}`;

    setTextoResumo(texto);
    setMostrarModalTexto(true);
  };

  const copiarTextoDoModal = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textoResumo).then(() => {
        setModalAviso({ titulo: "Sucesso", msg: "Texto copiado para a área de transferência!", tipo: 'success' });
        setMostrarModalTexto(false);
      }).catch(() => {
        setModalAviso({ titulo: "Erro", msg: "Erro ao copiar.", tipo: 'error' });
      });
    }
  };

  // --- AÇÕES DO SISTEMA (SUPABASE) ---
// --- FUNÇÃO DE SEGURANÇA (GERENTE) ---
  const gerarNovaSenhaCaixa = async () => {
    const novaSenha = Math.floor(1000 + Math.random() * 9000).toString(); // Gera ex: 4521
    
    const { error } = await supabase
      .from('configuracoes')
      .update({ senha_caixa: novaSenha })
      .eq('id', 1);

    if (error) {
      setModalAviso({ titulo: "Erro", msg: "Erro ao gerar senha.", tipo: 'error' });
    } else {
      setTokenDoDia(novaSenha);
      setModalAviso({ titulo: "Nova Senha Gerada", msg: `A senha do caixa agora é: ${novaSenha}`, tipo: 'success' });
    }
  };

  // Buscar a senha atual assim que o Gerente logar
  const fetchSenhaAtual = async () => {
     const { data } = await supabase.from('configuracoes').select('senha_caixa').eq('id', 1).single();
     if(data) setTokenDoDia(data.senha_caixa);
  };

  const adicionarTransacao = async (e) => { 
    e.preventDefault(); 
    if (!valor) return; 
    
    // VALIDAÇÃO MAQUINETA
    if (categoria === 'venda_cartao' && !maquinetaSelecionada) {
        return setModalAviso({ titulo: "Atenção", msg: "Selecione a maquineta (Ton ou Cielo).", tipo: 'error' });
    }

    let tipo = getTipoCategoria(categoria);
    
    // Verifica se precisa de funcionário (Vale ou Motoboy)
    const isVale = categoria.includes('vale') || categoria === 'vale_produto'; 
    const isMotoboy = categoria === 'diaria_motoboy';
    const precisaFuncionario = isVale || isMotoboy;
    
    if (precisaFuncionario && !funcionarioSelecionado) {
        return setModalAviso({ titulo: "Atenção", msg: "Selecione a pessoa responsável.", tipo: 'error' }); 
    }

    let infoDesconto = null; 
    let nomeFuncionario = '';

    if (precisaFuncionario) { 
      const func = funcionarios.find(f => f.id === parseInt(funcionarioSelecionado)); 
      if (func) {
          nomeFuncionario = func.nome;
          
          // Só cria info de desconto se for VALE (para descontar na folha depois)
          if (isVale) {
              infoDesconto = { 
                funcionarioId: func.id, 
                funcionarioNome: func.nome,
                dataDesconto: calcularDataDesconto(dataMovimento) 
              }; 
          }
      }
    } 

    const novaTransacao = { 
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), 
      // Adiciona o nome na descrição automaticamente se houver funcionário
      descricao: precisaFuncionario ? `${descricao} (${nomeFuncionario})` : descricao, 
      valor: parseFloat(valor), 
      categoria, 
      tipo, 
      observacao, 
      info_desconto: infoDesconto,
      maquineta: categoria === 'venda_cartao' ? maquinetaSelecionada : null,
      data_movimento: dataMovimento,

      forma_pagamento: (tipo === 'saida' && saidaViaPix) ? 'pix' : 'dinheiro'
    };

    // --- CORREÇÃO: AQUI SALVA NA TABELA 'TRANSACOES' ---
    const { error } = await supabase.from('transacoes').insert([novaTransacao]);

    if (error) {
        console.error(error);
        setModalAviso({ titulo: "Erro", msg: "Erro ao salvar transação.", tipo: 'error' });
    } else {
        // Limpa os campos da transação
        setValor('');
        setDescricao('');
        setObservacao('');
        setFuncionarioSelecionado('');
        setSaidaViaPix(false);
        fetchTransacoes(); // Atualiza a lista na tela
    }
  };

  // --- FUNÇÃO LIMPAR TUDO (NOVO) ---
  const limparMovimentoDoDia = async () => {
    // 1. Verificação de Segurança (Só apaga se tiver algo)
    if (transacoes.length === 0) return;

    // 2. Confirmação Dupla para evitar acidentes
    const confirmacao1 = window.confirm("PERIGO: Você tem certeza que deseja APAGAR TODOS os lançamentos deste dia?");
    if (!confirmacao1) return;

    const confirmacao2 = window.confirm("Última chance: Isso não pode ser desfeito. Confirma a limpeza total do dia?");
    if (!confirmacao2) return;

    // 3. Apaga no Banco de Dados (Apenas a data selecionada)
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('data_movimento', dataMovimento); // Importante: Só apaga a data atual

    if (error) {
      console.error('Erro ao limpar:', error);
      setModalAviso({ titulo: "Erro", msg: "Erro ao limpar o dia.", tipo: 'error' });
    } else {
      setModalAviso({ titulo: "Limpeza Concluída", msg: "O movimento do dia foi zerado.", tipo: 'success' });
      fetchTransacoes(); // Atualiza a tela (vai ficar vazia)
    }
  };

  // --- FUNÇÃO REMOVER UM ITEM (INDIVIDUAL) ---
  const removerTransacao = async (id) => {
    // Pergunta de segurança básica
    if (window.confirm("Tem certeza que deseja excluir este lançamento específico?")) {
      
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar:', error);
        setModalAviso({ titulo: "Erro", msg: "Não foi possível excluir o item.", tipo: 'error' });
      } else {
        fetchTransacoes(); // Atualiza a lista na hora
      }
    }
  };

  // --- FUNÇÃO COPIAR EXTRATO INDIVIDUAL ---
  const copiarExtratoIndividual = () => {
    // 1. Filtra os itens do funcionário no ciclo atual
    const itens = transacoesRH.filter(t => {
        if (!t.info_desconto || t.info_desconto.funcionarioId !== modalExtrato.id) return false;
        return calcularDataDesconto(t.data_movimento) === calcularDataDesconto(dataMovimento);
    });

    if (itens.length === 0) return alert("Não há itens para copiar.");

    const total = itens.reduce((acc, t) => acc + t.valor, 0);
    const periodo = getPeriodoAtual(dataMovimento);

    // 2. Monta o texto formatado para WhatsApp
    let texto = `🧾 *EXTRATO DE VALES - ${modalExtrato.nome.toUpperCase()}*\n`;
    texto += `📅 Período: ${periodo.inicio} até ${periodo.fim}\n`;
    texto += `--------------------------------\n`;

    itens.forEach(t => {
      const dataFormatada = t.data_movimento.split('-').slice(1).reverse().join('/'); // Mostra dia/mês
      const tipo = t.categoria === 'vale_dinheiro' ? '💸' : '🍕';
      texto += `${tipo} ${dataFormatada} - ${t.descricao || 'Vale'}: ${BRL(t.valor)}\n`;
    });

    texto += `--------------------------------\n`;
    texto += `💰 *TOTAL A DESCONTAR: ${BRL(total)}*`;

    // 3. Copia para a área de transferência
    navigator.clipboard.writeText(texto).then(() => {
       setModalAviso({ titulo: "Copiado!", msg: "Extrato copiado. Pode colar no WhatsApp.", tipo: 'success' });
    });
  };

  const salvarFuncionario = async (e) => {
    e.preventDefault();

    // Prepara os dados do funcionário
    const dadosFunc = {
      nome: formFuncionario.nome,
      salario: parseFloat(formFuncionario.salario),
      equipe: formFuncionario.equipe,
      funcao: formFuncionario.funcao,
      dependentes: parseInt(formFuncionario.dependentes) || 0,
      beneficios_ativos: formFuncionario.beneficiosAtivos
    };

    if (modoEdicaoFunc) {
       // ATUALIZAR
       const { error } = await supabase.from('funcionarios').update(dadosFunc).eq('id', formFuncionario.id);
       if(!error) setModalAviso({ titulo: "Sucesso", msg: "Dados atualizados!", tipo: 'success' });
    } else {
       // CRIAR NOVO
       const { error } = await supabase.from('funcionarios').insert([dadosFunc]);
       if(!error) setModalAviso({ titulo: "Sucesso", msg: "Funcionário cadastrado!", tipo: 'success' });
    }
    
    // Atualiza a lista e limpa o formulário
    fetchFuncionarios();
    setFormFuncionario({ id: null, nome: '', salario: '', equipe: 'Cozinha', funcao: 'Auxiliar', dependentes: 0, beneficiosAtivos: [] });
    setMostrarFormFuncionario(false);
    setModoEdicaoFunc(false);
  };

  const aplicarEdicaoMassa = async () => {
    if (!valorMassa) return alert("Digite um valor!");
    
    const confirmacao = confirm(`Tem certeza que deseja alterar o(a) ${campoMassa.toUpperCase()} de ${idsSelecionados.length} funcionários para ${valorMassa}?`);
    
    if (confirmacao) {
      // O truque do Supabase: .in() aceita uma lista de IDs
      const { error } = await supabase
        .from('funcionarios')
        .update({ [campoMassa]: valorMassa })
        .in('id', idsSelecionados);

      if (error) {
        setModalAviso({ titulo: "Erro", msg: "Erro ao atualizar em massa.", tipo: 'error' });
      } else {
        setModalAviso({ titulo: "Sucesso", msg: "Dados atualizados com sucesso!", tipo: 'success' });
        fetchFuncionarios(); // Atualiza a tela
        setIdsSelecionados([]); // Limpa seleção
        setModalEdicaoMassa(false); // Fecha modal
        setValorMassa('');
      }
    }
  };

  const toggleSelecao = (id) => {
    if (idsSelecionados.includes(id)) {
      setIdsSelecionados(idsSelecionados.filter(item => item !== id));
    } else {
      setIdsSelecionados([...idsSelecionados, id]);
    }
  };

  const selecionarTodosDaEquipe = (lista) => {
    const idsDaEquipe = lista.map(f => f.id);
    
    // Verifica se todos os funcionários dessa equipe já estão na lista de selecionados
    const todosJaSelecionados = idsDaEquipe.every(id => idsSelecionados.includes(id));

    if (todosJaSelecionados) {
      // Se todos já estavam marcados, removemos apenas os IDs desta equipe
      setIdsSelecionados(prev => prev.filter(id => !idsDaEquipe.includes(id)));
    } else {
      // Caso contrário, adicionamos os IDs que faltam (usando Set para não duplicar)
      setIdsSelecionados(prev => [...new Set([...prev, ...idsDaEquipe])]);
    }
  };

  const prepararEdicao = (func) => { 
      setFormFuncionario({ 
          id: func.id, 
          nome: func.nome, 
          salario: func.salario, 
          equipe: func.equipe, 
          funcao: func.funcao, 
          dependentes: func.dependentes || 0, 
          beneficiosAtivos: func.beneficios_ativos || [] 
      }); 
      setModoEdicaoFunc(true); 
      setMostrarFormFuncionario(true); 
  };
  
  const toggleBeneficioNoForm = (idBeneficio) => { 
      if (formFuncionario.beneficiosAtivos.includes(idBeneficio)) { 
          setFormFuncionario({...formFuncionario, beneficiosAtivos: formFuncionario.beneficiosAtivos.filter(id => id !== idBeneficio)}); 
      } else { 
          setFormFuncionario({...formFuncionario, beneficiosAtivos: [...formFuncionario.beneficiosAtivos, idBeneficio]}); 
      } 
  };
  
  const atualizarFuncionario = async (id, campo, valor) => { 
      await supabase.from('funcionarios').update({ [campo]: valor }).eq('id', id);
      fetchFuncionarios();
  };

  // --- FECHAMENTO DO DIA ---
  const iniciarSalvarDia = () => setModalResumoAuditoria(true);
  
  const confirmarFechamentoFinal = async () => {
    const resumoDoDia = {
      data: dataMovimento,
      criadoEm: new Date().toISOString(),
      responsavelFechamento: usuarioAtual.nome,
      trocoInicial: parseFloat(saldoAnterior) || 0,
      reforcoCaixa: parseFloat(reforcoCaixa) || 0,
      auditoria: { 
          fisico: { 
            dinheiro: totalFisicoDinheiro,
            tuna: totalFisicoTuna,
            ifood: totalFisicoIfood,
            cartoesDetalhados: conferenciaFisica.valoresMaquinetas,
            totalGeral: totalFisicoGeral,
            detalheNotas: contagemNotas 
          }, 
          sistema: { 
            dinheiro: saldoFinalCaixaTeorico, 
            cartao: totalEntradasCartao, 
            maquinetasDetalhadas: totaisMaquinetasSistema, // <-- NOVO: Salva tudo dinâmico
            tuna: totalEntradasTuna,
            ifood: totalEntradasIfood
          },
          diferencas: { 
            total: difGeral, 
            detalhes: { 
              dinheiro: difDinheiro, 
              cartao: difCartao, 
              maquinetasDetalhadas: diferencasMaquinetas, // <-- NOVO: Salva diferenças dinâmicas
              tuna: difTuna, 
              ifood: difIfood 
            } 
          },
          obs: obsAuditoria 
      },
      resumoFinanceiro: { 
        faturamentoTotal: faturamentoTotalApp, 
        entradasDinheiro: totalEntradasDinheiro, 
        totalSaidas: totalSaidas, 
        saldoFinalTeorico: saldoFinanceiroTotal 
      },
      transacoes: [...transacoes]
    };

    const { error } = await supabase.from('historico').insert([{ 
      data: dataMovimento, 
      conteudo_completo: resumoDoDia 
    }]);

    if (!error) {
      setSaldoAnterior(''); 
      setReforcoCaixa('');
      setConferenciaFisica({ dinheiroCaixa: '', tunaConferido: '', ifoodConferido: '', valoresMaquinetas: {} });
      setContagemNotas({ 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', moedas: '' });
      setObsAuditoria('');
      setModalResumoAuditoria(false);
      
      setModalAviso({ titulo: "Dia Fechado!", msg: "Cópia salva no histórico com sucesso.", tipo: 'success' });
      fetchHistorico();
      setActiveTab('historico'); 
    } else {
      setModalAviso({ titulo: "Erro", msg: "Erro ao salvar histórico.", tipo: 'error' });
    }
  };

  const deletarDoHistorico = async (idBanco) => {
    if(confirm("Tem certeza?")) {
        await supabase.from('historico').delete().eq('id', idBanco);
        fetchHistorico();
    }
  };

// --- CÁLCULO DE FOLHA ---
  const calcularFolha = () => { 
      return funcionarios.map(func => { 
          const valesNoPeriodo = transacoesRH.filter(t => { 
            // 1. Verifica se o vale pertence a este funcionário
            if (!t.info_desconto || t.info_desconto.funcionarioId !== func.id) return false;
            
            // --- A MÁGICA ACONTECE AQUI ---
            // Em vez de olhar a "etiqueta" velha salva no banco (t.info_desconto.dataDesconto),
            // nós recalculamos a data de pagamento AGORA, baseado na data do vale.
            // Assim, a regra nova (04 e 19) se aplica retroativamente aos vales antigos!
            
            const dataPagamentoDessaTransacao = calcularDataDesconto(t.data_movimento);
            const dataPagamentoDoCicloAtual = calcularDataDesconto(dataMovimento);

            // Se o cálculo bater, inclui na conta
            return dataPagamentoDessaTransacao === dataPagamentoDoCicloAtual;
        });

          const valesDinheiro = valesNoPeriodo.filter(t => t.categoria === 'vale_dinheiro').reduce((acc, t) => acc + t.valor, 0);
          const valesConsumo = valesNoPeriodo.filter(t => t.categoria === 'vale_produto').reduce((acc, t) => acc + t.valor, 0);
          const totalVales = valesDinheiro + valesConsumo; 

          let totalProventosExtras = 0; 
          let totalDescontosExtras = 0; 
          
          (func.beneficios_ativos || []).forEach(benId => { 
              const regra = tiposBeneficios.find(b => b.id === benId); 
              if (regra) { 
                  let valorCalculado = 0; 
                  if (regra.calculo === 'fixo') { 
                      valorCalculado = regra.valor; 
                  } else if (regra.calculo === 'porcentagem_base') { 
                      valorCalculado = func.salario * (regra.valor / 100); 
                  } else if (regra.calculo === 'dependente') { 
                      if (func.salario < 1819.26) { valorCalculado = regra.valor * (func.dependentes || 0); } 
                  } 
                  
                  if (regra.tipo === 'provento') { 
                      totalProventosExtras += valorCalculado; 
                  } else { 
                      totalDescontosExtras += valorCalculado; 
                  } 
              } 
          }); 
          
          const valorDia = func.salario / 30; 
          const descontoFaltas = valorDia * (func.faltas || 0); 
          const bonus = parseFloat(func.bonificacao || 0); 
          let basePagamento = 0; 
          let aReceber = 0; 
          
          if (percentualPagamento === 40) { 
              basePagamento = func.salario * 0.40; 
              aReceber = basePagamento - totalVales; 
              totalProventosExtras = 0; 
              totalDescontosExtras = 0; 
          } else { 
              basePagamento = func.salario * 0.60; 
              aReceber = basePagamento + totalProventosExtras + bonus - descontoFaltas - totalDescontosExtras - totalVales; 
          } 
          
          return { 
              ...func, basePagamento, totalVales, valesDinheiro, valesConsumo, descontoFaltas, totalProventosExtras, totalDescontosExtras, aReceber 
          }; 
      }); 
  };

  const dadosFolha = calcularFolha();
  const totalGeralFolha = dadosFolha.reduce((acc, f) => acc + f.aReceber, 0);
  const totalValesDinheiroGeral = dadosFolha.reduce((acc, f) => acc + f.valesDinheiro, 0);
  const totalValesConsumoGeral = dadosFolha.reduce((acc, f) => acc + f.valesConsumo, 0);
  const totalFuncionarios = dadosFolha.length;

  const dadosFiltrados = useMemo(() => {
    return historico.filter(h => h.data.startsWith(filtroMes));
  }, [historico, filtroMes]);

const realizarLogin = async (perfil) => { 
    if (perfil === 'caixa') {
        // Se ainda não pediu o token, mostra o campo para digitar
        if (!pedirTokenCaixa) {
            setPedirTokenCaixa(true);
            return;
        }

        // Verifica no banco se a senha bate
        const { data, error } = await supabase
            .from('configuracoes')
            .select('senha_caixa')
            .eq('id', 1)
            .single();
        
        if (error || !data) {
             setErroLogin('Erro de conexão.');
             return;
        }

        if (inputTokenCaixa === data.senha_caixa) {
             setUsuarioAtual({ nome: 'Operador de Caixa', role: 'caixa' });
             setActiveTab('caixa');
             setErroLogin('');
        } else {
             setErroLogin('Senha do dia incorreta!');
        }
    } 
    else if (perfil === 'gerente') { 
        if (inputPin === '8161361') { 
            setUsuarioAtual({ nome: 'Gerente Adm.', role: 'gerente' }); 
            setActiveTab('auditoria'); 
            fetchSenhaAtual(); // Busca a senha para mostrar ao gerente
        } else { 
            setErroLogin('Senha Administrativa incorreta!'); 
        } 
    } 
  };
  if (!usuarioAtual) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-8 animate-fade-in">
            
            {/* LOGO E TÍTULO */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-600 p-4 rounded-full shadow-lg">
                <Pizza size={48} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pizzaria CashFlow 2.0</h1>
              <p className="text-gray-500">Sistema Online (Supabase)</p>
            </div>

            {/* GRID DE BOTÕES (CAIXA E GERENTE) */}
            <div className="grid grid-cols-2 gap-4 h-32"> {/* Altura fixa para não pular */}
              
              {/* --- LADO ESQUERDO: CAIXA (COM LÓGICA DE SENHA) --- */}
              <div className="relative w-full h-full">
                
                {/* 1. Botão Normal (Só aparece se NÃO estiver pedindo senha) */}
                <button 
                  onClick={() => realizarLogin('caixa')} 
                  className={`w-full h-full flex flex-col items-center justify-center p-2 border-2 border-gray-100 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group ${pedirTokenCaixa ? 'hidden' : 'flex'}`}
                >
                    <UserCheck size={32} className="text-gray-400 group-hover:text-red-500 mb-2"/>
                    <span className="font-bold text-gray-700 group-hover:text-red-700">Caixa</span>
                </button>

                {/* 2. Campo de Senha (Só aparece se ESTIVER pedindo senha) */}
                {pedirTokenCaixa && (
                  <div className="absolute inset-0 bg-red-50 rounded-xl border-2 border-red-200 p-2 flex flex-col justify-center animate-scale-in">
                      <p className="text-[10px] font-bold text-red-800 mb-1 uppercase">Senha do Dia</p>
                      <div className="flex gap-1 mb-1">
                        <input 
                          type="tel" 
                          maxLength={4}
                          className="w-full p-1 border text-center font-bold text-lg tracking-widest rounded focus:ring-2 focus:ring-red-500 outline-none bg-white"
                          value={inputTokenCaixa}
                          onChange={(e) => setInputTokenCaixa(e.target.value)}
                          placeholder="0000"
                          autoFocus
                        />
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <button onClick={() => {setPedirTokenCaixa(false); setErroLogin('');}} className="text-[10px] text-gray-500 underline hover:text-red-600">Cancelar</button>
                        <button onClick={() => realizarLogin('caixa')} className="bg-red-600 text-white text-xs px-3 py-1 rounded font-bold hover:bg-red-700 shadow">Entrar</button>
                      </div>
                  </div>
                )}
              </div>

              {/* --- LADO DIREITO: GERENTE --- */}
              <button 
                onClick={() => document.getElementById('input-gerente')?.focus()} 
                className="flex flex-col items-center justify-center p-2 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Shield size={32} className="text-gray-400 group-hover:text-blue-500 mb-2"/>
                <span className="font-bold text-gray-700 group-hover:text-blue-700">Gerente</span>
              </button>
            </div>

            {/* RODAPÉ (LOGIN GERENTE) */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-600 mb-2 flex items-center justify-center gap-1">
                <Lock size={14}/> Acesso Gerente
              </p>
              <div className="flex gap-2">
                <input 
                  id="input-gerente"
                  type="password" 
                  placeholder="Senha Administrativa" 
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest" 
                  value={inputPin} 
                  onChange={(e) => setInputPin(e.target.value)}
                />
                <button onClick={() => realizarLogin('gerente')} className="bg-blue-600 text-white px-4 rounded font-bold hover:bg-blue-700 shadow">
                  Entrar
                </button>
              </div>
              {erroLogin && (
                <div className="mt-3 bg-red-100 text-red-600 p-2 rounded text-xs font-bold border border-red-200 animate-pulse">
                  {erroLogin}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col relative">
      {modalAviso && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
            <h3 className={`text-xl font-bold mb-2 ${modalAviso.tipo === 'error' ? 'text-red-600' : 'text-gray-800'}`}>{modalAviso.titulo}</h3>
            <p className="text-gray-600 mb-6">{modalAviso.msg}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalAviso(null)} className={`px-4 py-2 rounded font-bold text-white ${modalAviso.tipo === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALHES DO HISTÓRICO --- */}
      {modalDetalhes && modalDetalhes.tipo === 'historico' && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6 border-b pb-4">Data: {modalDetalhes.dados.dataBanco.split('-').reverse().join('/')}
                <div><h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileSpreadsheet size={24} className="text-blue-600"/> Detalhes do Fechamento</h2><p className="text-sm text-gray-500"> | Resp: {modalDetalhes.dados.responsavelFechamento}</p></div>
                <button onClick={() => setModalDetalhes(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                </div>
                <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100"><p className="text-[10px] text-green-800 font-bold uppercase">Faturamento Total</p><p className="text-lg font-bold text-green-700">{BRL(modalDetalhes.dados.resumoFinanceiro?.faturamentoTotal)}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><p className="text-[10px] text-gray-600 font-bold uppercase">Dinheiro (Gaveta)</p><p className="text-lg font-bold text-gray-800">{BRL(modalDetalhes.dados.auditoria?.sistema?.dinheiro)}</p></div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100"><p className="text-[10px] text-blue-800 font-bold uppercase">Cartão</p><p className="text-lg font-bold text-blue-700">{BRL(modalDetalhes.dados.auditoria?.sistema?.cartao)}</p></div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100"><p className="text-[10px] text-red-800 font-bold uppercase">Saídas</p><p className="text-lg font-bold text-red-700">{BRL(modalDetalhes.dados.resumoFinanceiro?.totalSaidas)}</p></div>
                </div>
                {/* SEÇÃO DETALHADA DE RECEBIMENTOS */}
<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
  <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase border-b pb-2">
    <CreditCard size={16} className="text-blue-600"/> Detalhamento de Recebidos
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Coluna das Maquinetas */}
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Maquinetas Físicas</p>
      
      {modalDetalhes.dados.auditoria?.sistema?.maquinetasDetalhadas ? (
        Object.entries(modalDetalhes.dados.auditoria.sistema.maquinetasDetalhadas).map(([marca, valor]) => (
          <div key={marca} className="flex justify-between items-center py-1 border-b border-gray-50">
            <span className="text-sm text-gray-600">{marca}:</span>
            <span className="text-sm font-bold text-gray-800">{BRL(valor || 0)}</span>
          </div>
        ))
      ) : (
        <>
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <span className="text-sm text-gray-600">Ton:</span>
            <span className="text-sm font-bold text-gray-800">{BRL(modalDetalhes.dados.auditoria?.sistema?.ton || 0)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <span className="text-sm text-gray-600">Cielo:</span>
            <span className="text-sm font-bold text-gray-800">{BRL(modalDetalhes.dados.auditoria?.sistema?.cielo || 0)}</span>
          </div>
        </>
      )}

      <div className="flex justify-between items-center py-2 bg-blue-50 px-2 rounded mt-1">
        <span className="text-xs font-bold text-blue-800 uppercase">Total Cartão:</span>
        <span className="text-sm font-black text-blue-900">{BRL(modalDetalhes.dados.auditoria?.sistema?.cartao || 0)}</span>
      </div>
    </div>

    {/* Coluna dos Aplicativos */}
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendas Online / Apps</p>
      <div className="flex justify-between items-center py-1 border-b border-gray-50">
        <span className="text-sm text-gray-600">Tuna / App:</span>
        <span className="text-sm font-bold text-gray-800">{BRL(modalDetalhes.dados.auditoria?.sistema?.tuna || 0)}</span>
      </div>
      <div className="flex justify-between items-center py-1 border-b border-gray-50">
        <span className="text-sm text-gray-600">iFood:</span>
        <span className="text-sm font-bold text-gray-800">{BRL(modalDetalhes.dados.auditoria?.sistema?.ifood || 0)}</span>
      </div>
      <div className="flex justify-between items-center py-2 bg-orange-50 px-2 rounded mt-1">
        <span className="text-xs font-bold text-orange-800 uppercase">Total Apps:</span>
        <span className="text-sm font-black text-orange-900">
          {BRL((modalDetalhes.dados.auditoria?.sistema?.tuna || 0) + (modalDetalhes.dados.auditoria?.sistema?.ifood || 0))}
        </span>
      </div>
    </div>
  </div>
</div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase"><Scale size={16}/> Conferência de Caixa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-xs font-bold text-gray-500 mb-1">Contagem Física</p><div className="bg-white p-2 rounded border text-sm space-y-1"><div className="flex justify-between"><span>Dinheiro:</span> <strong>{BRL(modalDetalhes.dados.auditoria?.fisico?.dinheiro)}</strong></div><div className="flex justify-between"><span>Cartão (Maq):</span> <strong>{BRL(modalDetalhes.dados.auditoria?.fisico?.totalGeral - modalDetalhes.dados.auditoria?.fisico?.dinheiro - modalDetalhes.dados.auditoria?.fisico?.tuna - modalDetalhes.dados.auditoria?.fisico?.ifood)}</strong></div></div></div>
                    <div><p className="text-xs font-bold text-gray-500 mb-1">Diferenças (Sobra/Falta)</p><div className="bg-white p-2 rounded border text-sm space-y-1"><div className="flex justify-between"><span>Geral:</span> <strong className={modalDetalhes.dados.auditoria?.diferencas?.total < 0 ? 'text-red-600' : 'text-green-600'}>{BRL(modalDetalhes.dados.auditoria?.diferencas?.total)}</strong></div><div className="flex justify-between text-xs text-gray-400"><span>Dinheiro:</span> <span>{BRL(modalDetalhes.dados.auditoria?.diferencas?.detalhes?.dinheiro)}</span></div></div></div>
                    </div>
                    {modalDetalhes.dados.auditoria?.obs && (<div className="mt-3 pt-3 border-t border-gray-200"><p className="text-xs font-bold text-gray-500">Observações:</p><p className="text-sm text-gray-700 italic">"{modalDetalhes.dados.auditoria.obs}"</p></div>)}
                </div>
                <div className="flex justify-end pt-2"><button onClick={() => setModalDetalhes(null)} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-900 transition-colors">Fechar Relatório</button></div>
                </div>
            </div>
            </div>
        </div>
      )}
      
      {mostrarModalTexto && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><FileText size={20} className="text-blue-600"/> Resumo do Dia</h3>
            <textarea className="w-full h-64 p-3 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={textoResumo} readOnly />
            <div className="flex justify-end gap-2 mt-4"><button onClick={() => setMostrarModalTexto(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold text-sm">Fechar</button><button onClick={copiarTextoDoModal} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold text-sm flex items-center gap-2"><Copy size={16}/> Copiar</button></div>
          </div>
        </div>
      )}

      {modalResumoAuditoria && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden border-t-8 border-green-600">
            <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4"><Lock size={32}/></div>
                <h2 className="text-2xl font-bold text-gray-800">Confirmar Fechamento?</h2>
                <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-2 border">
                    <div className="flex justify-between"><span>Diferença Geral:</span> <span className={`font-bold ${difGeral < 0 ? 'text-red-600' : 'text-green-600'}`}>{BRL(difGeral)}</span></div>
                </div>
                <button onClick={gerarTextoResumo} className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-600 flex items-center justify-center gap-2 transition-all"><FileText size={20}/> Visualizar Resumo (Texto)</button>
                <div className="flex gap-3 pt-4 border-t"><button onClick={() => setModalResumoAuditoria(false)} className="flex-1 py-3 text-gray-600 font-bold border rounded-lg hover:bg-gray-100">Voltar</button><button onClick={confirmarFechamentoFinal} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg">CONFIRMAR E ZERAR</button></div>
            </div>
          </div>
        </div>
      )}

      <header className={`text-white p-4 shadow-lg sticky top-0 z-10 print:hidden ${usuarioAtual.role === 'gerente' ? 'bg-slate-900' : 'bg-red-800'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${usuarioAtual.role === 'gerente' ? 'bg-blue-600' : 'bg-red-700'}`}>{usuarioAtual.role === 'gerente' ? <Shield size={20}/> : <UserCheck size={20}/>}</div><div><h1 className="text-lg font-bold flex items-center gap-2">Pizzaria CashFlow <span className="text-[10px] bg-white/20 px-2 rounded">ONLINE</span><span className="text-xs font-normal opacity-70 ml-2 border-l pl-2">{usuarioAtual.nome}</span></h1></div></div>
          <div className="flex bg-black/20 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
            <button onClick={() => setActiveTab('caixa')} className={`px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'caixa' ? 'bg-white text-gray-800 shadow' : 'text-gray-200 hover:text-white'}`}>Fluxo de Caixa</button>
            <button onClick={() => setActiveTab('entregas')} className={`px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'entregas' ? 'bg-white text-gray-800 shadow' : 'text-gray-200 hover:text-white'}`}>
              <Bike size={14}/> Entregas
            </button>
            <button onClick={() => setActiveTab('auditoria')} className={`px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'auditoria' ? 'bg-white text-gray-800 shadow' : 'text-gray-200 hover:text-white'}`}><Scale size={14}/> Auditoria</button>
            {usuarioAtual.role === 'gerente' && (
              <>
                <button onClick={() => setActiveTab('funcionarios')} className={`px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'funcionarios' ? 'bg-white text-gray-800 shadow' : 'text-gray-200 hover:text-white'}`}><Users size={14}/> RH & Folha</button>
                <button onClick={() => setActiveTab('historico')} className={`px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'historico' ? 'bg-white text-gray-800 shadow' : 'text-gray-200 hover:text-white'}`}><History size={14}/> Histórico</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm"><Calendar size={16} /><input type="date" value={dataMovimento} onChange={(e) => setDataMovimento(e.target.value)} className="bg-transparent border-none text-white font-bold focus:ring-0 cursor-pointer p-0 text-sm w-28"/></div>
             <button onClick={() => {setUsuarioAtual(null); setInputPin('');}} className="bg-white/10 hover:bg-red-600 p-2 rounded-lg transition-colors" title="Sair"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto print:p-0">
        <div className="max-w-6xl mx-auto space-y-6">
          {activeTab === 'auditoria' && (
            <div className="space-y-6 animate-fade-in pb-20">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-600 flex justify-between items-center">
                 <div><h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Shield size={24} className="text-indigo-600"/> Auditoria Diária</h2><p className="text-sm text-gray-500">Fechamento e conferência de valores.</p></div>
                 <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100"><label className="block text-xs font-bold text-indigo-800 uppercase mb-1">Fundo de Troco</label><div className="flex items-center gap-1"><span className="text-indigo-600 font-bold">R$</span><input type="number" className="bg-transparent font-bold text-xl text-indigo-900 w-24 outline-none border-b border-indigo-300 focus:border-indigo-600" placeholder="0.00" value={saldoAnterior} onChange={(e) => setSaldoAnterior(e.target.value)} /></div></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm h-full">
                       <h3 className="text-blue-900 font-bold flex items-center gap-2 mb-6 text-sm uppercase tracking-wide border-b border-blue-200 pb-2"><Monitor size={18}/> 1. Previsto (Sistema)</h3>
                       <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100"><div><span className="block text-xs font-bold text-gray-500 uppercase">Dinheiro (C/ Troco)</span></div><span className="text-lg font-bold text-blue-700">{BRL(saldoFinalCaixaTeorico)}</span></div>
                           <span className="block text-xs font-bold text-gray-500 uppercase">Cartão (Total)</span><div className="p-3 bg-white rounded-lg border border-blue-100">
  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
    <span className="block text-xs font-bold text-gray-500 uppercase">Cartão (Total)</span>
    <span className="text-lg font-bold text-blue-700">{BRL(totalEntradasCartao)}</span>
  </div>
  {marcasMaquinetas.map(marca => (
    <div key={marca} className="flex justify-between items-center text-xs text-gray-500 pl-2">
      <span>{marca}:</span>
      <span className="font-bold text-blue-600">{BRL(totaisMaquinetasSistema[marca] || 0)}</span>
    </div>
  ))}
</div>
                           <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100"><div><span className="block text-xs font-bold text-gray-500 uppercase">Tuna / App</span></div><span className="text-lg font-bold text-blue-700">{BRL(totalEntradasTuna)}</span></div>
                           <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100"><div><span className="block text-xs font-bold text-gray-500 uppercase">iFood (App)</span></div><span className="text-lg font-bold text-blue-700">{BRL(totalEntradasIfood)}</span></div>
                       </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border-l-4 border-purple-500 shadow-sm h-full">
                       <h3 className="text-purple-900 font-bold flex items-center gap-2 mb-6 text-sm uppercase tracking-wide border-b border-gray-100 pb-2"><Edit2 size={18}/> 2. Contagem Física</h3>
                       <div className="mb-6">
                           <label className="block text-xs font-bold text-gray-600 mb-2 uppercase flex items-center justify-between"><span className="flex items-center gap-1"><DollarSign size={14}/> Dinheiro (Gaveta)</span></label>
                           <input type="number" step="0.01" className="w-full p-3 border-2 rounded-lg text-xl font-bold focus:border-purple-500 outline-none bg-white text-gray-700 border-purple-100" placeholder="0,00" value={conferenciaFisica.dinheiroCaixa} onChange={(e) => setConferenciaFisica({...conferenciaFisica, dinheiroCaixa: e.target.value})} />
                       </div>
                       <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                           <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1"><CreditCard size={14}/> Maquinetas</label></div>
                           <div className="space-y-2">
                               {marcasMaquinetas.map((marca) => (
                                   <div key={marca} className="flex justify-between items-center"><span className="text-sm font-medium text-gray-700 w-1/3">{marca}</span><input type="number" step="0.01" className="w-2/3 p-2 border rounded text-right text-sm font-bold text-gray-800 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="0,00" value={conferenciaFisica.valoresMaquinetas[marca] || ''} onChange={(e) => setConferenciaFisica({...conferenciaFisica, valoresMaquinetas: { ...conferenciaFisica.valoresMaquinetas, [marca]: e.target.value }})}/></div>
                               ))}
                           </div>
                           <div className="mt-2 text-right text-xs font-bold text-purple-700 border-t pt-1">Total Maquinetas: {BRL(totalFisicoCartao)}</div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Tuna (App)</label><input type="number" step="0.01" className="w-full p-2 border rounded font-bold text-sm text-gray-700 outline-none focus:ring-1 focus:ring-purple-500" placeholder="0,00" value={conferenciaFisica.tunaConferido} onChange={(e) => setConferenciaFisica({...conferenciaFisica, tunaConferido: e.target.value})} /></div>
                           <div className="col-span-1 bg-red-50 p-2 rounded border border-red-200"><label className="block text-xs font-bold text-red-700 mb-1 uppercase">iFood (Portal)</label><input type="number" step="0.01" className="w-full p-2 border rounded font-bold text-sm text-gray-700 outline-none focus:ring-1 focus:ring-red-500" placeholder="0,00" value={conferenciaFisica.ifoodConferido} onChange={(e) => setConferenciaFisica({...conferenciaFisica, ifoodConferido: e.target.value})} /></div>
                       </div>
                    </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-800 text-white rounded-xl shadow-lg p-5 h-full flex flex-col">
                    <h3 className="font-bold flex items-center gap-2 mb-6 text-sm uppercase tracking-wide border-b border-gray-700 pb-2"><ArrowRightLeft size={18}/> 3. Diferenças</h3>
                    <div className="space-y-4 flex-1">
                      {[
                        { label: 'Dinheiro', val: difDinheiro }, 
                        { label: 'Cartões', val: difCartao }, 
                        ...marcasMaquinetas.map(marca => ({ label: marca, val: diferencasMaquinetas[marca] || 0 })),
                        { label: 'Tuna', val: difTuna }, 
                        { label: 'iFood', val: difIfood }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-gray-700/50 p-2 px-3 rounded-lg flex justify-between items-center"><span className="text-sm text-gray-300">{item.label}</span><div className="flex items-center gap-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getStatusDiferenca(item.val).bg.replace('bg-', 'bg-opacity-20 bg-')} ${getStatusDiferenca(item.val).cor.replace('text-', 'text-')}`}>{getStatusDiferenca(item.val).msg}</span><span className={`font-mono font-bold ${item.val < 0 ? 'text-red-400' : item.val > 0 ? 'text-blue-400' : 'text-green-400'}`}>{BRL(item.val)}</span></div></div>
                      ))}
                      <div className="bg-black/40 p-4 rounded-xl border border-gray-600 mt-4"><div className="flex justify-between items-center mb-1"><span className="text-gray-400 text-xs uppercase font-bold">Diferença Final</span><span className={`text-2xl font-bold ${difGeral < -2 ? 'text-red-500' : difGeral > 2 ? 'text-blue-400' : 'text-green-500'}`}>{BRL(difGeral)}</span></div></div>
                    </div>
                    <div className="mt-6 space-y-3"><textarea className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-500" rows="3" placeholder="Observações do fechamento..." value={obsAuditoria} onChange={(e) => setObsAuditoria(e.target.value)}></textarea><button onClick={iniciarSalvarDia} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/50 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-2"><CheckCircle size={20}/> FECHAR DIA & ARQUIVAR</button></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TELA DE ENTREGAS (MOTOBOYS) --- */}
          {activeTab === 'entregas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-20">
              
              {/* COLUNA ESQUERDA: FORMULÁRIO DE DESPACHO */}
              <div className="lg:col-span-1">
                <form onSubmit={despacharEntrega} className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-orange-500 sticky top-24">
                  <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Bike size={18} className="text-orange-500"/> Despachar Pedido
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Motoboy</label>
                      <select value={formEntrega.motoboyId} onChange={(e) => setFormEntrega({...formEntrega, motoboyId: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm" required>
                        <option value="">-- Selecione --</option>
                        {funcionarios.filter(f => f.equipe === 'Motoboy').map(f => (
                          <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Nº Pedido</label>
                        <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none font-bold text-center text-gray-700" placeholder="Ex: 15" value={formEntrega.pedidoNumero} onChange={(e) => setFormEntrega({...formEntrega, pedidoNumero: e.target.value})} required/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Valor (R$)</label>
                        <input type="number" step="0.01" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none font-bold text-center text-gray-700" placeholder="0,00" value={formEntrega.valorPedido} onChange={(e) => setFormEntrega({...formEntrega, valorPedido: e.target.value})} required/>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Como vai pagar?</label>
                      <select value={formEntrega.formaPagamento} onChange={(e) => setFormEntrega({...formEntrega, formaPagamento: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão">Cartão (Maquineta)</option>
                      </select>
                    </div>

                    {/* MOSTRA O CAMPO DE TROCO SÓ SE FOR DINHEIRO */}
                    {formEntrega.formaPagamento === 'Dinheiro' && (
                      <div className="bg-orange-50 p-3 rounded border border-orange-200 animate-fade-in">
                        <label className="block text-xs font-bold text-orange-800 mb-1">Levou Troco do Caixa? (R$)</label>
                        <input type="number" step="0.01" className="w-full p-2 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 outline-none font-bold text-center text-orange-900 bg-white" placeholder="0,00" value={formEntrega.trocoEnviado} onChange={(e) => setFormEntrega({...formEntrega, trocoEnviado: e.target.value})} />
                        <p className="text-[9px] text-orange-600 mt-1 mt-1 leading-tight">Deixe em branco se for valor trocado.</p>
                      </div>
                    )}

                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">DESPACHAR COM MOTOBOY</button>
                  </div>
                </form>
              </div>

              {/* COLUNA DIREITA: CARTÕES DOS MOTOBOYS NA RUA */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(entregasAgrupadas).length === 0 ? (
                    <div className="col-span-full bg-white p-10 rounded-xl shadow-sm border border-dashed border-gray-300 text-center text-gray-400">
                      <Bike size={40} className="mx-auto mb-3 opacity-50"/>
                      <p>Nenhum motoboy na rua com pedido não pago no momento.</p>
                    </div>
                  ) : (
                    Object.entries(entregasAgrupadas).map(([motoboyId, dados]) => (
                      <div key={motoboyId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                        <div className="bg-gray-800 p-3 text-white flex justify-between items-center">
                          <h3 className="font-bold flex items-center gap-2"><User size={16}/> {dados.nome}</h3>
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">{dados.entregas.length} Pedidos</span>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          {/* Lista de Pedidos */}
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {dados.entregas.map(ent => (
                              <div key={ent.id} className="text-sm bg-gray-50 border border-gray-100 p-2 rounded flex justify-between items-center">
                                <div>
                                  <span className="font-bold text-gray-700">Ped. {ent.pedido_numero}</span>
                                  <span className="text-[10px] bg-gray-200 px-1 ml-2 rounded text-gray-600">{ent.forma_pagamento}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-gray-800 block">{BRL(ent.valor_pedido)}</span>
                                  {ent.troco_enviado > 0 && <span className="text-[10px] text-orange-600 font-bold block">Troco: {BRL(ent.troco_enviado)}</span>}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Resumo do Acerto */}
                          <div className="pt-3 border-t border-gray-200 space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">O que ele tem que trazer:</p>
                            {dados.totalCartao > 0 && (
                              <div className="flex justify-between text-sm text-blue-700 font-bold bg-blue-50 p-1.5 rounded">
                                <span className="flex items-center gap-1"><CreditCard size={14}/> Maquinetas:</span> <span>{BRL(dados.totalCartao)}</span>
                              </div>
                            )}
                            {(dados.totalDinheiro > 0 || dados.totalTroco > 0) && (
                              <div className="flex justify-between text-sm text-green-800 font-bold bg-green-50 p-2 rounded border border-green-200">
                                <span className="flex items-center gap-1"><DollarSign size={16}/> Dinheiro Físico:</span> 
                                <span className="text-lg">{BRL(dados.totalDinheiro + dados.totalTroco)}</span>
                              </div>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => finalizarAcertoMotoboy(motoboyId, dados.nome, dados.entregas)} 
                            className="w-full mt-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 rounded transition-colors text-sm"
                          >
                            FAZER ACERTO FINAL
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'caixa' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-green-600"><h3 className="text-gray-500 text-[10px] font-bold uppercase flex items-center gap-1"><DollarSign size={12}/> Entradas</h3><div className="mt-1 text-2xl font-bold text-gray-800">{BRL(faturamentoTotalApp)}</div></div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-gray-800"><h3 className="text-gray-500 text-[10px] font-bold uppercase flex items-center gap-1"><Wallet size={12}/> Dinheiro Líquido (Recolher)</h3><div className={`mt-1 text-2xl font-bold ${dinheiroLiquidoDoDia >= 0 ? 'text-gray-900' : 'text-red-600'}`}>{BRL(dinheiroLiquidoDoDia)}</div></div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-red-500"><h3 className="text-gray-500 text-[10px] font-bold uppercase">Saídas</h3><div className="mt-1 text-2xl font-bold text-red-600">{BRL(totalSaidas)}</div></div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-indigo-400"><h3 className="text-gray-500 text-[10px] font-bold uppercase">Troco Inicial</h3><div className="mt-1 text-xl font-bold text-indigo-900">{BRL(saldoInicial)}</div></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
                <div className="lg:col-span-1">
                  <form onSubmit={adicionarTransacao} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                    <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><PlusCircle size={16}/> Novo Lançamento</h2>
                    <div className="space-y-4">
                      <div><label className="block text-xs font-bold text-gray-600 mb-1">Categoria</label><select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none text-sm"><optgroup label="Entradas (Vendas)">{configCategorias.entrada.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup><optgroup label="Saídas (Despesas)">{configCategorias.saida.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup><optgroup label="Neutro / Outros">{configCategorias.neutro.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup></select></div>
                      {categoria === 'venda_cartao' && (<div className="bg-indigo-50 p-3 rounded border border-indigo-200 animate-fade-in"><label className="block text-xs font-bold text-indigo-800 mb-1 flex items-center gap-1"><CreditCard size={12}/> Selecione a Maquineta</label><select value={maquinetaSelecionada} onChange={(e) => setMaquinetaSelecionada(e.target.value)} className="w-full p-2 border border-indigo-300 rounded bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-gray-700" required><option value="">-- Selecione --</option>{marcasMaquinetas.map(m => <option key={m} value={m}>{m}</option>)}</select></div>)}
                      {(categoria.includes('vale') || categoria === 'vale_produto' || categoria === 'diaria_motoboy') && (
  <div className="bg-yellow-50 p-3 rounded border border-yellow-200 animate-fade-in">
    <label className="block text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">
      <User size={12}/> {categoria === 'diaria_motoboy' ? 'Selecione o Motoboy' : 'Funcionário'}
    </label>
    <select 
      value={funcionarioSelecionado} 
      onChange={(e) => setFuncionarioSelecionado(e.target.value)} 
      className="w-full p-2 border border-yellow-300 rounded bg-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm" 
      required
    >
      <option value="">-- Selecione --</option>
      {funcionarios
        .filter(f => categoria === 'diaria_motoboy' ? f.equipe === 'Motoboy' : true)
        .map(f => <option key={f.id} value={f.id}>{f.nome}</option>)
      }
    </select>
  </div>
)}
{/* SE NÃO FOR MOTOBOY, MOSTRA OS CAMPOS NORMAIS */}
  {categoria !== 'diaria_motoboy' && (
    <>
      <div><label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label><input type="text" placeholder="Opcional" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" value={descricao} onChange={(e) => setDescricao(e.target.value)}/></div>
      <div><label className="block text-xs font-medium text-gray-500 mb-1">Valor (R$)</label><input type="number" step="0.01" placeholder="0,00" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" value={valor} onChange={(e) => setValor(e.target.value)}/></div>
    </>
  )}

  {/* --- PAINEL EXCLUSIVO MOTOBOY (ESTILO DA SUA IMAGEM) --- */}
  {categoria === 'diaria_motoboy' && (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2 space-y-3 animate-fade-in">
       <div className="flex items-center gap-2 text-orange-800 font-bold text-xs uppercase border-b border-orange-200 pb-1 mb-2">
          <Bike size={14} /> Dados da Corrida
       </div>

       <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Entregas (Qtd)</label>
            <input type="number" className="w-full p-2 border border-orange-300 rounded text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-500" placeholder="0" value={motoQtd} onChange={(e) => setMotoQtd(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Valor Entregas (R$)</label>
            <input type="number" step="0.01" className="w-full p-2 border border-orange-300 rounded text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-500" placeholder="0,00" value={motoValorEntregas} onChange={(e) => setMotoValorEntregas(e.target.value)} />
          </div>
       </div>

       {/* CONFIGURAÇÃO DA META (AJUSTÁVEL NA HORA) */}
       <div className="grid grid-cols-2 gap-3 pt-2 border-t border-orange-200/50">
          <div>
             <label className="block text-[9px] font-bold text-gray-400 uppercase">🎯 Meta (Qtd)</label>
             <input type="number" className="w-full bg-white/50 p-1 border border-gray-200 rounded text-xs text-center text-gray-500" value={motoMeta} onChange={(e) => setMotoMeta(e.target.value)} />
          </div>
          <div>
             <label className="block text-[9px] font-bold text-gray-400 uppercase">💰 Valor Ajuda</label>
             <input type="number" step="0.01" className="w-full bg-white/50 p-1 border border-gray-200 rounded text-xs text-center text-gray-500" value={motoValorAjuda} onChange={(e) => setMotoValorAjuda(e.target.value)} />
          </div>
       </div>

       {/* TOTALIZADOR VISUAL */}
       <div className="bg-white border border-orange-200 rounded p-2 flex justify-between items-center shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">Total a Pagar:</span>
          <div className="text-right">
            <span className="block text-xl font-bold text-orange-600">{BRL(parseFloat(valor) || 0)}</span>
            {parseInt(motoQtd) >= parseInt(motoMeta) && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded flex items-center justify-end gap-1">✅ Ajuda Inclusa</span>}
          </div>
       </div>
    </div>
  )}
                      {/* --- COLE ESTE CÓDIGO NOVO AQUI: --- */}
  {getTipoCategoria(categoria) === 'saida' && (
    <div className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-100 mt-2">
      <input 
        type="checkbox" 
        id="checkPix"
        className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
        checked={saidaViaPix}
        onChange={(e) => setSaidaViaPix(e.target.checked)}
      />
      <label htmlFor="checkPix" className="text-xs font-bold text-red-700 cursor-pointer select-none">
        Pago via PIX (Gerente)
      </label>
    </div>
  )}
  {/* --- FIM DO CÓDIGO NOVO --- */}
                      <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 text-sm uppercase tracking-wider"><Save size={16}/> Lançar</button>
                    </div>
                  </form>
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
  <h2 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase">
    <FileText size={16}/> Extrato do Dia
  </h2>
  
  <div className="flex items-center gap-2">
    {/* Contador de Itens */}
    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 font-bold">
      {transacoes.length} ITENS
    </span>

    {/* BOTÃO DE LIMPEZA TOTAL (Só aparece se tiver itens e for GERENTE) */}
    {transacoes.length > 0 && usuarioAtual.role === 'gerente' && (
      <button 
        onClick={limparMovimentoDoDia}
        className="text-[10px] bg-red-100 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white px-3 py-1 rounded font-bold transition-all flex items-center gap-1"
        title="Apagar tudo deste dia"
      >
        <Trash2 size={12} /> LIMPAR TUDO
      </button>
    )}
  </div>
</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100"><tr><th className="px-4 py-3">Hora</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Descrição</th><th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-center"></th></tr></thead>
                        <tbody>
                          {transacoes.length === 0 ? (<tr><td colSpan="5" className="px-4 py-20 text-center text-gray-400">Caixa limpo. Aguardando lançamentos...</td></tr>) : (
                            transacoes.map((t) => (
                              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{t.hora}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${t.tipo === 'entrada' ? 'bg-green-100 text-green-700' : t.tipo === 'saida' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{t.tipo === 'entrada' ? 'Entrada' : t.tipo === 'saida' ? 'Saída' : 'Neutro'}</span></td>
                                <td className="px-4 py-3 font-medium text-gray-700"><div>{t.descricao}</div><div className="flex gap-2"><span className="text-[10px] text-gray-400">{configCategorias.entrada.concat(configCategorias.saida).concat(configCategorias.neutro).find(c=>c.id===t.categoria)?.label || t.categoria}</span>{t.maquineta && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded font-bold border border-indigo-100">{t.maquineta}</span>}</div></td>
                                <td className={`px-4 py-3 text-right font-bold ${t.tipo === 'entrada' ? 'text-green-600' : t.tipo === 'saida' ? 'text-red-600' : 'text-gray-500'}`}>{t.tipo === 'saida' ? '-' : ''} {BRL(t.valor)}</td>
                                <td className="px-4 py-3 text-center"><button onClick={() => removerTransacao(t.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button></td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'historico' && usuarioAtual.role === 'gerente' && (
             <div className="space-y-6 animate-fade-in pb-20">
               <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap justify-between items-center gap-4 sticky top-0 z-0">
                  <div className="flex items-center gap-4 flex-1"><div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"><Filter size={16} className="text-gray-500"/><input type="month" className="bg-transparent border-none text-sm font-bold text-gray-700 outline-none" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} /></div></div>
               </div>
               <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                   <div className="p-4 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-700 flex items-center gap-2"><ListChecks size={18}/> Fechamentos Anteriores</h3><span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">{dadosFiltrados.length} Registros</span></div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                           <thead className="bg-gray-100 text-xs text-gray-600 uppercase"><tr><th className="p-4">Data</th><th className="p-4 text-right">Faturamento</th><th className="p-4 text-right">Saídas</th><th className="p-4 text-center">Resp.</th><th className="p-4 text-center">Diferença Audit.</th><th className="p-4 text-center">Ações</th></tr></thead>
                           <tbody className="divide-y divide-gray-100">
                               {dadosFiltrados.map((d) => {
                                   const difAuditoria = d.auditoria?.diferencas?.total || 0;
                                   return (
                                       <tr key={d.id} className="hover:bg-blue-50 transition-colors">
                                           <td className="p-4"><div className="font-bold text-gray-800">{d.data.split('-').reverse().join('/')}</div></td>
                                           <td className="p-4 text-right font-medium">{BRL(d.resumoFinanceiro?.faturamentoTotal)}</td>
                                           <td className="p-4 text-right text-red-500">{BRL(d.resumoFinanceiro?.totalSaidas)}</td>
                                           <td className="p-4 text-center text-xs text-gray-500">{d.responsavelFechamento}</td>
                                           <td className="p-4 text-center">{Math.abs(difAuditoria) < 1 ? (<span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full"><CheckCircle size={12}/> Ok</span>) : (<span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full"><AlertTriangle size={12}/> {BRL(difAuditoria)}</span>)}</td>
                                           <td className="p-4 text-center flex justify-center gap-2">
                                              {/* Botão Azul de Ver */}
                                              <button onClick={() => setModalDetalhes({ tipo: 'historico', dados: d })} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Ver Detalhes"><FileText size={18}/></button>
                                              {/* Botão Vermelho de Deletar */}
                                              <button onClick={() => deletarDoHistorico(d.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"><Trash2 size={18}/></button>
                                           </td>
                                       </tr>
                                   );
                               })}
                           </tbody>
                       </table>
                   </div>
               </div>
             </div>
          )}

          {activeTab === 'funcionarios' && usuarioAtual.role === 'gerente' && (
             <div className="space-y-8 animate-fade-in pb-20">
              {/* --- NOVO BLOCO: BARRA DE INFORMAÇÃO DO CICLO --- */}
    {(() => {
      const periodo = getPeriodoAtual(dataMovimento);
      return (
        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-bold uppercase">Ciclo de Pagamento Atual</p>
              <h2 className="text-xl font-bold">
                {periodo.inicio} até {periodo.fim}
              </h2>
            </div>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-lg text-right">
            <p className="text-xs text-blue-100">Data de Referência</p>
            <p className="font-mono font-bold">{new Date(dataMovimento + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      );
    })()}

               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total da Folha</h3><div className="text-2xl font-bold text-indigo-700 mt-1">{BRL(totalGeralFolha)}</div></div>
                 <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Colaboradores</h3><div className="text-2xl font-bold text-gray-800 mt-1">{totalFuncionarios}</div></div>
                 <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total de Descontos</h3><div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-1 mb-1"><span className="text-xs text-gray-400 font-bold">Vales:</span><span className="text-sm font-bold text-orange-600">{BRL(totalValesDinheiroGeral)}</span></div><div className="flex justify-between items-center"><span className="text-xs text-gray-400 font-bold">Consumo:</span><span className="text-sm font-bold text-orange-600">{BRL(totalValesConsumoGeral)}</span></div></div>
               </div>
               <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap justify-between items-center gap-4">
  <div className="flex items-center gap-3">
    <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${percentualPagamento === 60 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`} onClick={() => setPercentualPagamento(prev => prev === 60 ? 40 : 60)}>
      {percentualPagamento === 60 ? 'Dia 05 (60% + Extras)' : 'Dia 20 (40% Adiantamento)'} <Percent size={14}/>
    </span>
  </div>

  <div className="flex flex-1 md:flex-initial items-center gap-3">
    {/* BARRA DE PESQUISA ADICIONADA AQUI */}
    <div className="relative flex-1 md:w-64">
      <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input 
        type="text"
        placeholder="Buscar por nome ou função..."
        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        value={filtroRH}
        onChange={(e) => setFiltroRH(e.target.value)}
      />
      {filtroRH && (
        <button onClick={() => setFiltroRH('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500">
          <X size={14} />
        </button>
      )}
    </div>

    <button onClick={() => { setFormFuncionario({ id: null, nome: '', salario: '', equipe: 'Cozinha', funcao: 'Auxiliar', dependentes: 0, beneficiosAtivos: [] }); setModoEdicaoFunc(false); setMostrarFormFuncionario(!mostrarFormFuncionario); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm text-sm transition-colors whitespace-nowrap">
      {mostrarFormFuncionario ? 'Cancelar' : 'Novo Colaborador'} {mostrarFormFuncionario ? <X size={16}/> : <UserPlus size={16}/>}
    </button>
  </div>
</div>

               {mostrarFormFuncionario && (
                 <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-md animate-slide-down">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">{modoEdicaoFunc ? <Edit2 size={20} className="text-blue-600"/> : <UserPlus size={20} className="text-green-600"/>} {modoEdicaoFunc ? 'Editar Dados' : 'Cadastrar Novo'}</h3>
                    <form onSubmit={salvarFuncionario} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4"><h4 className="font-bold text-xs text-gray-400 uppercase flex items-center gap-1"><User size={12}/> Dados Pessoais</h4><div><label className="block text-xs font-bold text-gray-600 mb-1">Nome Completo</label><input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" value={formFuncionario.nome} onChange={(e) => setFormFuncionario({...formFuncionario, nome: e.target.value})} required /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-600 mb-1">Salário Base (R$)</label><input type="number" step="0.01" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" value={formFuncionario.salario} onChange={(e) => setFormFuncionario({...formFuncionario, salario: e.target.value})} required /></div><div><label className="block text-xs font-bold text-gray-600 mb-1">Dependentes (Filhos)</label><div className="flex items-center gap-2"><Baby size={18} className="text-gray-400"/><input type="number" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" value={formFuncionario.dependentes} onChange={(e) => setFormFuncionario({...formFuncionario, dependentes: e.target.value})} /></div></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-600 mb-1">Equipe</label><select className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none" value={formFuncionario.equipe} onChange={(e) => setFormFuncionario({...formFuncionario, equipe: e.target.value})}><option value="Cozinha">Cozinha</option><option value="Salão">Salão</option><option value="Diarista">Diarista</option><option value="Motoboy">Motoboy</option></select></div><div><label className="block text-xs font-bold text-gray-600 mb-1">Função/Cargo</label><input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none" value={formFuncionario.funcao} onChange={(e) => setFormFuncionario({...formFuncionario, funcao: e.target.value})} /></div></div></div>
                      <div className="space-y-4"><h4 className="font-bold text-xs text-gray-400 uppercase flex items-center gap-1"><Briefcase size={12}/> Direitos e Benefícios</h4><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">{tiposBeneficios.map(ben => (<label key={ben.id} className="flex items-start gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors"><input type="checkbox" className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500" checked={formFuncionario.beneficiosAtivos.includes(ben.id)} onChange={() => toggleBeneficioNoForm(ben.id)}/><div><p className="font-bold text-sm text-gray-800">{ben.nome}</p><p className="text-xs text-gray-500">{ben.descricao}</p></div></label>))}</div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setMostrarFormFuncionario(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold text-sm">Cancelar</button><button type="submit" className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-green-700 transition-colors">Salvar Cadastro</button></div></div>
                    </form>
                 </div>
               )}

               <div className="grid grid-cols-1 gap-8">
                 {['Cozinha', 'Salão', 'Diarista', 'Motoboy'].map(eq => { // Adicionei Motoboy na lista
   const lista = dadosFolha.filter(f => {
    if (f.equipe !== eq) return false;
    if (!filtroRH) return true;
    
    const busca = filtroRH.toLowerCase();
    return (
      f.nome.toLowerCase().includes(busca) || 
      f.funcao.toLowerCase().includes(busca)
    );
  });

  // Se a busca não encontrar ninguém nessa equipe, ela nem aparece na tela
  if (lista.length === 0 && filtroRH) return null;
   
   // Configuração dos ícones e cores
   let Icon = ChefHat;
   let ColorClass = 'text-orange-700 border-orange-200';
   
   if (eq === 'Salão') { Icon = Utensils; ColorClass = 'text-blue-700 border-blue-200'; }
   else if (eq === 'Diarista') { Icon = Briefcase; ColorClass = 'text-purple-700 border-purple-200'; }
   else if (eq === 'Motoboy') { Icon = Bike; ColorClass = 'text-red-700 border-red-200'; } // Lógica nova do Motoboy

   return (
                     <div key={eq}>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
  <h3 className={`font-bold text-lg flex items-center gap-2 ${ColorClass}`}>
    <Icon size={20} /> Equipe {eq}
  </h3>
  
  <button 
    type="button"
    onClick={() => selecionarTodosDaEquipe(lista)}
    className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all border ${
      lista.every(f => idsSelecionados.includes(f.id))
        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
        : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
    }`}
  >
    {lista.every(f => idsSelecionados.includes(f.id)) ? 'DESMARCAR EQUIPE' : 'SELECIONAR EQUIPE'}
  </button>
</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {/* LOCALIZAÇÃO: Aba RH & Folha -> Dentro do loop de Equipes */}
{lista.map((f, idx) => (
  <div key={f.id} className={`rounded-xl shadow-sm border transition-all relative overflow-hidden group ${idsSelecionados.includes(f.id) ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-white border-gray-200 hover:shadow-md'}`}>
    
    {/* 1. CHECKBOX (O Quadrado de seleção) */}
    <div className="absolute top-4 left-3 z-00">
      <input 
        type="checkbox" 
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        checked={idsSelecionados.includes(f.id)}
        onChange={() => toggleSelecao(f.id)}
      />
    </div>

    {/* 2. CABEÇALHO (Foto e Nome) - pl-10 dá o espaço para o Checkbox */}
    <div className={`p-4 pl-10 flex justify-between items-start ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
            <Avatar nome={f.nome} />
            <div>
                <h4 className="font-bold text-gray-800">{f.nome}</h4>
                <p className="text-xs text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded-full inline-block mt-0.5">{f.funcao}</p>
            </div>
        </div>
        <div className="flex gap-1">
          <button 
  onClick={() => setModalExtrato(f)} 
  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
  title="Ver Extrato Detalhado"
>
  <FileText size={16}/>
</button>
            <button onClick={() => prepararEdicao(f)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Editar"><Edit2 size={16}/></button>
        </div>
    </div>

    {/* 3. RODAPÉ (Salário e Bônus) */}
    <div className="p-4 space-y-3 border-t border-gray-100">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Base:</span><span className="font-medium text-gray-700">{BRL(f.salario)}</span></div>
        
        <div className="grid grid-cols-2 gap-2 py-2 bg-gray-50 rounded-lg p-2">
            <div><label className="text-[10px] font-bold text-green-700 uppercase flex items-center gap-1"><Award size={10}/> Bônus</label><input type="number" className="w-full bg-white border border-green-200 rounded px-1 text-right text-sm text-green-700 font-bold outline-none" value={f.bonificacao} onChange={(e) => atualizarFuncionario(f.id, 'bonificacao', e.target.value)} placeholder="0.00" /></div>
            <div><label className="text-[10px] font-bold text-red-700 uppercase flex items-center gap-1"><CalendarX size={10}/> Faltas</label><input type="number" className="w-full bg-white border border-red-200 rounded px-1 text-right text-sm text-red-700 font-bold outline-none" value={f.faltas} onChange={(e) => atualizarFuncionario(f.id, 'faltas', e.target.value)} placeholder="0" /></div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t mt-2">
            <div className="flex flex-col"><span className="text-xs text-gray-400 font-bold uppercase">Líquido</span><span className={`text-xl font-bold ${f.aReceber < 0 ? 'text-red-600' : 'text-gray-900'}`}>{BRL(f.aReceber)}</span></div>
            <button onClick={() => atualizarFuncionario(f.id, 'status', f.status === 'pago' ? 'pendente' : 'pago')} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${f.status === 'pago' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'}`}>{f.status === 'pago' ? 'PAGO' : 'PENDENTE'}</button>
        </div>
    </div>
  </div>
))}
                        </div>
                     </div>
                    );
                 })}
               </div>
             </div>
          )}
        </div>
      </div>
      {/* --- COLE AQUI: BARRA FLUTUANTE E MODAL --- */}
      {idsSelecionados.length > 0 && activeTab === 'funcionarios' && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-slide-up">
           <span className="font-bold text-sm">{idsSelecionados.length} selecionados</span>
           <div className="h-4 w-px bg-gray-600"></div>
           <button onClick={() => setModalEdicaoMassa(true)} className="flex items-center gap-2 hover:text-blue-300 font-bold text-sm transition-colors">
              <Edit2 size={16}/> Editar em Massa
           </button>
           <button onClick={() => setIdsSelecionados([])} className="ml-2 bg-gray-700 hover:bg-gray-600 rounded-full p-1"><X size={14}/></button>
        </div>
      )}

      {modalEdicaoMassa && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-600"/> Edição em Massa
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Você está alterando dados de <strong className="text-blue-600">{idsSelecionados.length} colaboradores</strong> ao mesmo tempo.
              </p>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">O que você quer alterar?</label>
                    <select value={campoMassa} onChange={(e) => setCampoMassa(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                       <option value="salario">Salário Base</option>
                       <option value="equipe">Equipe (Cozinha/Salão...)</option>
                       <option value="funcao">Função/Cargo</option>
                       <option value="bonificacao">Bônus Fixo</option>
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Novo Valor</label>
                    {campoMassa === 'equipe' ? (
                       <select value={valorMassa} onChange={(e) => setValorMassa(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">-- Selecione --</option>
                          <option value="Cozinha">Cozinha</option>
                          <option value="Salão">Salão</option>
                          <option value="Diarista">Diarista</option>
                          <option value="Motoboy">Motoboy</option>
                       </select>
                    ) : (
                       <input 
                         type={campoMassa === 'salario' || campoMassa === 'bonificacao' ? "number" : "text"} 
                         step="0.01"
                         className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                         placeholder="Digite o novo valor..."
                         value={valorMassa}
                         onChange={(e) => setValorMassa(e.target.value)}
                       />
                    )}
                 </div>

                 <button onClick={aplicarEdicaoMassa} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg mt-2 transition-all">
                    CONFIRMAR ALTERAÇÃO
                 </button>
                 <button onClick={() => setModalEdicaoMassa(false)} className="w-full text-gray-500 font-bold py-2 hover:bg-gray-100 rounded-lg text-sm">
                    Cancelar
                 </button>
              </div>
           </div>
        </div>
      )}
      {/* --- FIM DO BLOCO --- */}
      {/* --- COLE AQUI: MODAL DE EXTRATO INDIVIDUAL --- */}
{modalExtrato && (
  <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
      {/* Cabeçalho */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FileText size={20} className="text-blue-600"/> Extrato de Vales
          </h3>
          <p className="text-sm text-gray-500">Colaborador: <span className="font-bold text-gray-700">{modalExtrato.nome}</span></p>
        </div>
        <button onClick={() => setModalExtrato(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
      </div>

      {/* Corpo com a Tabela */}
      <div className="p-0 max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-xs text-gray-600 uppercase sticky top-0 shadow-sm">
            <tr>
              <th className="px-4 py-3">Data/Hora</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transacoesRH.filter(t => {
                if (!t.info_desconto || t.info_desconto.funcionarioId !== modalExtrato.id) return false;
                return calcularDataDesconto(t.data_movimento) === calcularDataDesconto(dataMovimento);
            }).length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">Nenhum vale encontrado neste período.</td></tr>
            ) : (
              transacoesRH.filter(t => {
                  if (!t.info_desconto || t.info_desconto.funcionarioId !== modalExtrato.id) return false;
                  return calcularDataDesconto(t.data_movimento) === calcularDataDesconto(dataMovimento);
              }).map(t => (
                <tr key={t.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">
                     <div className="font-bold">{t.data_movimento.split('-').reverse().join('/')}</div>
                     <div className="text-xs text-gray-400">{t.hora}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">{t.descricao || 'Sem descrição'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${t.categoria === 'vale_dinheiro' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {t.categoria === 'vale_dinheiro' ? 'Dinheiro' : 'Consumo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">-{BRL(t.valor)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé com Total e Botão Copiar */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center gap-4">
        
        {/* Esquerda: Período */}
        <div className="text-xs text-gray-500 hidden md:block">
           Período: <strong>{getPeriodoAtual(dataMovimento).inicio}</strong> até <strong>{getPeriodoAtual(dataMovimento).fim}</strong>
        </div>

        {/* --- NOVO BOTÃO AQUI --- */}
        <button 
          onClick={copiarExtratoIndividual}
          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Copy size={14}/> Copiar p/ WhatsApp
        </button>
        {/* ----------------------- */}

        {/* Direita: Valor Total */}
        <div className="text-right">
           <span className="block text-xs font-bold text-gray-500 uppercase">Total Descontado</span>
           <span className="text-xl font-bold text-red-600">
             {BRL(transacoesRH.filter(t => {
                if (!t.info_desconto || t.info_desconto.funcionarioId !== modalExtrato.id) return false;
                return calcularDataDesconto(t.data_movimento) === calcularDataDesconto(dataMovimento);
             }).reduce((acc, t) => acc + t.valor, 0))}
           </span>
        </div>
      </div>
    </div>
  </div>
)}
      {/* --- VISUALIZADOR DE SENHA (BOTÃO FLUTUANTE) --- */}
      {usuarioAtual && usuarioAtual.role === 'gerente' && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg shadow-xl z-50 flex items-center gap-3 border border-gray-700 animate-slide-up print:hidden">
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Senha do Caixa</p>
                <p className="text-xl font-mono font-bold text-green-400 tracking-widest">{tokenDoDia || '----'}</p>
            </div>
            <button 
                onClick={gerarNovaSenhaCaixa} 
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-white transition-colors" 
                title="Gerar Nova Senha"
            >
                <History size={20}/>
            </button>
        </div>
      )}
    </div>
  );
}

// testando 