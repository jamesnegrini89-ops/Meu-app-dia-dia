const MODULE_CONFIGS = {
  chronos: {
    title: "Chronos Sync",
    subtitle: "Mapeamento Temporal e Sincronização de Escalas",
    icon: "navigation",
    color: "from-indigo-500 to-purple-600",
    placeholder: "Forneça os vetores de turnos operacionais ou janelas domésticas para análise estrutural...",
    systemInstruction: "Você é a inteligência artificial Chronos Sync. Sua tarefa é otimizar rotinas complexas e escalas de turnos. Forneça análises de tempo limpas, profissionais e altamente organizadas, destacando as janelas ideais de convivência e descanso."
  },
  guardiao: {
    title: "Guardião Preditivo",
    subtitle: "Análise de Sistemas e Diagnósticos Técnicos",
    icon: "shield",
    color: "from-cyan-500 to-blue-600",
    placeholder: "Insira telemetria mecânica ou parâmetros residenciais para verificação preditiva...",
    systemInstruction: "Você é o módulo Guardião Preditivo. Forneça guias operacionais de engenharia e manutenção doméstica extremamente limpos, em listas enumeradas passo a passo, detalhando as ferramentas exatas necessárias para soluções práticas."
  },
  horizonte: {
    title: "Horizonte Líquido",
    subtitle: "Projeção Patrimonial e Vetores de Juros Compostos",
    icon: "trending-up",
    color: "from-emerald-500 to-teal-600",
    placeholder: "Insira valores de aportes financeiros, taxas de CDI ou metas estruturais para simulação...",
    systemInstruction: "Você é o simulador analítico Horizonte Líquido. Traduza variáveis econômicas em modelos preditivos de crescimento patrimonial com foco estratégico de longo prazo. Seja puramente matemático e focado na clareza do avanço temporal."
  },
  filaviva: {
    title: "FilaViva",
    subtitle: "Simulador de Densidade Dinâmica de Fluxo",
    icon: "zap",
    color: "from-amber-500 to-orange-600",
    placeholder: "Insira a densidade atual da fila e tempo operacional médio de atendimento...",
    systemInstruction: "Você é o sistema FilaViva. Otimize os fluxos de atendimento com cálculos de probabilidade exatos sobre filas de espera. Escreva modelos de comunicação automotivos ideais para notificar clientes externos."
  },
  duvidas: {
    title: "Terminal de Ajuda",
    subtitle: "Interface de Suporte e Explicação de Subsistemas",
    icon: "help-circle",
    color: "from-slate-700 to-slate-900",
    placeholder: "Qual parâmetro operacional ou instrução de prompt você deseja decodificar?",
    systemInstruction: "Você é o Terminal de Ajuda integrado. Explique com máxima clareza as mecânicas operacionais de todos os módulos do Nexus Hub."
  }
};


// Modelo estável com camada gratuita na Gemini Developer API.
const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';

// Ordem de preferência para modelos de texto que possuem camada gratuita.
// A lista efetivamente exibida será cruzada com os modelos liberados para a chave.
const PREFERRED_FREE_TEXT_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

const RETIRED_OR_UNSAFE_DEFAULT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-lite-preview-09-2025'
];

class NexusApp {
  constructor() {
    this.currentView = 'chronos';
    this.apiKey = localStorage.getItem('gemini_api_key') || '';

    const storedModel = this.normalizeModelName(localStorage.getItem('nexus_model') || '');
    const mustMigrateModel = !storedModel || this.isRetiredModel(storedModel);

    this.selectedModel = mustMigrateModel ? DEFAULT_GEMINI_MODEL : storedModel;

    // Corrige automaticamente instalações que ainda guardaram um modelo antigo no localStorage.
    if (mustMigrateModel) {
      localStorage.setItem('nexus_model', this.selectedModel);
    }

    this.isDarkMode = localStorage.getItem('nexus_theme') !== 'light'; 
    this.init();
  }

