const MODULE_CONFIGS = {
  chronos: {
    title: "Chronos Sync",
    subtitle: "Gestão Inteligente de Escalas e Janelas Familiares",
    icon: "calendar-days",
    placeholder: "Insira sua escala de turnos ou rotina familiar da semana aqui...",
    systemInstruction: "Você é o módulo Chronos Sync AI. Sua especialidade é analisar escalas de trabalho altamente complexas, turnos e rotinas familiares. Seu objetivo é identificar 'janelas de ouro' para o descanso e convívio familiar de alta qualidade. Retorne respostas estruturadas com tabelas de horários ótimos e sugestões de atividades de baixo esforço e alto impacto."
  },
  guardiao: {
    title: "Guardião Preditivo",
    subtitle: "Manutenção Inteligente de Carro & Casa",
    icon: "shield-check",
    placeholder: "Descreva o comportamento do veículo ou parâmetro residencial...",
    systemInstruction: "Você é o módulo Guardião Preditivo AI. Especialista em diagnósticos DIY automotivos (motores, fluidos, correias) e manutenção residencial técnica (piscinas, climatização). Forneça guias passo a passo claros, listas de ferramentas necessárias e ações preventivas baseadas em dados práticos."
  },
  horizonte: {
    title: "Horizonte Líquido",
    subtitle: "Planejamento Patrimonial de Longo Prazo (Foco 2041)",
    icon: "line-chart",
    placeholder: "Digite o aporte atual, variação de taxas ou simulação de metas...",
    systemInstruction: "Você é o módulo Horizonte Líquido AI. Especialista em estratégias patrimoniais de longo prazo focadas em juros compostos com horizonte até 2041. Traduza eventos de mercado em recalibragem de metas de forma matemática e visual."
  },
  filaviva: {
    title: "FilaViva",
    subtitle: "Motor de Projeção Dinâmica para Atendimentos",
    icon: "users",
    placeholder: "Insira o fluxo atual de clientes ou tempo médio de atendimento...",
    systemInstruction: "Você é o módulo FilaViva AI. Especialista em otimização de fluxos de atendimento, filas em tempo real e agendamentos eficientes. Ajude a calcular previsões exatas de tempo de espera e crie mensagens preditivas para clientes."
  },
  duvidas: {
    title: "Central de Dúvidas & Ajuda",
    subtitle: "Manual de uso e assistente virtual do Nexus Hub",
    icon: "help-circle",
    placeholder: "Qual sua dúvida sobre como usar uma ferramenta ou qual comando digitar?",
    systemInstruction: "Você é o assistente de ajuda interno do aplicativo Nexus Hub. Sua função é explicar como usar os 4 módulos principais: Chronos Sync, Guardião Preditivo, Horizonte Líquido e FilaViva. Responda de forma clara, prática e focada em ajudar a extrair o máximo do aplicativo. Forneça exemplos de prompts sempre que útil."
  }
};

class NexusApp {
  constructor() {
    this.currentView = 'chronos';
    this.apiKey = localStorage.getItem('gemini_api_key') || '';
    this.isDarkMode = localStorage.getItem('nexus_theme') === 'dark';
    this.init();
  }

