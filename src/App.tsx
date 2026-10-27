import { useState, useEffect } from 'react';
import { 
  TrendingUp, CheckCircle2, Clock, Coins, Users, 
  Layers, MessageSquare, Plus, Trash2, Check, RefreshCw, 
  ChevronRight, Sliders, Info, BarChart2, 
  Activity, FileSpreadsheet, Edit3
} from 'lucide-react';
import { WeeklyTrendsChart } from './components/WeeklyTrendsChart';

// Interfaces for State Management
interface Task {
  id: string;
  action: string;
  indicator: string;
  responsible: string;
  deadline: string;
  resource: string;
  status: 'Pendente' | 'Em andamento' | 'Concluído';
  gutScore?: number;
}

interface GutItem {
  id: string;
  problem: string;
  g: number; // Gravidade (1-5)
  u: number; // Urgência (1-5)
  t: number; // Tendência (1-5)
  priority: string;
}

interface ParetoItem {
  id: string;
  cause: string;
  occurrences: number;
}

interface IshikawaCategory {
  title: string;
  key: string;
  icon: string;
  causes: string[];
}

interface CepWeek {
  week: string;
  rework: number;
  status: 'Controle' | 'Atenção' | 'FORA DO';
  observation: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pdca' | 'ishikawa' | 'cep' | 'copilot'>('dashboard');
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>('Todos');
  const [currentTime, setCurrentTime] = useState<string>('22/05/2026 14:06:39');
  