  normalizeModelName(modelName) {
    return String(modelName || '')
      .trim()
      .replace(/^models\//, '');
  }

  isRetiredModel(modelName) {
    const name = this.normalizeModelName(modelName);
    return RETIRED_OR_UNSAFE_DEFAULT_MODELS.includes(name) || /^gemini-(1\.5|2\.0)-/i.test(name);
  }

  isTextGenerationModel(model) {
    const name = this.normalizeModelName(model && model.name);
    const methods = model && Array.isArray(model.supportedGenerationMethods)
      ? model.supportedGenerationMethods
      : [];

    if (!methods.includes('generateContent')) return false;

    // Exclui motores especializados que não servem para o chat de texto deste app.
    return !/(embedding|image|imagen|veo|lyria|tts|live|audio|robotics|computer-use|deep-research)/i.test(name);
  }

  escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  getFriendlyApiError(status, apiMessage, modelName) {
    const message = apiMessage || 'Erro desconhecido da API.';

    if (status === 400) {
      return `Requisição inválida para o modelo ${modelName}. Detalhes: ${message}`;
    }
    if (status === 403) {
      return `A chave foi recusada. Verifique se ela pertence à Gemini API e se as restrições da chave permitem acesso. Detalhes: ${message}`;
    }
    if (status === 404) {
      return `O modelo ${modelName} não existe, foi desativado ou não está liberado para esta chave. Use “Buscar Modelos Liberados” nas configurações. Detalhes: ${message}`;
    }
    if (status === 429) {
      return `A cota gratuita ou o limite de requisições foi atingido. Aguarde a renovação da cota ou tente outro modelo gratuito liberado. Detalhes: ${message}`;
    }

    return message;
  }

  init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    }
    