  init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW Error:", err));
    }
    
    // Aplica o tema salvo ao iniciar
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
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

  getApiKey() {
    return this.apiKey;
  }

  saveApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    alert('Configurações salvas com sucesso!');
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
      // Garante que o ícone do tema está correto ao renderizar
      const icon = document.getElementById('theme-icon');
      if(icon) icon.setAttribute('data-lucide', this.isDarkMode ? 'sun' : 'moon');
      lucide.createIcons();
    }
    this.updateActiveNav(viewName);
  }

  updateActiveNav(viewName) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const span = btn.querySelector('span');
      if (btn.getAttribute('onclick').includes(viewName)) {
        btn.classList.remove('text-slate-400', 'dark:text-slate-500');
        btn.classList.add('text-slate-900', 'dark:text-white');
        if (span) span.classList.add('font-semibold');
      } else {
        btn.classList.remove('text-slate-900', 'dark:text-white');
        btn.classList.add('text-slate-400', 'dark:text-slate-500');
        if (span) span.classList.remove('font-semibold');
      }
    });
  }

  renderSettings(container) {
    container.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm max-w-xl mx-auto transition-colors duration-300">
        <div class="flex items-center space-x-3 mb-4">
          <i data-lucide="settings" class="w-6 h-6 text-slate-700 dark:text-slate-300"></i>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Configurações do Sistema</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Insira sua chave de API do Gemini.</p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Chave de API Gemini</label>
            <input type="password" id="api-key-input" value="${this.apiKey}" placeholder="AIzaSy..." class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors">
          </div>
          <button onclick="app.saveApiKey(document.getElementById('api-key-input').value)" class="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-white shadow-sm transition-colors">
            Salvar Configurações
          </button>
        </div>
      </div>
    `;
  }

  renderHelp(container) {
    const config = MODULE_CONFIGS['duvidas'];
    container.innerHTML = `
      <div class="grid grid-cols-1 gap-6 animate-fadeIn">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl">
              <i data-lucide="book-open" class="w-6 h-6"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">Manual do Nexus Hub</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Como extrair o máximo de cada ferramenta</p>
            </div>
          </div>
          
          <div class="space-y-6 text-sm text-slate-700 dark:text-slate-300">
            <div class="border-l-4 border-slate-400 dark:border-slate-500 pl-4">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center mb-1"><i data-lucide="calendar-days" class="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400"></i> Chronos Sync</h3>
              <p class="mb-2"><strong>Como usar:</strong> Insira seus plantões e horários de folga para buscar as melhores janelas para descansar ou realizar atividades.</p>
            </div>
            <div class="border-l-4 border-slate-400 dark:border-slate-500 pl-4">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center mb-1"><i data-lucide="shield-check" class="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400"></i> Guardião Preditivo</h3>
              <p class="mb-2"><strong>Como usar:</strong> Relate barulhos no motor, necessidade de peças ou cálculos para o pH e cloro da piscina.</p>
            </div>
            <div class="border-l-4 border-slate-400 dark:border-slate-500 pl-4">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center mb-1"><i data-lucide="line-chart" class="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400"></i> Horizonte Líquido</h3>
              <p class="mb-2"><strong>Como usar:</strong> Simule o crescimento de aportes para a estratégia de aposentadoria e recalcule metas até 2041.</p>
            </div>
            <div class="border-l-4 border-slate-400 dark:border-slate-500 pl-4">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center mb-1"><i data-lucide="users" class="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400"></i> FilaViva</h3>
              <p class="mb-2"><strong>Como usar:</strong> Adicione o tempo médio de serviço para descobrir quando o próximo cliente deve ser avisado.</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 dark:border-slate-800 transition-colors duration-300">
           <div class="flex items-center space-x-3 mb-4">
              <div class="p-2 bg-slate-800 dark:bg-slate-800 text-white rounded-xl">
                <i data-lucide="${config.icon}" class="w-5 h-5"></i>
              </div>
              <div>
                <h2 class="text-lg font-bold">${config.title}</h2>
                <p class="text-xs text-slate-400">${config.subtitle}</p>
              </div>
            </div>
            
            <div class="mt-4">
              <textarea id="module-input" rows="4" placeholder="${config.placeholder}" class="w-full p-4 border border-slate-700 rounded-xl bg-slate-800 dark:bg-slate-900 text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none transition placeholder-slate-500"></textarea>
            </div>

            <button onclick="app.callGemini('duvidas')" class="w-full mt-4 bg-white dark:bg-slate-200 text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-white transition shadow-sm">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Perguntar ao Assistente Virtual</span>
            </button>

            <div id="loading-indicator" class="hidden mt-6 text-xs text-slate-400 items-center justify-center space-x-2">
              <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>
              <span>Analisando sua dúvida...</span>
            </div>
            <div id="output-area" class="mt-6 text-sm text-slate-300 leading-relaxed max-h-64 overflow-y-auto"></div>
        </div>
      </div>
    `;
  }

  renderModule(moduleName, container) {
    const config = MODULE_CONFIGS[moduleName];
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
            <div class="flex items-center space-x-3 mb-3">
              <div class="p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl">
                <i data-lucide="${config.icon}" class="w-5 h-5"></i>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white">${config.title}</h2>
                <p class="text-xs text-slate-400 dark:text-slate-400">${config.subtitle}</p>
              </div>
            </div>
            <div class="mt-4">
              <textarea id="module-input" rows="6" placeholder="${config.placeholder}" class="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 resize-none transition-colors"></textarea>
            </div>
            <button onclick="app.callGemini('${moduleName}')" class="w-full mt-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-sm">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Consultar Nexus AI</span>
            </button>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px] flex flex-col transition-colors duration-300">
            <div class="border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex justify-between items-center">
              <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Painel Analítico Contextual</span>
              <div id="loading-indicator" class="hidden text-xs text-slate-500 dark:text-slate-400 items-center space-x-1">
                <i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i>
                <span>Processando...</span>
              </div>
            </div>
            <div id="output-area" class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4 flex-1 overflow-y-auto">
              <div class="text-slate-400 dark:text-slate-500 text-center py-12">
                <i data-lucide="arrow-left-right" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                Insira os dados ao lado para ativar a IA.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async callGemini(moduleName) {
    if (!this.apiKey) {
      alert("Por favor, insira sua chave de API nas configurações.");
      this.switchView('settings');
      return;
    }

    const userInput = document.getElementById('module-input').value;
    if (!userInput.trim()) return alert("Preencha o campo antes de processar.");

    const config = MODULE_CONFIGS[moduleName];
    const loading = document.getElementById('loading-indicator');
    const outputArea = document.getElementById('output-area');

    loading.classList.remove('hidden');
    loading.classList.add('flex');
    outputArea.innerHTML = `<div class="text-slate-400 dark:text-slate-500">Processando...</div>`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userInput }] }],
          systemInstruction: { parts: [{ text: config.systemInstruction }] }
        })
      });

      const data = await response.json();
      loading.classList.remove('flex');
      loading.classList.add('hidden');

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        let rawText = data.candidates[0].content.parts[0].text;
        
        // Define as cores do texto baseando-se se estamos no módulo de ajuda (fundo escuro fixo) ou nos outros módulos (fundo dinâmico)
        let textColorClass = '';
        let strongColorClass = '';
        
        if (moduleName === 'duvidas') {
          textColorClass = 'text-slate-200';
          strongColorClass = 'text-white';
        } else {
          textColorClass = 'text-slate-800 dark:text-slate-300';
          strongColorClass = 'text-slate-900 dark:text-white';
        }
        
        outputArea.innerHTML = `<div class="prose max-w-none ${textColorClass}">${this.formatMarkdown(rawText, strongColorClass)}</div>`;
      } else {
        outputArea.innerHTML = `<div class="text-red-500 dark:text-red-400">Erro de formato.</div>`;
      }
    } catch (error) {
      loading.classList.remove('flex');
      loading.classList.add('hidden');
      outputArea.innerHTML = `<div class="text-red-500 dark:text-red-400">Erro de API. Verifique a chave.</div>`;
    }
  }

  formatMarkdown(text, strongColorClass) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, `<strong class="font-bold ${strongColorClass}">$1</strong>`)
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  }
}

const app = new NexusApp();