  // Custom states that are editable to make it a fully productive interactive app
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', action: 'Checklist digital obrigatório no encerramento de OS via app de campo', indicator: 'Retrabalho', responsible: 'TI + Coord.', deadline: '7 dias', resource: 'R$2.000', status: 'Em andamento', gutScore: 125 },
    { id: '2', action: 'Teste OTDR obrigatório após emenda + foto registrada como evidência', indicator: 'Retrabalho', responsible: 'Supervisores', deadline: '3 dias', resource: 'R$0', status: 'Pendente', gutScore: 100 },
    { id: '3', action: 'Treinamento 4h em fusão de fibra para técnicos com retrabalho > 1 por mês', indicator: 'Retrabalho', responsible: 'Qualidade', deadline: '15 dias', resource: 'R$4.500', status: 'Pendente', gutScore: 125 },
    { id: '4', action: 'Roteirização inteligente para otimizar deslocamento e reduzir TMA', indicator: 'TMA', responsible: 'Coord. + TI', deadline: '21 dias', resource: 'R$800/mês', status: 'Pendente', gutScore: 36 },
    { id: '5', action: 'Buffer de 30min entre OS no roteiro para evitar correria', indicator: 'TMA + Agendamento', responsible: 'Supervisores', deadline: '7 dias', resource: 'R$0', status: 'Em andamento', gutScore: 36 },
    { id: '6', action: 'Confirmação de agendamento via WhatsApp no dia anterior (D-1)', indicator: 'Agendamento', responsible: 'Supervisores', deadline: '3 dias', resource: 'R$0', status: 'Em andamento', gutScore: 64 },
    { id: '7', action: 'Manutenção preventiva mensal de todas as fusionadoras (calibração)', indicator: 'Retrabalho', responsible: 'Almoxarifado', deadline: '30 dias', resource: 'R$3.200', status: 'Pendente', gutScore: 125 },
    { id: '8', action: 'Ranking semanal de qualidade por técnico para feedback individual', indicator: 'Retrabalho', responsible: 'RH + Superv.', deadline: '10 dias', resource: 'R$0', status: 'Pendente', gutScore: 125 },
    { id: '9', action: 'Dashboard individual de retrabalho integrado no app do técnico', indicator: 'Retrabalho', responsible: 'TI', deadline: '30 dias', resource: 'R$1.500', status: 'Pendente', gutScore: 125 },
    { id: '10', action: 'Apresentação dos resultados do plano à Diretoria Vivo', indicator: 'Todos', responsible: 'Gestor PSR', deadline: '30 dias', resource: 'R$0', status: 'Pendente', gutScore: 64 }
  ]);

  // GUT Prioritization state
  const [gutItems, setGutItems] = useState<GutItem[]>([
    { id: 'g1', problem: 'Retrabalho (média atual 6% vs meta 5%)', g: 5, u: 5, t: 5, priority: '1a PRIORIDADE — Ação imediata' },
    { id: 'g2', problem: 'Custo extra de retrabalho acumulado de R$84K', g: 4, u: 5, t: 5, priority: '2a PRIORIDADE — Resolver' },
    { id: 'g3', problem: 'Agendamento abaixo do esperado (88% vs meta 90%)', g: 4, u: 4, t: 4, priority: '3a PRIORIDADE — Ação em 14d' },
    { id: 'g4', problem: 'TMA Atendimento elevado (4h12 vs meta 4h00)', g: 3, u: 4, t: 3, priority: '4a PRIORIDADE — Ação em 21d' }
  ]);

  // Pareto Chart Causes state
  const [paretoCauses] = useState<ParetoItem[]>([
    { id: 'p1', cause: 'Emenda de fusão fora do padrão', occurrences: 18 },
    { id: 'p2', cause: 'Conector sujo ou danificado', occurrences: 11 },
    { id: 'p3', cause: 'ONT com defeito não identificado', occurrences: 7 },
    { id: 'p4', cause: 'CTO saturada ou mal organizada', occurrences: 7 },
    { id: 'p5', cause: 'Fibra com macro-curvatura', occurrences: 4 },
    { id: 'p6', cause: 'Outras ou desconhecida', occurrences: 1 },
  ]);

  // Ishikawa Categories & causes state
  const [ishikawaCategories, setIshikawaCategories] = useState<IshikawaCategory[]>([
    {
      title: 'Método (Procedimentos)',
      key: 'metodo',
      icon: 'Sliders',
      causes: [
        'Sem teste OTDR obrigatório pós-emenda de fusão',
        'Checklist de encerramento de OS opcional',
        'Encerramento sem validação de sinal no cliente',
        'Ausência de manual POP de instalação FTTH atualizado'
      ]
    },
    {
      title: 'Mão de Obra (Pessoas)',
      key: 'maodeobra',
      icon: 'Users',
      causes: [
        'Técnico com baixo nível de treinamento em fusão',
        'Alta rotatividade: novos técnicos sem experiência de campo',
        'Meta de produtividade estrita sacrificando conformidade',
        'Pouca supervisão preventiva nas instalações críticas'
      ]
    },
    {
      title: 'Máquina / Material (Equipamento)',
      key: 'maquina',
      icon: 'Layers',
      causes: [
        'OTDR com bateria sem carga ou sem manutenção prévia',
        'Fusionadoras ópticas descalibradas de campo',
        'Splitters passivos de CTO com defeitos de fábrica',
        'Cabos de fibra dobrados além do raio mínimo permitido'
      ]
    },
    {
      title: 'Medição (Indicadores)',
      key: 'medicao',
      icon: 'Activity',
      causes: [
        'KPI de retrabalho com até 30 dias de defasagem de apuração',
        'Falta de alerta inteligente em tempo real para reincidências',
        'Registro incorreto da causa raiz do fechamento',
        'Consolidação de falhas apenas mensal, sem dados diários'
      ]
    },
    {
      title: 'Meio Ambiente (Local)',
      key: 'meioambiente',
      icon: 'TrendingUp',
      causes: [
        'Postes saturados e acessibilidade complexa a CTOs',
        'Chuvas frequentes e umidade nas emendas de calçadas',
        'Espaço reduzido para manuseio adequado de fusões',
        'Atos de vandalismo contra redes aéreas'
      ]
    },
    {
      title: 'Gestão / Processo',
      key: 'gestao',
      icon: 'Briefcase',
      causes: [
        'Divergência entre prazos (SLA) versus nível de qualidade',
        'Campanhas de produtividade que ignoram o FCR',
        'Ausência de acompanhamento de melhorias por técnico',
        'Tratativas de falhas de rede de forma reativa'
      ]
    }
  ]);

  // Weekly failure checksheet
  const [folhaDeVerificacao] = useState([
    { cause: 'Emenda de fusão fora do padrão', w1: 4, w2: 5, w3: 4, w4: 5 },
    { cause: 'Conector sujo ou danificado', w1: 3, w2: 2, w3: 3, w4: 3 },
    { cause: 'ONT com defeito não identificado', w1: 2, w2: 2, w3: 1, w4: 2 },
    { cause: 'CTO saturada ou mal organizada', w1: 1, w2: 2, w3: 2, w4: 2 },
    { cause: 'Fibra com macro-curvatura', w1: 1, w2: 1, w3: 1, w4: 1 },
    { cause: 'Outros ou desconhecida', w1: 0, w2: 0, w3: 1, w4: 0 }
  ]);

  // CEP (Statistical Process Control) state
  const [cepWeeks, setCepWeeks] = useState<CepWeek[]>([
    { week: 'Semana 1', rework: 5.2, status: 'Controle', observation: 'Dentro dos limites — processo estável' },
    { week: 'Semana 2', rework: 5.5, status: 'Controle', observation: 'Dentro dos limites — processo estável' },
    { week: 'Semana 3', rework: 5.8, status: 'Atenção', observation: 'Próximo ao LSC (Limite Superior) — monitorar de perto' },
    { week: 'Semana 4', rework: 6.0, status: 'Atenção', observation: 'Acima da média geral — investigar causa' },
    { week: 'Semana 5', rework: 5.6, status: 'Controle', observation: 'Estabilização após primeiro feedback' },
    { week: 'Semana 6', rework: 6.8, status: 'FORA DO', observation: 'Ultrapassou LSC (6.6%) — causa especial: vandalismo extremo Zona Leste' },
    { week: 'Semana 7', rework: 5.9, status: 'Controle', observation: 'Retornou após ações corretivas e contenção' },
    { week: 'Semana 8', rework: 6.1, status: 'Atenção', observation: 'Acima da linha média de controle' },
    { week: 'Semana 9', rework: 5.7, status: 'Controle', observation: 'Processo dentro do limite normal' },
    { week: 'Semana 10', rework: 5.4, status: 'Controle', observation: 'Tendência positiva — reflexo da nova padronização' },
    { week: 'Semana 11', rework: 6.3, status: 'Atenção', observation: 'Ponto crítico sob investigação de equipe' },
    { week: 'Semana 12', rework: 5.8, status: 'Controle', observation: 'Finalização do ciclo dentro do esperado' }
  ]);

  // Coordinator Data
  const coordinatorStats: Record<string, {
    ifiHoje: number; ifiAltasHoje: number; ifiTotalHoje: number;
    ifiAcumulado: number; ifiAltasAcumulado: number; ifiTotalAcumulado: number;
    rework: number; tma: string; agendamento: number; custoRework: number;
  }> = {
    'Todos': {
      ifiHoje: 2.21, ifiAltasHoje: 136, ifiTotalHoje: 3,
      ifiAcumulado: 3.93, ifiAltasAcumulado: 5010, ifiTotalAcumulado: 197,
      rework: 6.0, tma: '4h12', agendamento: 88, custoRework: 84,
    },
    'ACASSIO': {
      ifiHoje: 1.85, ifiAltasHoje: 28, ifiTotalHoje: 0,
      ifiAcumulado: 3.22, ifiAltasAcumulado: 1100, ifiTotalAcumulado: 35,
      rework: 4.8, tma: '3h45', agendamento: 92, custoRework: 14,
    },
    'MARCIO': {
      ifiHoje: 2.54, ifiAltasHoje: 35, ifiTotalHoje: 0,
      ifiAcumulado: 4.45, ifiAltasAcumulado: 1250, ifiTotalAcumulado: 56,
      rework: 6.9, tma: '4h35', agendamento: 84, custoRework: 28,
    },
    'ADRIANO': {
      ifiHoje: 2.10, ifiAltasHoje: 30, ifiTotalHoje: 2,
      ifiAcumulado: 3.82, ifiAltasAcumulado: 980, ifiTotalAcumulado: 37,
      rework: 5.9, tma: '4h21', agendamento: 89, custoRework: 19,
    },
    'ROBSON': {
      ifiHoje: 1.98, ifiAltasHoje: 25, ifiTotalHoje: 1,
      ifiAcumulado: 4.11, ifiAltasAcumulado: 920, ifiTotalAcumulado: 38,
      rework: 6.4, tma: '4h18', agendamento: 87, custoRework: 16,
    },
    'CLEBER': {
      ifiHoje: 2.61, ifiAltasHoje: 18, ifiTotalHoje: 0,
      ifiAcumulado: 3.48, ifiAltasAcumulado: 760, ifiTotalAcumulado: 31,
      rework: 5.1, tma: '3h58', agendamento: 91, custoRework: 7,
    }
  };

  // AI Chat Bot state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: 'm1', 
      sender: 'ai', 
      text: 'Olá! Sou a IA de Gestão de Qualidade Vivo. Estou conectada em tempo real aos indicadores operacionais de qualidade da equipe de campo de São Paulo. Atualmente temos um ponto de atenção no Retrabalho de Emendas (6% vs meta 5%) e no TMA (4h12 vs meta 4h00).\n\nComo posso ajudar você a formular planos de ação, rodar análises GUT/Pareto ou examinar as causas raiz?',
      timestamp: '17:03:10' 
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Form states for adding items dynamically
  const [newActionText, setNewActionText] = useState('');
  const [newActionInd, setNewActionInd] = useState('Retrabalho');
  const [newActionResp, setNewActionResp] = useState('Supervisores');
  const [newActionPrazo, setNewActionPrazo] = useState('7 dias');
  const [newActionCost, setNewActionCost] = useState('R$0');

  const [newGutProb, setNewGutProb] = useState('');
  const [newGutG, setNewGutG] = useState(3);
  const [newGutU, setNewGutU] = useState(3);
  const [newGutT, setNewGutT] = useState(3);

  const [newIshikawaCause, setNewIshikawaCause] = useState('');
  const [selectedIshikawaCat, setSelectedIshikawaCat] = useState('metodo');

  const [newCepValue, setNewCepValue] = useState('');

  // Update Clock in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Pad to match format
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${day}/${month}/${year} ${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Pareto Cumulative Data dynamically
  const totalParetoOccurrences = paretocuteTotal();
  function paretocuteTotal() {
    return paretoCauses.reduce((acc, item) => acc + item.occurrences, 0);
  }

  // Action state changes
  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        let n: 'Pendente' | 'Em andamento' | 'Concluído' = 'Pendente';
        if (t.status === 'Pendente') n = 'Em andamento';
        else if (t.status === 'Em andamento') n = 'Concluído';
        return { ...t, status: n };
      }
      return t;
    }));
  };

  const deleteIndexTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    const newTaskItem: Task = {
      id: Date.now().toString(),
      action: newActionText,
      indicator: newActionInd,
      responsible: newActionResp,
      deadline: newActionPrazo,
      resource: newActionCost,
      status: 'Pendente',
      gutScore: 64
    };
    setTasks(prev => [newTaskItem, ...prev]);
    setNewActionText('');

    // Trigger dynamic feedback from assistant
    simulateAiResponse(`Adicionei uma nova ação de qualidade para resolver o indicador ${newActionInd}: "${newActionText}". Como isso se integra ao plano PDCA global?`);
  };

  // Add Item GUT Matrix
  const handleAddGut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGutProb.trim()) return;
    const score = newGutG * newGutU * newGutT;
    let priorityStr = 'Prioridade Baixa';
    if (score >= 100) priorityStr = '1a PRIORIDADE — Crítica';
    else if (score >= 60) priorityStr = '2a PRIORIDADE — Urgente';
    else if (score >= 30) priorityStr = '3a PRIORIDADE — Média';

    const newItem: GutItem = {
      id: Date.now().toString(),
      problem: newGutProb,
      g: newGutG,
      u: newGutU,
      t: newGutT,
      priority: priorityStr
    };
    setGutItems(prev => [...prev, newItem].sort((a,b) => (b.g*b.u*b.t) - (a.g*a.u*a.t)));
    setNewGutProb('');
  };

  // Update Existing Problem GUT Core Values
  const updateGutValue = (id: string, field: 'g' | 'u' | 't', val: number) => {
    setGutItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: val };
        const score = updated.g * updated.u * updated.t;
        if (score >= 100) updated.priority = '1a PRIORIDADE — Ação imediata';
        else if (score >= 60) updated.priority = '2a PRIORIDADE — Resolver';
        else if (score >= 30) updated.priority = '3a PRIORIDADE — Ação média';
        else updated.priority = '4a PRIORIDADE — Monitoramento';
        return updated;
      }
      return item;
    }).sort((a,b) => (b.g*b.u*b.t) - (a.g*a.u*a.t)));
  };

  // Add Ishikawa cause
  const handleAddIshikawaCause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIshikawaCause.trim()) return;
    setIshikawaCategories(prev => prev.map(cat => {
      if (cat.key === selectedIshikawaCat) {
        return {
          ...cat,
          causes: [...cat.causes, newIshikawaCause]
        };
      }
      return cat;
    }));
    setNewIshikawaCause('');
  };

  // Add CEP Data point
  const handleAddCepValue = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newCepValue);
    if (isNaN(val) || val < 0 || val > 100) return;
    
    const nextSem = `Semana ${cepWeeks.length + 1}`;
    let stat: 'Controle' | 'Atenção' | 'FORA DO' = 'Controle';
    let obs = 'Processo dentro dos limites previstos';
    
    if (val > 6.6) {
      stat = 'FORA DO';
      obs = 'ALERTA: Especial desvio detectado! Ponto acima do Limite de Controle Superior (LSC = 6.6%). Agradecer auditoria imediatada!';
    } else if (val > 6.0) {
      stat = 'Atenção';
      obs = 'Aviso: Tendência de alta observada. Monitorar e registrar causas!';
    } else if (val < 5.4) {
      stat = 'Controle';
      obs = 'Eficácia excepcional! Ponto abaixo do Limite Inferior (LIC = 5.4%) sugere melhoria inovadora de processo.';
    }

    const newItem: CepWeek = {
      week: nextSem,
      rework: val,
      status: stat,
      observation: obs
    };
    
    setCepWeeks(prev => [...prev, newItem]);
    setNewCepValue('');

    // Dynamic AI prompt
    if (stat === 'FORA DO') {
      simulateAiResponse(`Atenção crítica! O novo registro de retrabalho na ${nextSem} atingiu ${val}%, rompendo o LSC de 6.6%. Diagnostico de causa especial requerido. Verifique falhas em equipamentos ou materiais na Zona afetada.`);
    } else {
      simulateAiResponse(`Novo dado de cep adicionado para a ${nextSem} com valor de ${val}%. Excelente manutenção dos registros operacionais da Vivo.`);
    }
  };

  // Action response simulated
  const simulateAiResponse = (userMsg: string) => {
    setIsAiTyping(true);
    setTimeout(() => {
      let botText = '';
      const promptLower = userMsg.toLowerCase();
      
      if (promptLower.includes('rework') || promptLower.includes('retrabalho')) {
        botText = 'O desvio de Retrabalho (atual 6% vs meta 5%) está concentrado principalmente em "Emenda de fusão fora do padrão" (37.5% das ocorrências) e "Conector sujo ou danificado" (22.9%). Nossa folha de verificação indica que a padronização do checklist digital obrigatório + validação de teste OTDR no encerramento da OS são os principais remediadores, com ROI payback em 1 mês reduzindo R$14K/mês de falhas.';
      } else if (promptLower.includes('tma') || promptLower.includes('atendimento')) {
        botText = 'O monitoramento do TMA aponta 4h12 de média, concentrando atrasos na falta de insumos de instalação em campo e roteirização ineficiente. A nossa ação corretiva #4 foca no roteamento inteligente, o que projeta remover até 30 minutos de trânsito em trajetos sequenciais nas zonas leste/norte de São Paulo.';
      } else if (promptLower.includes('concluid') || promptLower.includes('parabens')) {
        botText = 'Meus parabéns à equipe Vivo Operações SP! Finalizar as ações do PDCA diminui a variabilidade de qualidade e otimiza a conformidade das auditorias internas de campo. Qual o próximo projeto de melhoria contínua e Kaizen idealizado por vocês?';
      } else if (promptLower.includes('gut') || promptLower.includes('prioriza')) {
        botText = 'No modelo GUT (Gravidade x Urgência x Tendência), o indicador de retrabalho tem nota máxima (5x5x5 = 125) dada a perda financeira direta e impacto imediato nas vistorias internas com cliente final. De acordo com o diagrama de Pareto, focar nas 2 principais causas resolverá quase 60% de todas as anomalias detectadas.';
      } else {
        botText = 'Compreendo a necessidade estratégica para a Gestão Operacional de Qualidade Vivo. Para esses cenários, a aplicação de ferramentas de ciclo fechado (PDCA) combinada à folha de verificação de campo nos permite obter o controle imediato do processo. Gostaria de focar no detalhamento de algum desdobramento de metas da Matriz GUT ou no cálculo operacional da CEP?';
      }

      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: botText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsAiTyping(false);
    }, 1500);
  };

  // Submit User Message Chat
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
    
    simulateAiResponse(userMsg);
  };

  // Helper values based on selected coordinator filters
  const selectedStats = coordinatorStats[selectedCoordinator] || coordinatorStats['Todos'];

  return (
    <div className="min-h-screen bg-[#ECEFF1] text-[#333333] flex flex-col font-sans">
      
      {/* VIVO BRAND HEADER */}
      <header className="bg-gradient-to-r from-[#660099] via-[#4a006f] to-[#33004D] text-white shadow-lg border-b-4 border-[#F05000] relative">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-3xl font-extrabold tracking-tight text-[#660099] flex items-center">
                vivo<span className="text-[#F05000] text-4xl leading-none">.</span>
              </span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Gestão Operacional de Qualidade
              </h1>
              <p className="text-xs md:text-sm text-purple-200">
                PSR TELECOM | Fibra Óptica FTTH/GPON | Vivo São Paulo
              </p>
            </div>
          </div>

          {/* Real-time Clock Widget & Coordinator Selection */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#4a006f] border border-purple-400 bg-opacity-40 px-3 py-2 rounded-lg text-center shadow-inner">
              <div className="text-[10px] text-purple-300 uppercase tracking-widest font-semibold flex items-center gap-1 justify-center">
                <Clock className="w-3 h-3" /> Atualizado em
              </div>
              <div className="text-sm font-mono text-purple-100 font-semibold mt-0.5 whitespace-nowrap">
                {currentTime}
              </div>
            </div>

            <div className="bg-white text-[#333333] px-3 py-1.5 rounded-lg shadow flex items-center gap-2">
              <label htmlFor="coor-select" className="text-xs font-bold text-[#660099] uppercase tracking-wider">
                Coordenador:
              </label>
              <select 
                id="coor-select"
                className="bg-transparent border-none text-sm font-bold text-[#333333] focus:ring-0 outline-none cursor-pointer"
                value={selectedCoordinator}
                onChange={(e) => setSelectedCoordinator(e.target.value)}
              >
                <option value="Todos">Todos os Coordenadores</option>
                <option value="ACASSIO">Acaassio</option>
                <option value="MARCIO">Marcio</option>
                <option value="ADRIANO">Adriano</option>
                <option value="ROBSON">Robson</option>
                <option value="CLEBER">Cleber</option>
              </select>
            </div>
          </div>

        </div>
      </header>

      {/* SUB-HEADER APP CHIPS (Interactive KPI overview strip) */}
      <section className="bg-white border-b border-gray-200 py-3 shadow-sm px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 md:gap-4 justify-between items-center text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-bold uppercase tracking-wider">Foco na Meta:</span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold shadow-xs ${selectedStats.rework <= 5.0 ? 'bg-[#E6F4EA] text-[#00875A]' : 'bg-[#xFFFFECE3] text-[#F05000]'}`}>
              Retrabalho: {selectedStats.rework}% <span className="font-normal opacity-70">(meta &lt;= 5.0%)</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold shadow-xs ${selectedStats.tma <= '4h00' ? 'bg-[#E6F4EA] text-[#00875A]' : 'bg-[#xFFFFECE3] text-[#F05000]'}`}>
              TMA: {selectedStats.tma} <span className="font-normal opacity-70">(meta &lt;= 4h00)</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold shadow-xs ${selectedStats.agendamento >= 90 ? 'bg-[#E6F4EA] text-[#00875A]' : 'bg-[#xFFFFECE3] text-[#F05000]'}`}>
              Agendamento: {selectedStats.agendamento}% <span className="font-normal opacity-70">(meta &gt;= 90%)</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#555555]">
            <span className="hidden lg:flex items-center gap-1">
              <Users className="w-4 h-4 text-purple-700" /> Ativo: <strong>{selectedCoordinator === 'Todos' ? '5 Equipes de Campo' : `Equipe ${selectedCoordinator}`}</strong>
            </span>
            <span className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded border border-purple-100 font-semibold text-purple-800">
              <Activity className="w-3.5 h-3.5 tracking-wider" /> Fato-Causa-Ação Integrado
            </span>
          </div>
        </div>
      </section>

      {/* CORE FRAMEWORK WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR TABS - Desktop Rail, Flex on Mobile */}
        <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:w-64 shrink-0" aria-label="Negação Lateral">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all whitespace-nowrap w-full ${activeTab === 'dashboard' ? 'bg-[#660099] text-white shadow-md transform translate-x-1' : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-[#660099]'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>Painel de Indicadores</span>
          </button>

          <button
            onClick={() => setActiveTab('pdca')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all whitespace-nowrap w-full ${activeTab === 'pdca' ? 'bg-[#660099] text-white shadow-md transform translate-x-1' : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-[#660099]'}`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Planos PDCA &amp; FCA</span>
          </button>

          <button
            onClick={() => setActiveTab('ishikawa')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all whitespace-nowrap w-full ${activeTab === 'ishikawa' ? 'bg-[#660099] text-white shadow-md transform translate-x-1' : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-[#660099]'}`}
          >
            <Layers className="w-5 h-5" />
            <span>Diagnóstico &amp; Pareto</span>
          </button>

          <button
            onClick={() => setActiveTab('cep')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all whitespace-nowrap w-full ${activeTab === 'cep' ? 'bg-[#660099] text-white shadow-md transform translate-x-1' : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-[#660099]'}`}
          >
            <Activity className="w-5 h-5" />
            <span>Controle de Processo CEP</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all whitespace-nowrap w-full relative ${activeTab === 'copilot' ? 'bg-[#660099] text-white shadow-md transform translate-x-1' : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-[#660099]'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Co-Piloto Operacional IA</span>
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F05000]"></span>
            </span>
          </button>

          {/* Quick Stats Panel In Sidebar (Desktop View) */}
          <div className="hidden lg:block bg-gradient-to-br from-white to-purple-50 p-4 rounded-xl border border-purple-100 mt-4 space-y-3">
            <h4 className="text-xs font-bold text-purple-900 tracking-wider uppercase border-b border-purple-100 pb-2">
              Diagnóstico Rápido
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Custo Retrabalho:</span>
                <span className="font-extrabold text-[#F05000]">R${selectedStats.custoRework}K</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#F05000] h-full rounded" style={{ width: `${Math.min(100, (selectedStats.custoRework / 100) * 100)}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-400">Meta recomendada: Máx R$70K</p>
            </div>

            <div className="pt-2 text-[10px] text-[#660099] font-medium bg-purple-100 p-2.5 rounded-lg border border-purple-200">
              💡 As causas críticas estão em <strong>Emendas de Fibra</strong>. Padronizar ferramentas OTDR mitiga 37.5% das falhas.
            </div>
          </div>

        </nav>

        {/* WORKSPACE CENTRAL SCREEN */}
        <section className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-xl border border-gray-100 min-h-[550px] flex flex-col justify-between">
          
          {/* TAB 1: PAINEL DE INDICADORES (DASHBOARD) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Header inside Tab */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#660099]">Painel Unificado de Indicadores</h2>
                  <p className="text-xs text-[#555555]">Taxas de desempenho atuais e desvios contra metas Vivo Telefônica ({selectedCoordinator === 'Todos' ? 'Média Brasil SP' : `Visualizando dados da equipe: ${selectedCoordinator}`})</p>
                </div>
                <div className="bg-[#E6F4EA] text-[#00875A] font-bold text-xs uppercase tracking-wider px-3 py-1 rounded inline-flex items-center gap-1.5 self-start md:self-auto">
                  <Check className="w-4 h-4" /> Qualidade sob Controle
                </div>
              </div>

              {/* TWO COLUMN ROW: TOP CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* CARD 1: IFI Online */}
                <div className="border border-purple-100 bg-gradient-to-b from-white to-purple-50/35 p-5 rounded-2xl shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 bg-purple-50 text-purple-700 rounded-bl-2xl">
                    <TrendingUp className="w-5 h-5 text-[#660099]" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-[#EADBFC] text-[#660099] rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                      IFI
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-[#660099]">Entrante de IFI Online</h3>
                      <p className="text-[11px] text-[#555555]">Meta Corporativa: <strong className="text-purple-900">&lt;= 4,00%</strong></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white p-3 rounded-xl border border-purple-100/60 shadow-xs flex flex-col justify-between">
                      <span className="text-xs text-gray-500 font-medium">Porcentagem Hoje</span>
                      <span className="text-2xl font-extrabold text-[#00875A]">{selectedStats.ifiHoje}%</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Altas: {selectedStats.ifiAltasHoje} | IFI: {selectedStats.ifiTotalHoje}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-purple-100/60 shadow-xs flex flex-col justify-between">
                      <span className="text-xs text-gray-500 font-medium font-semibold text-purple-900">Total Acumulado</span>
                      <span className="text-2xl font-extrabold text-[#660099]">{selectedStats.ifiAcumulado}%</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Altas: {selectedStats.ifiAltasAcumulado} | IFI: {selectedStats.ifiTotalAcumulado}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-2 bg-purple-50 rounded text-xs text-[#660099] flex items-center justify-between font-medium">
                    <span>Projeção para Final do Mês:</span>
                    <strong className="text-purple-800">{ (selectedStats.ifiAcumulado * 0.98).toFixed(2) }% (Abaixo da Meta)</strong>
                  </div>
                </div>

                {/* CARD 2: IRR Total */}
                <div className="border border-purple-100 bg-gradient-to-b from-white to-[#xFFFFECE3]/20 p-5 rounded-2xl shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 bg-orange-50 text-orange-700 rounded-bl-2xl">
                    <Activity className="w-5 h-5 text-[#F05000]" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-[#xFFFFECE3] text-[#F05000] rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                      IRR
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-gray-800">Indicador IRR Total</h3>
                      <p className="text-[11px] text-[#555555]">Meta Máxima Permitida: <strong className="text-[#F05000]">&lt;= 15,00%</strong></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                      <span className="text-xs text-gray-500 font-medium block">IRR Campo Hoje</span>
                      <span className="text-2xl font-extrabold text-[#F05000]">{ (selectedStats.rework * 1.25).toFixed(2) }%</span>
                      <div className="h-1 bg-orange-200 rounded-full mt-1 overflow-hidden">
                        <div className="bg-[#F05000] h-full" style={{ width: `${Math.min(100, (selectedStats.rework * 1.25 / 15) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                      <span className="text-xs text-gray-500 font-medium block">IRR Campo Acumulado</span>
                      <span className="text-2xl font-extrabold text-[#660099]">{ (selectedStats.rework * 1.1).toFixed(2) }%</span>
                      <div className="h-1 bg-purple-200 rounded-full mt-1 overflow-hidden">
                        <div className="bg-[#660099] h-full" style={{ width: `${Math.min(100, (selectedStats.rework * 1.1 / 15) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-2 bg-[#xFFFFECE3] text-[#F05000] rounded text-xs flex items-center justify-between font-semibold">
                    <span>Conformidade de Processo de Campo:</span>
                    <span>{(100 - selectedStats.rework).toFixed(1)}% (RETRABALHO ALERTA!)</span>
                  </div>
                </div>

              </div>

              {/* RECHARTS WEEKLY TRENDS: IFI ONLINE & RETRABALHO */}
              <WeeklyTrendsChart 
                selectedCoordinator={selectedCoordinator}
                onCoordinatorChange={setSelectedCoordinator}
              />

              {/* GRAPH GRID: COORDINATOR METRIC BARS */}
              <div className="border border-gray-200 rounded-2xl p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-gray-100 pb-3 gap-2">
                  <h3 className="font-extrabold text-[#660099] uppercase text-sm tracking-wider flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-purple-700" /> Desempenho Comparativo por Coordenadores
                  </h3>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-400 rounded-xs"></span> Real</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-700 rounded-xs"></span> Projeção</span>
                    <span className="flex items-center gap-1"><span className="w-3.5 h-1 bg-[#F05000] block"></span> Meta</span>
                  </div>
                </div>

                {/* Coordinator Chart Area */}
                <div className="space-y-4">
                  {Object.keys(coordinatorStats).filter(c => c !== 'Todos').map((name) => {
                    const stat = coordinatorStats[name];
                    const metaVal = 5.0; // 5% rework meta
                    
                    return (
                      <div key={name} className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                        {/* Selector indicator */}
                        <div className="w-24 shrink-0 flex items-center justify-between">
                          <span className={`text-xs font-bold tracking-tight px-2 py-0.5 rounded cursor-pointer transition-all ${selectedCoordinator === name ? 'bg-purple-600 text-white' : 'text-[#333333] hover:bg-gray-100'}`} onClick={() => setSelectedCoordinator(name)}>
                            {name}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono hidden md:inline">({stat.rework}%)</span>
                        </div>

                        {/* Bar chart representation */}
                        <div className="flex-1 bg-gray-100 h-8 rounded-lg relative overflow-hidden flex items-center px-2">
                          {/* Grid line indicator for Meta <= 5.0 */}
                          <div className="absolute h-full border-r-2 border-dashed border-[#F05000] z-20" style={{ left: '50%' }} title="Meta Máxima Rebo 5%"></div>
                          
                          {/* Inner bar: Real Rework Ratios */}
                          <div 
                            className="bg-purple-300 h-6 rounded-l transition-all duration-500 flex items-center px-2 text-[10px] text-purple-900 font-extrabold"
                            style={{ width: `${(stat.rework / 10) * 100}%` }}
                          >
                            <span>{stat.rework}%</span>
                          </div>

                          {/* Projection segment */}
                          <div 
                            className="bg-purple-700/20 h-6 border-l border-purple-500" 
                            style={{ width: `${Math.max(0, ((stat.rework * 1.15) / 10) * 100) - ((stat.rework / 10) * 100)}%` }}
                          ></div>
                        </div>

                        {/* Alert Status Pin */}
                        <div className="w-20 shrink-0 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.rework <= metaVal ? 'bg-green-100 text-[#00875A]' : 'bg-orange-100 text-[#F05000]'}`}>
                            {stat.rework <= metaVal ? 'Conforme' : 'Desvio'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] text-[#555555] mt-4 flex justify-between items-center flex-wrap gap-2">
                  <span><strong>Nota Operacional:</strong> MÁRCIO e ROBSON apresentam desvio crítico (recomenda-se treinar 4h os técnicos).</span>
                  <button className="text-[#660099] font-bold hover:underline flex items-center gap-0.5" onClick={() => setActiveTab('pdca')}>
                    Acessar Planos Associados <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* THREE COLUMN DETAIL BADGES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-3xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">TMA Atendimento</span>
                    <strong className="text-base text-gray-800 font-extrabold">{selectedStats.tma}</strong>
                    <span className="text-[10px] text-gray-400 block">Meta esperada: &lt;= 4h00</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-3xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Conformidade Agenda</span>
                    <strong className="text-base text-gray-800 font-extrabold">{selectedStats.agendamento}%</strong>
                    <span className="text-[10px] text-gray-400 block">Meta esperada: &gt;= 90%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-3xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Custo Retrabalho</span>
                    <strong className="text-base text-[#F05000] font-extrabold">R${selectedStats.custoRework}K</strong>
                    <span className="text-[10px] text-gray-400 block">Meta tolerada: R$70K /mês</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CICLO PDCA & METODOLOGIA FCA */}
          {activeTab === 'pdca' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#660099]">FCA — Fato, Causa e Ação</h2>
                  <p className="text-xs text-[#555555]">Mecanismo estruturado para conter e reverter desvios de metas de forma digital colaborativa.</p>
                </div>
                
                <div className="flex gap-2">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-sm font-bold">P-D-C-A Ciclo Ativo</span>
                </div>
              </div>

              {/* PDCA CONCEPT DESCRIPTIVE BANNER */}
              <div className="bg-gradient-to-r from-purple-700 to-[#33004D] text-white p-4 rounded-2xl shadow-sm text-xs md:text-sm flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                <div className="space-y-1">
                  <h4 className="font-extrabold flex items-center gap-1.5 uppercase text-xs tracking-wider text-orange-400">
                    <Info className="w-4 h-4" /> Diretrizes de Melhoria de Processo
                  </h4>
                  <p className="text-purple-100">
                    <strong>P - Planejar:</strong> Alvo redução de Retrabalho de 6% para 5% em 60d. <br />
                    <strong>D - Executar:</strong> Checklists obrigatórios de emenda no app do instalador. <br />
                    <strong>C - Verificar:</strong> Monitorar CEP semanalmente com alertador tático automático. <br />
                    <strong>A - Agir:</strong> Padronizar os novos POPs e expandir para vistorias em todo o estado.
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="bg-[#F05000] text-white font-extrabold text-xs uppercase px-4 py-2 rounded-lg block text-center tracking-wide">
                    ISO 9001 QUALIDADE
                  </span>
                </div>
              </div>

              {/* FCA TABLE OVERVIEW */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                <div className="bg-purple-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-purple-900 uppercase tracking-widest flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" /> Planilha de Controles Gerais
                  </h3>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-extrabold">
                    {tasks.length} Ações Ativas
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700 border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase font-black tracking-wider text-[10px] border-b border-gray-100">
                        <th className="px-4 py-3" scope="col">Status</th>
                        <th className="px-4 py-3" scope="col">Ação Corretiva (O que fazer)</th>
                        <th className="px-4 py-3" scope="col">Indicador Alvo</th>
                        <th className="px-4 py-3" scope="col">Responsável</th>
                        <th className="px-4 py-3" scope="col">Prazo</th>
                        <th className="px-4 py-3" scope="col">Custo</th>
                        <th className="px-4 py-3" scope="col">Opção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tasks.map((t) => (
                        <tr key={t.id} className="hover:bg-purple-50/10 transition-colors">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleTaskStatus(t.id)}
                              className={`w-full inline-flex items-center gap-1 justify-center px-2 py-1 rounded text-[10px] font-bold cursor-pointer hover:opacity-90 transition-all ${
                                t.status === 'Concluído' 
                                  ? 'bg-[#E6F4EA] text-[#00875A]' 
                                  : t.status === 'Em andamento' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {t.status === 'Concluído' && <Check className="w-3 h-3" />}
                              <span>{t.status}</span>
                            </button>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 max-w-xs truncate md:max-w-none">
                            {t.action}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-gray-100 px-2.5 py-1 rounded text-gray-600 font-semibold border border-gray-200">
                              {t.indicator}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-[#555555]">
                            {t.responsible}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {t.deadline}
                          </td>
                          <td className="px-4 py-3 font-extrabold text-purple-900">
                            {t.resource}
                          </td>
                          <td className="px-4 py-3">
                            <button 
                              onClick={() => deleteIndexTask(t.id)}
                              className="text-gray-400 hover:text-[#F05000] p-1 rounded-md hover:bg-orange-50 transition-all cursor-pointer"
                              title="Excluir ação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QUICK ADD NEW FORM */}
              <form onSubmit={handleAddTask} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <Plus className="w-5 h-5 text-purple-700" />
                  <h3 className="font-extrabold text-sm text-[#660099] uppercase tracking-wider">
                    Adicionar Nova Ação Corretiva ao Plano de Qualidade
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Action text input */}
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <label htmlFor="act-desc" className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      Descrição da Ação (O que fazer)
                    </label>
                    <input 
                      id="act-desc"
                      type="text" 
                      placeholder="Ex: Treinamento prático de emenda de fusão óptica..." 
                      className="bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#660099] outline-none"
                      value={newActionText}
                      onChange={(e) => setNewActionText(e.target.value)}
                    />
                  </div>

                  {/* Indicator Target dropdown */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label htmlFor="act-ind" className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      Indicador Alvo
                    </label>
                    <select 
                      id="act-ind"
                      className="bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#660099] outline-none"
                      value={newActionInd}
                      onChange={(e) => setNewActionInd(e.target.value)}
                    >
                      <option>Retrabalho</option>
                      <option>TMA</option>
                      <option>Agendamento</option>
                      <option>Todos</option>
                    </select>
                  </div>

                  {/* Responsible input */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label htmlFor="act-resp" className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      Responsável
                    </label>
                    <input 
                      id="act-resp"
                      type="text" 
                      placeholder="Supervisor / TI" 
                      className="bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#660099] outline-none"
                      value={newActionResp}
                      onChange={(e) => setNewActionResp(e.target.value)}
                    />
                  </div>

                  {/* Deadline deadline */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label htmlFor="act-prazo" className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      Prazo
                    </label>
                    <input 
                      id="act-prazo"
                      type="text" 
                      placeholder="15 dias" 
                      className="bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#660099] outline-none"
                      value={newActionPrazo}
                      onChange={(e) => setNewActionPrazo(e.target.value)}
                    />
                  </div>

                  {/* Cost budget */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label htmlFor="act-custo" className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      Investimento
                    </label>
                    <input 
                      id="act-custo"
                      type="text" 
                      placeholder="R$1.500" 
                      className="bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#660099] outline-none"
                      value={newActionCost}
                      onChange={(e) => setNewActionCost(e.target.value)}
                    />
                  </div>

                </div>

                <div className="flex justify-end pt-2 border-t border-gray-200">
                  <button 
                    type="submit" 
                    className="bg-[#660099] text-white hover:bg-purple-800 transition-all font-bold text-xs uppercase px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Cadastrar Ação PDCA
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 3: DIAGNÓSTICO & PARETO & ISHIKAWA WORKSPACE */}
          {activeTab === 'ishikawa' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#660099]">Módulo Avançado de Diagnóstico</h2>
                  <p className="text-xs text-[#555555]">Isolamento estatístico de causas de retrabalho com Ishikawa, priorização GUT e Pareto.</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-orange-100 text-[#F05000] text-xs font-bold px-3 py-1 rounded">Regra 80/20 Ativa</span>
                </div>
              </div>

              {/* THREE GRID PANEL DETAILS FOR QUALITATIVO VS QUANTITATIVO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* SUB-SECTION 1: Pareto chart */}
                <div className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#660099] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BarChart2 className="w-5 h-5 text-purple-700" /> Histograma de Pareto — Causas de Retrabalho
                    </h3>
                    <p className="text-[11px] text-[#555555] mb-4">
                      Com base em <strong>{totalParetoOccurrences} ordens de serviço (OS) com erro</strong> no último ciclo auditado.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      let cumulative = 0;
                      return paretoCauses.map((item) => {
                        cumulative += item.occurrences;
                        const individualPct = (item.occurrences / totalParetoOccurrences) * 100;
                        const cumulativePct = (cumulative / totalParetoOccurrences) * 100;
                        const isPrimary = cumulativePct <= 65; // High impact items

                        return (
                          <div key={item.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-gray-800">{item.cause}</span>
                              <span className="text-gray-500 font-mono">
                                {item.occurrences} OS | <strong className={isPrimary ? "text-[#F05000]" : "text-gray-600"}>{individualPct.toFixed(1)}% ({cumulativePct.toFixed(0)}% Acum.)</strong>
                              </span>
                            </div>

                            <div className="w-full bg-gray-100 h-2.5 rounded-full relative overflow-hidden flex">
                              <div 
                                className={`h-full rounded-l transition-all duration-500 ${isPrimary ? 'bg-[#F05000]' : 'bg-purple-500'}`}
                                style={{ width: `${individualPct}%` }}
                              ></div>
                              <div 
                                className="bg-purple-900/10 h-full" 
                                style={{ width: `${cumulativePct - individualPct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-100 text-[10px] text-orange-900 mt-4 font-semibold">
                    🎯 <strong>Estratégia 80/20:</strong> Solucionar as 2 primeiras falhas (&quot;Emenda fora de padrão&quot; e &quot;Conector sujo&quot;) resolve **60.4%** de todo o problema de retrabalho de São Paulo.
                  </div>
                </div>

                {/* SUB-SECTION 2: GUT prioritizer matrix */}
                <div className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#660099] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sliders className="w-5 h-5 text-purple-700" /> Matriz GUT de Gravidade, Urgência e Tendência
                    </h3>
                    <p className="text-[11px] text-[#555555] mb-4">
                      Determine a prioridade de ação multiplicando as notas atribuídas <strong>(Score = G x U x T)</strong>. Toque nas setas para configurar.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {gutItems.map((item) => {
                      const score = item.g * item.u * item.t;
                      return (
                        <div key={item.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between font-bold text-gray-800">
                            <span>{item.problem}</span>
                            <span className="text-[#660099] bg-[#EADBFC] px-2.5 py-0.5 rounded-full font-black">
                              {score} Pts
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 text-[11px] text-[#555555]">
                            {/* Gravity controller */}
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-200">
                              <span>G: <strong>{item.g}</strong></span>
                              <div className="flex flex-col">
                                <button className="leading-none hover:text-purple-700 text-[9px] cursor-pointer" onClick={() => updateGutValue(item.id, 'g', Math.min(5, item.g + 1))}>▲</button>
                                <button className="leading-none hover:text-purple-700 text-[9px] cursor-pointer" onClick={() => updateGutValue(item.id, 'g', Math.max(1, item.g - 1))}>▼</button>
                              </div>
                            </div>

                            {/* Urgency controller */}
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-200">
                              <span>U: <strong>{item.u}</strong></span>
                              <div className="flex flex-col">
                                <button className="leading-none hover:text-purple-700 text-[9px] cursor-pointer" onClick={() => updateGutValue(item.id, 'u', Math.min(5, item.u + 1))}>▲</button>
                                <button className="leading-none hover:text-purple-700 text-[9px] cursor-pointer" onClick={() => updateGutValue(item.id, 'u', Math.max(1, item.u - 1))}>▼</button>
                              </div>
                            </div>

                            {/* Tendency controller */}
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-200">
                              <span>T: <strong>{item.t}</strong></span>
                              <div className="flex flex-col">
                                <button className="leading-none hover:text-purple-700 text-[9px] cursor-pointer" onClick={() => updateGutValue(item.id, 't', Math.min(5, item.t + 1))}>▲</button>
                                <button className="leading-none hover:text-purple-700 text-[9px] cursor-pointer" onClick={() => updateGutValue(item.id, 't', Math.max(1, item.t - 1))}>▼</button>
                              </div>
                            </div>

                            <span className="font-bold text-[#F05000]">{item.priority}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleAddGut} className="flex gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap md:flex-nowrap items-center">
                    <input 
                      type="text" 
                      placeholder="Adicionar novo problema à análise GUT..." 
                      className="bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#660099] outline-none flex-1"
                      value={newGutProb}
                      onChange={(e) => setNewGutProb(e.target.value)}
                    />
                    <div className="flex items-center gap-1.5 text-xs">
                      <label className="text-[10px] font-bold text-gray-500">G:</label>
                      <select 
                        value={newGutG} 
                        onChange={(e) => setNewGutG(Number(e.target.value))} 
                        className="bg-white border border-gray-300 rounded p-1 text-xs outline-none"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <label className="text-[10px] font-bold text-gray-500">U:</label>
                      <select 
                        value={newGutU} 
                        onChange={(e) => setNewGutU(Number(e.target.value))} 
                        className="bg-white border border-gray-300 rounded p-1 text-xs outline-none"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <label className="text-[10px] font-bold text-gray-500">T:</label>
                      <select 
                        value={newGutT} 
                        onChange={(e) => setNewGutT(Number(e.target.value))} 
                        className="bg-white border border-gray-300 rounded p-1 text-xs outline-none"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="bg-[#660099] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-sm cursor-pointer whitespace-nowrap">
                      + Inserir
                    </button>
                  </form>
                </div>

              </div>

              {/* SECTION: DIAGRAMA DE ISHIKAWA (ESPINHA DE PEIXE) COM INTERATIVIDADE */}
              <div className="border border-gray-200 rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2 flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#660099] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-5 h-5 text-purple-700" /> Diagrama de Ishikawa Inteligente (Espinha de Peixe)
                    </h3>
                    <p className="text-[11px] text-[#555555]">
                      Mapeamento estruturado das 6 principais dimensões que causam o <strong>Retrabalho Extracalculado de 6%</strong>. Toque em uma categoria abaixo para adicionar nova causa raiz.
                    </p>
                  </div>
                  <span className="text-[10px] bg-red-100 text-[#F05000] px-2 py-0.5 rounded font-black">
                    Problema Central: Alto Índice de Retrabalho
                  </span>
                </div>

                {/* Grid model that replicates fishbone outline visually */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 bg-purple-50/20 p-4 rounded-xl relative border border-dashed border-purple-100">
                  
                  {ishikawaCategories.map((cat) => (
                    <div 
                      key={cat.key} 
                      className={`bg-white p-4 rounded-xl shadow-xs border transition-all cursor-pointer ${selectedIshikawaCat === cat.key ? 'ring-2 ring-[#660099] border-[#660099]' : 'border-gray-200 hover:border-purple-300'}`}
                      onClick={() => setSelectedIshikawaCat(cat.key)}
                    >
                      <div className="flex items-center gap-1.5 border-b border-purple-100 pb-2 mb-2">
                        <span className="p-1 rounded bg-purple-100 text-[#660099]">
                          <Info className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="font-bold text-xs text-purple-950 uppercase">{cat.title}</h4>
                      </div>

                      <ul className="space-y-1.5">
                        {cat.causes.map((cause, cidx) => (
                          <li key={cidx} className="text-[10.5px] text-gray-700 flex items-start gap-1">
                            <span className="text-[#F05000] text-sm leading-none">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                </div>

                {/* Sub-form to contribute causes directly onto Ishikawa */}
                <form onSubmit={handleAddIshikawaCause} className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Inserir causa em:</span>
                    <select 
                      className="bg-white border border-gray-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-[#660099] outline-none"
                      value={selectedIshikawaCat}
                      onChange={(e) => setSelectedIshikawaCat(e.target.value)}
                    >
                      {ishikawaCategories.map((c) => (
                        <option key={c.key} value={c.key}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 flex-1 sm:flex-auto">
                    <input 
                      type="text" 
                      placeholder="Identifique nova causa observada em campo..." 
                      className="bg-white border border-gray-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-[#660099] outline-none flex-1"
                      value={newIshikawaCause}
                      onChange={(e) => setNewIshikawaCause(e.target.value)}
                    />
                    <button type="submit" className="bg-[#660099] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap">
                      Confirmar Causa
                    </button>
                  </div>
                </form>

              </div>

            </div>
          )}

          {/* TAB 4: CONTROLE ESTATÍSTICO DE PROCESSO (CEP) */}
          {activeTab === 'cep' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#660099]">CEP — Controle Estatístico de Processo</h2>
                  <p className="text-xs text-[#555555]">Gráfico estatístico semanal para rastreamento de variações de causa comum vs causa especial.</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-[#00875A] text-xs font-bold px-3 py-1 rounded">Segurança de Qualidade Ativa</span>
                </div>
              </div>

              {/* THE CORE CEP GRAPH - BUILT USING GORGEOUS RESPONSIVE SVG */}
              <div className="border border-gray-200 rounded-2xl p-4 md:p-5 bg-white">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-purple-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Carta de Controle Shewhart — Retrabalho em Equipe de Campo (%)
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 block"></span> LSC: 6.6%</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-600 block"></span> LC (Méd.): 6.0%</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 block"></span> LIC: 5.4%</span>
                  </div>
                </div>

                {/* SVG CEP Dynamic Chart Graphic */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 relative h-[250px] overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
                    
                    {/* Horizon grid Lines */}
                    {/* LIC Line (5.4) -> maps to 180px */}
                    <line x1="0" y1="170" x2="800" y2="170" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4" />
                    <text x="5" y="165" fill="#3b82f6" className="text-[9px] font-bold">LIC = 5.4%</text>

                    {/* Central Line (6.0) -> maps to 120px */}
                    <line x1="0" y1="120" x2="800" y2="120" stroke="#16a34a" strokeWidth="2" />
                    <text x="5" y="115" fill="#16a34a" className="text-[9px] font-bold">LC (Média) = 6.0%</text>

                    {/* LSC Line (6.6) -> maps to 70px */}
                    <line x1="0" y1="70" x2="800" y2="70" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4" />
                    <text x="5" y="65" fill="#ef4444" className="text-[9px] font-bold">LSC = 6.6%</text>

                    {/* Dynamic data plotting lines based on state */}
                    {(() => {
                      const totalWidth = 800;
                      const segmentWidth = totalWidth / (cepWeeks.length + 1);
                      const points: string[] = [];

                      return (
                        <>
                          {/* Render the lines connecting the data points */}
                          {cepWeeks.map((pt, idx) => {
                            const x = segmentWidth * (idx + 1);
                            // Mapping rework values (e.g. 5.2 to LSC scaling logic)
                            // 6.0 center maps to 120. Every 0.1 rework change is 8 verticalpx
                            const diff = pt.rework - 6.0;
                            const y = 120 - (diff * 83.3);
                            points.push(`${x},${y}`);

                            return (
                              <g key={pt.week}>
                                {/* Point Bubble dot */}
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r={pt.status === 'FORA DO' ? '6' : '4'} 
                                  fill={pt.status === 'FORA DO' ? '#ef4444' : pt.status === 'Atenção' ? '#f97316' : '#660099'} 
                                  className={pt.status === 'FORA DO' ? 'animate-pulse' : ''}
                                />
                                {/* Value popup text above point */}
                                <text x={x - 10} y={y - 8} fill="#33004D" className="text-[8px] font-black">{pt.rework}%</text>
                                {/* Week label */}
                                <text x={x - 15} y="230" fill="#666" className="text-[8px] font-medium">{pt.week.replace('Semana ', 'S')}</text>
                              </g>
                            );
                          })}

                          {/* Polyline plotting actual historical progression */}
                          <polyline 
                            fill="none" 
                            stroke="#660099" 
                            strokeWidth="2" 
                            points={points.join(' ')} 
                          />
                        </>
                      );
                    })()}

                  </svg>
                </div>

                <div className="mt-3 text-[10px] text-gray-500 font-medium leading-relaxed">
                  💡 <strong>Interpretação Estatística:</strong> A variação é predominantemente estável, demonstrando controle operacional, exceto na <strong>Semana 6 (6.8%)</strong>, identificada como Causa Especial transitória tratada através de vistoria de emergência.
                </div>
              </div>

              {/* TWO GRID ROW: VERIFICATION CHECKSHEET & CONTROLLER REGISTRATION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Checks List */}
                <div className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#660099] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-5 h-5 text-purple-700" /> Folha de Verificação — Totalização Semanal de Ocorrências
                    </h3>
                    <p className="text-[11px] text-[#555555] mb-4">
                      Rastreamento consolidado das incidências de erro nos últimos 4 turnos semanais.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700 border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase font-black tracking-wider text-[9px] border-b border-gray-100">
                          <th className="px-2 py-2">Tipo de Ocorrência</th>
                          <th className="px-2 py-2 text-center">S1</th>
                          <th className="px-2 py-2 text-center">S2</th>
                          <th className="px-2 py-2 text-center">S3</th>
                          <th className="px-2 py-2 text-center">S4</th>
                          <th className="px-2 py-2 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {folhaDeVerificacao.map((item, idx) => {
                          const total = item.w1 + item.w2 + item.w3 + item.w4;
                          return (
                            <tr key={idx} className="hover:bg-purple-50/5 text-[11px]">
                              <td className="px-2 py-1.5 font-semibold text-gray-800">{item.cause}</td>
                              <td className="px-2 py-1.5 text-center font-mono text-gray-500">{item.w1}</td>
                              <td className="px-2 py-1.5 text-center font-mono text-gray-500">{item.w2}</td>
                              <td className="px-2 py-1.5 text-center font-mono text-gray-500">{item.w3}</td>
                              <td className="px-2 py-1.5 text-center font-mono text-gray-500">{item.w4}</td>
                              <td className="px-2 py-1.5 text-center font-extrabold text-[#660099] font-mono">{total}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[9px] text-gray-400 mt-2 block">Legenda: S = Semana de amostragem de vistorias.</p>
                </div>

                {/* Point registration form */}
                <div className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between bg-purple-50/10">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#660099] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Edit3 className="w-5 h-5 text-purple-700" /> Lançar Nova Medição Estatística (CEP)
                    </h3>
                    <p className="text-[11px] text-[#555555] mb-4">
                      Selecione amostragem e insira a porcentagem geral de retrabalho encontrada na semana corrente para apuração imediata.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-3">
                    <p className="text-xs font-semibold text-gray-700">Equipe de Qualidade São Paulo:</p>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Média Geral Esperada:</span>
                        <strong className="text-green-600 font-mono">6.0%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Limite de Alarme Superior (LSC):</span>
                        <strong className="text-red-600 font-mono">6.6%</strong>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleAddCepValue} className="flex gap-2 mt-4 flex-col sm:flex-row">
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Ex: 5.7" 
                      className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#660099] outline-none flex-1 font-mono font-bold"
                      value={newCepValue}
                      onChange={(e) => setNewCepValue(e.target.value)}
                    />
                    <button type="submit" className="bg-[#660099] text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase shadow-sm cursor-pointer whitespace-nowrap">
                      Plotar no Gráficos
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: CO-PILOTO IA GESTÃO DE QUALIDADE VIVO */}
          {activeTab === 'copilot' && (
            <div className="space-y-4 flex flex-col flex-1 h-full">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-[#660099] flex items-center gap-1.5">
                    <MessageSquare className="w-6 h-6 text-purple-600" /> Co-Piloto Operacional de Qualidade Vivo
                  </h2>
                  <p className="text-xs text-[#555555]">Sistemas inteligentes de feedback e consultoria operacional integrados para solução de anomalias.</p>
                </div>
                <div className="text-[10px] bg-purple-100 text-[#660099] p-1 px-2.5 rounded font-mono font-bold">
                  Gemini API Proxy / Offline Fallback ATIVO
                </div>
              </div>

              {/* Chat Conversation Console */}
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-4 overflow-y-auto max-h-[350px] space-y-4 flex flex-col scroll-smooth">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-3xs ${
                      msg.sender === 'ai' 
                        ? 'bg-purple-100/90 text-purple-950 self-start border border-purple-200' 
                        : 'bg-[#660099] text-white self-end font-semibold'
                    }`}
                  >
                    {/* Prefix marker */}
                    <div className="text-[9px] font-black uppercase tracking-wider mb-1 opacity-60 flex justify-between gap-4">
                      <span>{msg.sender === 'ai' ? '🤖 Consultora de Operações Vivo' : '👤 Qualidade Operações'}</span>
                      <span className="font-mono font-normal">{msg.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="bg-purple-100/45 text-purple-950 rounded-2xl p-3 text-xs self-start italic border border-purple-200/50 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-700" /> Analisando causas estatísticas e estruturando sugestões...
                  </div>
                )}
              </div>

              {/* Chat interactive inputs */}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Selecione ou pergunte: 'Como o Pareto ajuda?', 'Diagnóstico do TMA', 'Criar plano de ação'..." 
                  className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#660099] outline-none flex-1 font-medium"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="bg-[#660099] text-white hover:bg-purple-800 transition-all font-bold text-xs uppercase px-5 py-2.5 rounded-lg shadow-md cursor-pointer whitespace-nowrap"
                >
                  Enviar Chat
                </button>
              </form>

              {/* Predefined prompt helpers */}
              <div className="flex flex-wrap gap-2 text-[10px] items-center pt-2">
                <span className="text-gray-400 font-bold uppercase">Sugestões rápidas:</span>
                <button 
                  type="button" 
                  className="bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded font-bold transition-all cursor-pointer"
                  onClick={() => { setChatInput('Causa raiz do retrabalho e análise de Pareto'); }}
                >
                  Análise de Pareto 80/20
                </button>
                <button 
                  type="button" 
                  className="bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded font-bold transition-all cursor-pointer"
                  onClick={() => { setChatInput('Como resolver o desvio crítico do TMA?'); }}
                >
                  Reduzir TMA de Campo
                </button>
                <button 
                  type="button" 
                  className="bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded font-bold transition-all cursor-pointer"
                  onClick={() => { setChatInput('Sugestões corporativas para a Matriz GUT'); }}
                >
                  Exemplo da Matriz GUT
                </button>
              </div>

            </div>
          )}

          {/* SHARED FOOTER IN WORKSPACE CONTAINER */}
          <footer className="mt-6 border-t border-gray-100 pt-4 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-400">
            <span>Gestão Operacional de Qualidade Vivo Telefônica • Todos os direitos reservados.</span>
            <span className="font-mono text-[10px] text-[#660099] mt-2 md:mt-0 bg-purple-50 px-2.5 py-1 rounded border border-purple-100 font-extrabold pb-1">
              Ref: ISO 9001 / Telecomunicações PSR / São Paulo SP 2026
            </span>
          </footer>

        </section>

      </main>

    </div>
  );
}