    if (localStorage.getItem('nexus_theme') === null) {
      localStorage.setItem('nexus_theme', 'dark');
      this.isDarkMode = true;
    }

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    this.switchView(this.currentView);
  }

  toggleDarkMode() {
    const html = document.documentElement;
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('nexus_theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('nexus_theme', 'light');
    }

    const icon = document.getElementById('theme-icon');
    if(icon) {
      icon.setAttribute('data-lucide', this.isDarkMode ? 'sun' : 'moon');
      lucide.createIcons();
    }
  }

  async fetchModels(btn) {
    const key = document.getElementById('api-key-input').value.trim();
    if (!key) return alert("Por favor, cole a chave de API primeiro!");
    
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin inline-block mr-2"></i><span>Acessando Gemini API...</span>`;
    if (window.lucide) lucide.createIcons();

    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        headers: {
          'x-goog-api-key': key
        }
      });

      const rawBody = await res.text();
      let data = {};

      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        throw new Error(`A API respondeu em formato inesperado (HTTP ${res.status}).`);
      }
      
      if (!res.ok) {
        const apiMessage = data.error && data.error.message
          ? data.error.message
          : 'Erro ao conectar com a API.';
        throw new Error(this.getFriendlyApiError(res.status, apiMessage, this.selectedModel));
      }

      const validModels = Array.isArray(data.models)
        ? data.models.filter(model => this.isTextGenerationModel(model))
        : [];

      if (validModels.length === 0) {
        throw new Error('A chave foi aceita, mas nenhum modelo compatível com geração de texto foi encontrado.');
      }

      const availableNames = [...new Set(
        validModels.map(model => this.normalizeModelName(model.name)).filter(Boolean)
      )];

      // Exibe somente os modelos gratuitos conhecidos, desde que estejam liberados para a chave.
      const freeAvailableNames = PREFERRED_FREE_TEXT_MODELS.filter(name => availableNames.includes(name));
      const orderedNames = freeAvailableNames.length > 0
        ? freeAvailableNames
        : availableNames.sort();

      const datalistHtml = orderedNames
        .map(name => `<option value="${this.escapeHtml(name)}"></option>`)
        .join('');

      document.getElementById('discovered-models').innerHTML = datalistHtml;

      const selectedField = document.getElementById('model-select');
      const currentModel = this.normalizeModelName(selectedField.value || this.selectedModel);
      const preferredAvailableModel = PREFERRED_FREE_TEXT_MODELS.find(name => availableNames.includes(name));
      const nextModel = orderedNames.includes(currentModel)
        ? currentModel
        : (preferredAvailableModel || orderedNames[0]);

      selectedField.value = nextModel;
      this.selectedModel = nextModel;

      const listNotice = freeAvailableNames.length > 0
        ? 'A lista foi limitada aos modelos gratuitos conhecidos que estão liberados para esta chave.'
        : 'Nenhum modelo da lista gratuita conhecida apareceu; foram exibidos os modelos de texto liberados para a chave.';

      alert(`Scanner concluído!\nModelo selecionado: ${nextModel}\n\n${listNotice}`);

    } catch (e) {
      alert('Falha na busca: ' + e.message);
    } finally {
      btn.innerHTML = originalText;
      if (window.lucide) lucide.createIcons();
    }
  }

  saveSettings() {
    const key = document.getElementById('api-key-input').value.trim();
    const model = this.normalizeModelName(document.getElementById('model-select').value);
    
    if(!key) return alert("A chave de API não pode estar vazia.");
    if(!model) return alert("O modelo não pode estar vazio.");
    if(this.isRetiredModel(model)) {
      return alert(`O modelo ${model} foi desativado. Use ${DEFAULT_GEMINI_MODEL} ou clique em “Buscar Modelos Liberados”.`);
    }
    
    this.apiKey = key;
    this.selectedModel = model;
    
    localStorage.setItem('gemini_api_key', this.apiKey);
    localStorage.setItem('nexus_model', this.selectedModel);
    
    alert(`Configuração salva!\nModelo Ativo: ${this.selectedModel}`);
    this.switchView('chronos');
  }

  switchView(viewName) {
    this.currentView = viewName;
    const contentArea = document.getElementById('app-content');
    
    if (viewName === 'settings') {
      this.renderSettings(contentArea);
    } else if (viewName === 'duvidas') {
      this.renderHelp(contentArea);
    } else {
      this.renderModule(viewName, contentArea);
    }
    
    if (window.lucide) {
      lucide.createIcons();
      const icon = document.getElementById('theme-icon');
      if(icon) icon.setAttribute('data-lucide', this.isDarkMode ? 'sun' : 'moon');
      lucide.createIcons();
    }
    this.updateActiveNav(viewName);
  }

  updateActiveNav(viewName) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const box = btn.querySelector('.icon-box');
      if (btn.getAttribute('onclick').includes(viewName)) {
        btn.classList.remove('text-slate-400', 'dark:text-slate-500');
        btn.classList.add('text-indigo-600', 'dark:text-indigo-400');
        if(box) box.classList.add('bg-indigo-500/10', 'dark:bg-indigo-400/10', 'scale-110');
      } else {
        btn.classList.remove('text-indigo-600', 'dark:text-indigo-400');
        btn.classList.add('text-slate-400', 'dark:text-slate-500');
        if(box) box.classList.remove('bg-indigo-500/10', 'dark:bg-indigo-400/10', 'scale-110');
      }
    });
  }

  renderSettings(container) {
    container.innerHTML = `
      <div class="glass-effect rounded-3xl p-8 border max-w-xl mx-auto shadow-2xl border-white/20 dark:border-slate-700/30">
        <div class="flex items-center space-x-4 mb-6">
          <div class="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-md">
            <i data-lucide="sliders" class="w-6 h-6"></i>
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Núcleo de Sistema</h2>
            <p class="text-xs text-slate-400 dark:text-slate-400">Scanner de Modelos e Autenticação</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">1. Cole sua Chave de API</label>
            <input type="password" id="api-key-input" value="${this.apiKey}" placeholder="Cole sua chave aqui..." class="w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-900/50 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
          </div>
          
          <button onclick="app.fetchModels(this)" class="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white py-3.5 rounded-2xl font-bold tracking-wider uppercase text-xs shadow-md transition-all flex items-center justify-center space-x-2">
            <i data-lucide="search" class="w-4 h-4"></i>
            <span>Buscar Modelos Liberados (Opcional)</span>
          </button>
          
          <div id="model-dropdown-container" class="mt-4">
              <label class="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">2. Digite ou Selecione o Motor</label>
              <!-- Campo livre para digitação com lista de sugestões -->
              <input type="text" id="model-select" value="${this.selectedModel}" list="discovered-models" placeholder="ex: gemini-3.1-flash-lite" class="w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-900/50 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
              <datalist id="discovered-models"></datalist>
              <p class="text-[9px] text-slate-400 dark:text-slate-500 mt-2">Dica: O padrão configurado é o "gemini-3.1-flash-lite", modelo estável com camada gratuita. A disponibilidade final depende dos modelos liberados para sua chave.</p>
          </div>

          <button onclick="app.saveSettings()" class="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white py-4 rounded-2xl font-bold tracking-wider uppercase text-xs shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-6">
            Salvar e Iniciar
          </button>
        </div>
      </div>
    `;
  }

  renderHelp(container) {
    const config = MODULE_CONFIGS['duvidas'];
    container.innerHTML = `
      <div class="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        <div class="glass-effect rounded-3xl p-8 border shadow-xl">
          <div class="flex items-center space-x-3 mb-8">
            <div class="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <i data-lucide="book-open" class="w-6 h-6"></i>
            </div>
            <div>
              <h2 class="text-xl font-black tracking-wider text-slate-900 dark:text-white uppercase">Arquivos de Instrução</h2>
              <p class="text-xs text-slate-400">Manual operacional de subsistemas</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div class="p-5 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-white/20 dark:border-slate-800/50">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center mb-2"><i data-lucide="navigation" class="w-4 h-4 mr-2 text-indigo-500"></i> Chronos Sync</h3>
              <p class="text-slate-500 dark:text-slate-400 text-xs">Cruza dados brutos de escalas e turnos para isolar janelas ótimas de convivência familiar.</p>
            </div>
            <div class="p-5 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-white/20 dark:border-slate-800/50">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center mb-2"><i data-lucide="shield" class="w-4 h-4 mr-2 text-cyan-500"></i> Guardião Preditivo</h3>
              <p class="text-slate-500 dark:text-slate-400 text-xs">Gera diagnósticos mecânicos preventivos e dosagens químicas estruturadas passo a passo.</p>
            </div>
            <div class="p-5 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-white/20 dark:border-slate-800/50">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center mb-2"><i data-lucide="trending-up" class="w-4 h-4 mr-2 text-emerald-500"></i> Horizonte Líquido</h3>
              <p class="text-slate-500 dark:text-slate-400 text-xs">Simula projeções exatas de crescimento temporal de capital através de modelos matemáticos.</p>
            </div>
            <div class="p-5 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-white/20 dark:border-slate-800/50">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center mb-2"><i data-lucide="zap" class="w-4 h-4 mr-2 text-amber-500"></i> FilaViva</h3>
              <p class="text-slate-500 dark:text-slate-400 text-xs">Processa algoritmos de fluxo para reduzir tempo de espera físico através de notificações preditivas.</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-950 text-slate-100 rounded-3xl p-8 shadow-2xl border border-slate-800 animate-glow">
           <div class="flex items-center space-x-3 mb-4">
              <div class="p-2 bg-indigo-600 rounded-xl text-white">
                <i data-lucide="help-circle" class="w-5 h-5"></i>
              </div>
              <div>
                <h2 class="text-lg font-black uppercase tracking-wider">Terminal Interativo</h2>
                <p class="text-xs text-slate-500">Consulte qualquer dúvida sobre a inteligência do app</p>
              </div>
            </div>
            
            <div class="mt-4">
              <textarea id="module-input" rows="3" placeholder="${config.placeholder}" class="w-full p-4 border border-slate-800 rounded-2xl bg-slate-900 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition placeholder-slate-600 font-mono"></textarea>
            </div>

            <button onclick="app.callGemini('duvidas')" class="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-3.5 rounded-2xl font-bold uppercase text-xs tracking-widest hover:brightness-110 transition shadow-lg">
              Executar Consulta
            </button>

            <div id="loading-indicator" class="hidden mt-6 text-xs text-slate-500 items-center justify-center space-x-2">
              <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400"></i>
              <span class="font-mono">Processando requisição...</span>
            </div>
            <div id="output-area" class="mt-6 text-sm text-slate-300 leading-relaxed font-mono max-h-60 overflow-y-auto border-t border-slate-900 pt-4"></div>
        </div>
      </div>
    `;
  }

  renderModule(moduleName, container) {
    const config = MODULE_CONFIGS[moduleName];
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <div class="glass-effect rounded-3xl p-6 border shadow-xl flex flex-col justify-between h-full min-h-[350px]">
            <div>
              <div class="flex items-center space-x-3 mb-4">
                <div class="p-3 bg-gradient-to-br ${config.color} text-white rounded-2xl shadow-md">
                  <i data-lucide="${config.icon}" class="w-5 h-5"></i>
                </div>
                <div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-wide uppercase">${config.title}</h2>
                  <p class="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider">${config.subtitle}</p>
                </div>
              </div>
              <div class="mt-4">
                <textarea id="module-input" rows="7" placeholder="${config.placeholder}" class="w-full p-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/50 dark:bg-slate-900/30 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition shadow-inner"></textarea>
              </div>
            </div>
            <button onclick="app.callGemini('${moduleName}')" class="w-full mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center space-x-2">
              <i data-lucide="cpu" class="w-4 h-4"></i>
              <span>Processar Matriz</span>
            </button>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="glass-effect rounded-3xl p-6 border shadow-xl min-h-[450px] flex flex-col h-full">
            <div class="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex justify-between items-center">
              <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Painel de Resposta Neural</span>
              <div id="loading-indicator" class="hidden text-xs text-slate-500 dark:text-slate-400 items-center space-x-2">
                <i data-lucide="refresh-cw" class="w-3 h-3 animate-spin text-indigo-500"></i>
                <span class="font-mono">Processando...</span>
              </div>
            </div>
            <div id="output-area" class="text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-4 flex-1 overflow-y-auto pr-2">
              <div class="text-slate-400 dark:text-slate-600 text-center py-24">
                <i data-lucide="terminal" class="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse"></i>
                Aguardando vetor de entrada para inicialização.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async callGemini(moduleName) {
    if (!this.apiKey) {
      alert("Acesso Negado. Insira a Chave de API nas configurações.");
      this.switchView('settings');
      return;
    }

    const inputElement = document.getElementById('module-input');
    const userInput = inputElement ? inputElement.value.trim() : '';
    if (!userInput) return;

    const config = MODULE_CONFIGS[moduleName];
    const loading = document.getElementById('loading-indicator');
    const outputArea = document.getElementById('output-area');

    if (!config || !loading || !outputArea) {
      console.error('Interface ou configuração do módulo não encontrada:', moduleName);
      return;
    }

    const modelName = this.normalizeModelName(this.selectedModel) || DEFAULT_GEMINI_MODEL;
    this.selectedModel = modelName;

    loading.classList.remove('hidden');
    loading.classList.add('flex');
    outputArea.innerHTML = `<div class="text-slate-400 dark:text-slate-500 font-mono animate-pulse">Conectando ao modelo: ${this.escapeHtml(modelName)}...</div>`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;

      // systemInstruction é aceito pelo endpoint generateContent atual; não deve ser limitado às versões 1.5/2.0/2.5.
      const payload = {
        systemInstruction: {
          parts: [{ text: config.systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userInput }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const rawBody = await response.text();
      let data = {};

      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        throw new Error(`A API respondeu em formato inesperado (HTTP ${response.status}).`);
      }

      if (!response.ok) {
        const apiMessage = data.error && data.error.message
          ? data.error.message
          : 'Erro desconhecido da API.';
        throw new Error(this.getFriendlyApiError(response.status, apiMessage, modelName));
      }

      const candidate = data.candidates && data.candidates[0];
      const parts = candidate && candidate.content && Array.isArray(candidate.content.parts)
        ? candidate.content.parts
        : [];

      // Modelos atuais podem dividir a resposta em várias partes; não assuma que o texto está apenas em parts[0].
      const rawText = parts
        .filter(part => typeof part.text === 'string' && part.thought !== true)
        .map(part => part.text)
        .join('\n')
        .trim();

      if (rawText) {
        const textColorClass = moduleName === 'duvidas'
          ? 'text-slate-300 font-mono'
          : 'text-slate-800 dark:text-slate-200';
        const strongColorClass = moduleName === 'duvidas'
          ? 'text-white'
          : 'text-indigo-600 dark:text-indigo-400';

        outputArea.innerHTML = `<div class="prose max-w-none ${textColorClass}">${this.formatMarkdown(rawText, strongColorClass)}</div>`;
      } else {
        const blockReason = data.promptFeedback && data.promptFeedback.blockReason;
        const finishReason = candidate && candidate.finishReason;
        const reason = blockReason || finishReason || 'resposta sem conteúdo textual';

        outputArea.innerHTML = `<div class="text-red-500 font-mono">O Google não retornou texto. Motivo: ${this.escapeHtml(reason)}.</div>`;
      }
    } catch (error) {
      const message = error && error.name === 'AbortError'
        ? 'A solicitação ultrapassou 45 segundos e foi cancelada. Tente novamente.'
        : (error && error.message ? error.message : 'Falha desconhecida na conexão.');

      outputArea.innerHTML = `
        <div class="text-red-500 dark:text-red-400 font-mono border border-red-500/30 p-4 rounded-xl bg-red-500/10">
          <strong>Falha ao consultar o Gemini:</strong><br><br>
          <span class="text-xs">${this.escapeHtml(message)}</span>
        </div>`;
    } finally {
      clearTimeout(timeoutId);
      loading.classList.remove('flex');
      loading.classList.add('hidden');
    }
  }

  formatMarkdown(text, strongColorClass) {
    const safeText = this.escapeHtml(text);

    return safeText
      .replace(/\*\*(.*?)\*\*/gs, `<strong class="font-bold ${strongColorClass}">$1</strong>`)
      .replace(/\*(.*?)\*/gs, '<em class="italic opacity-80">$1</em>')
      .replace(/\n/g, '<br>');
  }
}

const app = new NexusApp();
