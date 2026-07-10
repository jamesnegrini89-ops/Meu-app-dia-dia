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

class NexusApp {
  constructor() {
    this.currentView = 'chronos';
    this.apiKey = localStorage.getItem('gemini_api_key') || '';
    this.isDarkMode = localStorage.getItem('nexus_theme') !== 'light'; 
    this.init();
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

  saveApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('gemini_api_key', this.apiKey);
    alert('Matriz de chaves sincronizada com sucesso!');
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
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Núcleo de Criptografia</h2>
            <p class="text-xs text-slate-400 dark:text-slate-400">Autenticação direta com modelos neurais</p>
          </div>
        </div>
        
        <div class="space-y-5">
          <div>
            <label class="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">Sua Chave de API Gemini</label>
            <input type="password" id="api-key-input" value="${this.apiKey}" placeholder="Cole sua chave aqui..." class="w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-900/50 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
          </div>
          <button onclick="app.saveApiKey(document.getElementById('api-key-input').value)" class="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white py-4 rounded-2xl font-bold tracking-wider uppercase text-xs shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0">
            Sincronizar Chave
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
              <span class="font-mono" id="loading-text-help">Processando requisição analítica...</span>
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
                <span class="font-mono" id="loading-text">Processando...</span>
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
      alert("Núcleo sem autenticação. Insira a Chave de API nas configurações.");
      this.switchView('settings');
      return;
    }

    const userInput = document.getElementById('module-input').value;
    if (!userInput.trim()) return;

    const config = MODULE_CONFIGS[moduleName];
    const loading = document.getElementById('loading-indicator');
    const loadingText = document.getElementById('loading-text') || document.getElementById('loading-text-help');
    const outputArea = document.getElementById('output-area');

    loading.classList.remove('hidden');
    loading.classList.add('flex');
    outputArea.innerHTML = `<div class="text-slate-400 dark:text-slate-500 font-mono animate-pulse">Iniciando protocolo de conexão...</div>`;

    try {
      if(loadingText) loadingText.innerText = "Mapeando permissões da API...";
      
      // PASSO 1: O APLICATIVO DESCOBRE QUAL MODELO ELE PODE USAR
      const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const modelsResponse = await fetch(modelsUrl);
      const modelsData = await modelsResponse.json();
      
      if (!modelsResponse.ok) {
         throw new Error(modelsData.error ? modelsData.error.message : "Chave de API inválida ou revogada pelo Google.");
      }

      // Filtra apenas os modelos do Google que geram texto
      const validModels = modelsData.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"));
      
      if (validModels.length === 0) {
          throw new Error("Sua chave de API é válida, mas o Google não liberou acesso a nenhum modelo de texto para ela.");
      }

      // Escolhe o melhor modelo que foi aprovado (preferência para o 1.5 Flash, depois 1.5 Pro, depois 1.0 Pro)
      let targetModel = validModels[0].name;
      const flashModel = validModels.find(m => m.name === 'models/gemini-1.5-flash');
      const proModel = validModels.find(m => m.name === 'models/gemini-1.5-pro');
      const legacyPro = validModels.find(m => m.name === 'models/gemini-1.0-pro');
      
      if (flashModel) targetModel = flashModel.name;
      else if (proModel) targetModel = proModel.name;
      else if (legacyPro) targetModel = legacyPro.name;

      if(loadingText) loadingText.innerText = `Conectando ao ${targetModel.split('/')[1]}...`;

      // PASSO 2: FAZ A REQUISIÇÃO COM O MODELO PERFEITO
      const url = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${this.apiKey}`;
      
      let payload = {};
      
      // O modelo 1.0 Pro mais antigo requer instruções de um jeito diferente dos modelos 1.5
      if (targetModel.includes("1.5")) {
           payload = {
              contents: [{ role: "user", parts: [{ text: userInput }] }],
              systemInstruction: { parts: [{ text: config.systemInstruction }] }
           };
      } else {
           payload = {
              contents: [{ role: "user", parts: [{ text: `[INSTRUÇÕES DE COMPORTAMENTO DA IA]:\n${config.systemInstruction}\n\n[MENSAGEM DO USUÁRIO]:\n${userInput}` }] }]
           };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      loading.classList.remove('flex');
      loading.classList.add('hidden');
      if(loadingText) loadingText.innerText = "Processando...";

      if (!response.ok) {
        let errorMsg = data.error && data.error.message ? data.error.message : "Erro desconhecido da API.";
        throw new Error(errorMsg);
      }

      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
        let rawText = data.candidates[0].content.parts[0].text;
        let textColorClass = moduleName === 'duvidas' ? 'text-slate-300 font-mono' : 'text-slate-800 dark:text-slate-200';
        let strongColorClass = moduleName === 'duvidas' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400';
        
        outputArea.innerHTML = `<div class="prose max-w-none ${textColorClass}">${this.formatMarkdown(rawText, strongColorClass)}</div>`;
      } else {
        outputArea.innerHTML = `<div class="text-red-500 font-mono">Erro: O Google retornou dados vazios.</div>`;
      }
    } catch (error) {
      loading.classList.remove('flex');
      loading.classList.add('hidden');
      if(loadingText) loadingText.innerText = "Processando...";
      outputArea.innerHTML = `
        <div class="text-red-500 dark:text-red-400 font-mono border border-red-500/30 p-4 rounded-xl bg-red-500/10 shadow-inner">
            <strong>Falha Crítica Detectada:</strong><br><br>
            <span class="text-xs">${error.message}</span>
        </div>`;
    }
  }

  formatMarkdown(text, strongColorClass) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, `<strong class="font-bold ${strongColorClass}">$1</strong>`)
      .replace(/\*(.*?)\*/g, '<em class="italic opacity-80">$1</em>');
  }
}

const app = new NexusApp();
