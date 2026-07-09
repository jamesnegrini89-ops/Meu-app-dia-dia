// Configuração dos Módulos e Prompts do Gemini
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
    placeholder: "Descreva o comportamento do veículo (ex: ruído na correia) ou parâmetro residencial (ex: pH da piscina)...",
    systemInstruction: "Você é o módulo Guardião Preditivo AI. Especialista em diagnósticos DIY automotivos (motores, fluidos, correias) e manutenção residencial técnica (piscinas, climatização). Forneça guias passo a passo claros, listas de ferramentas necessárias e ações preventivas baseadas em dados práticos."
  },
  horizonte: {
    title: "Horizonte Líquido",
    subtitle: "Planejamento Patrimonial de Longo Prazo (Foco 2041)",
    icon: "line-chart",
    placeholder: "Digite o aporte atual, variação de taxas (CDI, Tesouro) ou simulação de metas...",
    systemInstruction: "Você é o módulo Horizonte Líquido AI. Especialista em estratégias patrimoniais de longo prazo focadas em juros compostos com horizonte até 2041. Traduza eventos de mercado em recalibragem de metas de forma matemática e visual. Não dê conselhos de compra, foque na clareza do crescimento temporal do dinheiro."
  },
  filaviva: {
    title: "FilaViva",
    subtitle: "Motor de Projeção Dinâmica para Atendimentos",
    icon: "users",
    placeholder: "Insira o fluxo atual de clientes ou tempo médio de atendimento para cálculo de fluxo dinâmico...",
    systemInstruction: "Você é o módulo FilaViva AI. Especialista em otimização de fluxos de atendimento, filas em tempo real e agendamentos eficientes. Ajude a calcular previsões exatas de tempo de espera e crie mensagens de notificação preditivas ideais para clientes."
  }
};

class NexusApp {
  constructor() {
    this.currentView = 'chronos';
    this.apiKey = localStorage.getItem('gemini_api_key') || '';
    this.init();
  }

  init() {
    // Registrar Service Worker para suporte PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW Error:", err));
    }
    this.switchView(this.currentView);
  }

  getApiKey() {
    return this.apiKey;
  }

  saveApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    alert('Configurações de API salvas com sucesso!');
    this.switchView('chronos');
  }

  switchView(viewName) {
    this.currentView = viewName;
    const contentArea = document.getElementById('app-content');
    
    if (viewName === 'settings') {
      this.renderSettings(contentArea);
    } else {
      this.renderModule(viewName, contentArea);
    }
    
    if (window.lucide) {
      lucide.createIcons();
    }
    this.updateActiveNav(viewName);
  }

  updateActiveNav(viewName) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const span = btn.querySelector('span');
      if (btn.getAttribute('onclick').includes(viewName)) {
        btn.classList.remove('text-slate-400');
        btn.classList.add('text-slate-900');
        if (span) span.classList.add('font-semibold');
      } else {
        btn.classList.remove('text-slate-900');
        btn.classList.add('text-slate-400');
        if (span) span.classList.remove('font-semibold');
      }
    });
  }

  renderSettings(container) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-xl mx-auto">
        <div class="flex items-center space-x-3 mb-4">
          <i data-lucide="settings" class="w-6 h-6 text-slate-700"></i>
          <h2 class="text-xl font-bold text-slate-900">Configurações do Sistema</h2>
        </div>
        <p class="text-sm text-slate-500 mb-6">Insira sua chave de API do Gemini para interligar inteligência contextual em todos os módulos do aplicativo.</p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Chave de API Gemini</label>
            <input type="password" id="api-key-input" value="${this.apiKey}" placeholder="AIzaSy..." class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition">
          </div>
          <button onclick="app.saveApiKey(document.getElementById('api-key-input').value)" class="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition shadow-sm">
            Salvar Configurações
          </button>
        </div>
      </div>
    `;
  }

  renderModule(moduleName, container) {
    const config = MODULE_CONFIGS[moduleName];
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Coluna de Entrada de Dados -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div class="flex items-center space-x-3 mb-3">
              <div class="p-2 bg-slate-100 text-slate-800 rounded-xl">
                <i data-lucide="${config.icon}" class="w-5 h-5"></i>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900">${config.title}</h2>
                <p class="text-xs text-slate-400">${config.subtitle}</p>
              </div>
            </div>
            
            <div class="mt-4">
              <textarea id="module-input" rows="6" placeholder="${config.placeholder}" class="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none transition"></textarea>
            </div>

            <button onclick="app.callGemini('${moduleName}')" class="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-slate-800 transition shadow-sm">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Consultar Nexus AI</span>
            </button>
          </div>
        </div>

        <!-- Coluna de Resposta / Output Contextual -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
            <div class="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Painel Analítico Contextual</span>
              <div id="loading-indicator" class="hidden text-xs text-slate-500 items-center space-x-1">
                <i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i>
                <span>Processando...</span>
              </div>
            </div>
            <div id="output-area" class="text-slate-700 text-sm leading-relaxed space-y-4 flex-1 overflow-y-auto">
              <div class="text-slate-400 text-center py-12">
                <i data-lucide="arrow-left-right" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                Insira os dados operacionais ao lado para ativar o processamento da inteligência artificial.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async callGemini(moduleName) {
    if (!this.apiKey) {
      alert("Por favor, acesse as configurações e insira sua chave de API do Gemini.");
      this.switchView('settings');
      return;
    }

    const userInput = document.getElementById('module-input').value;
    if (!userInput.trim()) {
      alert("Por favor, preencha o campo de dados antes de processar.");
      return;
    }

    const config = MODULE_CONFIGS[moduleName];
    const loading = document.getElementById('loading-indicator');
    const outputArea = document.getElementById('output-area');

    loading.classList.remove('hidden');
    loading.classList.add('flex');
    outputArea.innerHTML = `<div class="text-slate-400">Consultando redes neuronais do Gemini para processamento avançado...</div>`;

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
        outputArea.innerHTML = `<div class="prose max-w-none text-slate-800">${this.formatMarkdown(rawText)}</div>`;
      } else {
        outputArea.innerHTML = `<div class="text-red-500">Formato de resposta inesperado. Verifique os dados inseridos.</div>`;
      }

    } catch (error) {
      console.error(error);
      loading.classList.remove('flex');
      loading.classList.add('hidden');
      outputArea.innerHTML = `<div class="text-red-500">Erro na comunicação com a API. Certifique-se de que sua chave está correta e ativa.</div>`;
    }
  }

  formatMarkdown(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  }
}

const app = new NexusApp();