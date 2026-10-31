import React, { useState, useEffect } from 'react';

export default function App() {
  // Theme state: dark or light (White Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navigation active state
  const [activeNav, setActiveNav] = useState<string>('visao-geral');

  // Terminal state
  const [plate, setPlate] = useState<string>('BRA2E19');
  const [km, setKm] = useState<string>('38.450 km');
  const [uf, setUf] = useState<string>('SP - Capital');
  const [terminalAlert, setTerminalAlert] = useState<string | null>(null);

  // Margin Simulator state
  const [profile, setProfile] = useState<'lojista' | 'particular'>('lojista');
  const [compra, setCompra] = useState<number>(77000);
  const [prep, setPrep] = useState<number>(1800);
  const [venda, setVenda] = useState<number>(89200);

  // Modal / Toast states for CTA actions
  const [modalType, setModalType] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const handleProfileChange = (newProfile: 'lojista' | 'particular') => {
    setProfile(newProfile);
    if (newProfile === 'lojista') {
      setCompra(77000);
      setPrep(1800);
      setVenda(89200);
    } else {
      setCompra(83000);
      setPrep(600);
      setVenda(87400);
    }
  };

  const custoTotal = compra + prep;
  const margem = venda - custoTotal;
  const roi = custoTotal > 0 ? ((margem / custoTotal) * 100).toFixed(1) : '0.0';
  const custoRatio = venda > 0 ? Math.min(100, Math.max(10, (custoTotal / venda) * 100)) : 50;

  const handleRunQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setTerminalAlert(
      `Simulação executada com sucesso para a placa ${plate.toUpperCase()} (${km}). Carregando telemetria em tempo real.`
    );
    setTimeout(() => {
      setTerminalAlert(null);
    }, 4000);
  };

  const scrollToSection = (id: string, navKey: string) => {
    setActiveNav(navKey);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`text-on-surface antialiased min-h-screen transition-colors duration-200 ${theme === 'light' ? 'light bg-[#F8FAFC]' : 'dark bg-asphalt-black'}`}>
      {/* Toast Notification for Terminal Simulation */}
      {terminalAlert && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-graphite border border-electric-cyan/50 text-ice-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-electric-cyan text-[22px]">verified</span>
          <p className="text-body-sm font-medium">{terminalAlert}</p>
          <button
            onClick={() => setTerminalAlert(null)}
            className="text-cool-gray hover:text-white cursor-pointer ml-auto"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* FIXED HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-graphite/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] transition-colors">
        <div className="h-16 max-w-[1240px] mx-auto px-space-md lg:px-space-lg flex items-center justify-between">
          <div className="flex items-center gap-space-lg">
            <a
              className="flex items-center gap-space-sm cursor-pointer"
              onClick={() => scrollToSection('hero', 'visao-geral')}
            >
              <img
                alt={theme === 'light' ? 'logo-dark.png' : 'logo-white.png'}
                className={`h-8 w-auto object-contain transition-all ${
                  theme === 'light' ? 'filter invert hue-rotate-180 contrast-125 brightness-90' : ''
                }`}
                src="https://lh3.googleusercontent.com/aida/AEtjO1XgVJN6Gj-uZjk8Z7SHFNWi2r0uhIaDzG-vAHVMlwk70gN2DZ2wGVC6t-1mpZ0_yj9PGofzcDOkr1fNWj9noJcqSW8ySLYz9TjFHQdjkppF0updDj7Znn7u1kabZUmUB454CyYf_rpruhq4teIu2CFJ4Iji9mqdd_x9mmspIIPARaQByTHxBI0nFkWvo_iiJvNaxMnSraDdDBGvz8Lr1Hdva0EwDfZvHe_1MIpvrRHhiCI4vSU_3K6dhVUt"
              />
            </a>
            <nav className="hidden lg:flex items-center gap-space-xs">
              <button
                onClick={() => scrollToSection('hero', 'visao-geral')}
                className={`px-space-sm py-space-xs font-label-md text-label-md transition-colors cursor-pointer rounded ${
                  activeNav === 'visao-geral'
                    ? theme === 'light'
                      ? 'bg-slate-200/80 text-slate-900 font-semibold shadow-xs'
                      : 'bg-surface-container-high text-ice-white font-medium'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => scrollToSection('anatomia', 'comparativo-de-metricas')}
                className={`px-space-sm py-space-xs font-label-md text-label-md transition-colors cursor-pointer rounded ${
                  activeNav === 'comparativo-de-metricas'
                    ? theme === 'light'
                      ? 'bg-slate-200/80 text-slate-900 font-semibold shadow-xs'
                      : 'bg-surface-container-high text-ice-white font-medium'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Comparativo de Métricas
              </button>
              <button
                onClick={() => scrollToSection('simulador', 'simulador-de-margem')}
                className={`px-space-sm py-space-xs font-label-md text-label-md transition-colors cursor-pointer rounded ${
                  activeNav === 'simulador-de-margem'
                    ? theme === 'light'
                      ? 'bg-slate-200/80 text-slate-900 font-semibold shadow-xs'
                      : 'bg-surface-container-high text-ice-white font-medium'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Simulador de Margem
              </button>
              <button
                onClick={() => scrollToSection('precos', 'precos')}
                className={`px-space-sm py-space-xs font-label-md text-label-md transition-colors cursor-pointer rounded ${
                  activeNav === 'precos'
                    ? theme === 'light'
                      ? 'bg-slate-200/80 text-slate-900 font-semibold shadow-xs'
                      : 'bg-surface-container-high text-ice-white font-medium'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Preços
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-space-md">
            {/* White Mode / Dark Mode Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-full bg-deep-petrol border border-steel hover:border-electric-cyan flex items-center justify-center text-ice-white transition-colors cursor-pointer shadow-sm"
              title={theme === 'dark' ? 'Mudar para White Mode' : 'Mudar para Dark Mode'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <button
              onClick={() => scrollToSection('hero', 'visao-geral')}
              className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs bg-electric-cyan text-asphalt-black font-label-md text-label-md font-bold rounded hover:bg-primary transition-colors tracking-wide cursor-pointer"
            >
              Testar com 1 Carro
            </button>
            <div className="flex items-center gap-space-xs pl-space-xs">
              <div className="w-8 h-8 rounded-full bg-deep-petrol flex items-center justify-center overflow-hidden">
                <img
                  alt="Vencar Icon"
                  className="w-full h-full object-cover"
                  src="/apple-touch-icon.png"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full pt-16 bg-asphalt-black">
        <div className="flex flex-col w-full text-ice-white bg-asphalt-black selection:bg-electric-cyan selection:text-asphalt-black">
          
          {/* HERO SECTION WITH INTEGRATED 3D INSPECTION SCENE */}
          <section id="hero" className="relative w-full overflow-hidden pt-space-lg pb-space-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,199,212,0.12),rgba(11,16,21,0))] pointer-events-none"></div>
            <div className="max-w-[1240px] mx-auto px-space-md lg:px-space-lg">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
                
                {/* Left Column: Executive Value Proposition & Interactive Terminal */}
                <div className="lg:col-span-6 flex flex-col gap-space-lg z-10">
                  <div className="flex items-center gap-space-xs"></div>
                  <div className="space-y-space-sm">
                    <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-ice-white font-bold leading-none tracking-tight">
                      A Tabela FIPE precifica o modelo. <br />
                      <span className="bg-gradient-to-r from-electric-cyan via-secondary to-signal-lime bg-clip-text text-transparent">
                        A Vencar precifica o carro real.
                      </span>
                    </h1>
                    <p className="font-body-lg text-body-md lg:text-body-lg text-cool-gray max-w-xl">
                      Inteligência determinística para descobrir quanto este veículo realmente vale, cruzando anúncios ativos em tempo real, base histórica de leilões, laudos estruturais e velocidade de giro micro-regional.
                    </p>
                  </div>

                  {/* Compact Real Valuation Terminal */}
                  <div className="bg-graphite rounded-xl p-space-md shadow-2xl">
                    <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">terminal</span>
                        <span className="font-label-md text-label-md text-ice-white uppercase tracking-wider font-semibold">
                          Terminal de Liquidez Imediata
                        </span>
                      </div>
                      <span className="text-cool-gray font-label-sm text-label-sm">Consulta Instantânea</span>
                    </div>

                    <form className="grid grid-cols-1 sm:grid-cols-12 gap-space-sm" onSubmit={handleRunQuote}>
                      <div className="sm:col-span-4 flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-cool-gray uppercase">Placa Mercosul</label>
                        <div className="relative">
                          <input
                            className="w-full h-11 bg-deep-petrol rounded px-3 text-ice-white font-code-num text-body-md uppercase tracking-wider focus:outline-none focus:bg-surface-container-high transition-all"
                            id="inputPlate"
                            maxLength={7}
                            placeholder="ABC1D23"
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-5 flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-cool-gray uppercase">KM Real</label>
                        <input
                          className="w-full h-11 bg-deep-petrol rounded px-3 text-ice-white font-code-num text-body-md focus:outline-none focus:bg-surface-container-high transition-all"
                          id="inputKm"
                          placeholder="Ex: 45.000"
                          type="text"
                          value={km}
                          onChange={(e) => setKm(e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-3 flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-cool-gray uppercase">UF Pátio</label>
                        <select
                          className="w-full h-11 bg-deep-petrol rounded px-2 text-ice-white font-label-md text-label-md focus:outline-none focus:bg-surface-container-high cursor-pointer"
                          value={uf}
                          onChange={(e) => setUf(e.target.value)}
                        >
                          <option value="SP - Capital">SP - Capital</option>
                          <option value="RJ - Capital">RJ - Capital</option>
                          <option value="MG - BH">MG - BH</option>
                          <option value="PR - Curitiba">PR - Curitiba</option>
                          <option value="RS - POA">RS - POA</option>
                        </select>
                      </div>

                      <div className="sm:col-span-12 mt-1">
                        <button
                          className="w-full h-12 rounded bg-gradient-to-r from-electric-cyan to-cobalt-blue hover:from-primary hover:to-secondary-container text-asphalt-black font-title-md text-title-md font-bold tracking-tight flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] cursor-pointer"
                          type="submit"
                        >
                          <span className="material-symbols-outlined text-[20px] text-asphalt-black">query_stats</span>
                          Calcular Preço Real do Chassi
                        </button>
                      </div>
                    </form>

                    <div className="mt-space-sm pt-space-xs flex items-center justify-between text-cool-gray font-label-sm text-label-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-signal-lime">verified_user</span>
                        Sem consulta de crédito de score do proprietário
                      </span>
                      <span>Latência média: 420ms</span>
                    </div>
                  </div>

                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-3 gap-space-sm">
                    <div className="bg-deep-petrol rounded p-space-sm">
                      <span className="font-label-sm text-label-sm text-cool-gray block">Spread Assertivo Médio</span>
                      <span className="font-code-num text-headline-sm text-signal-lime">98.4%</span>
                    </div>
                    <div className="bg-deep-petrol rounded p-space-sm">
                      <span className="font-label-sm text-label-sm text-cool-gray block">Anúncios Auditados/Dia</span>
                      <span className="font-code-num text-headline-sm text-ice-white">1.8M</span>
                    </div>
                    <div className="bg-deep-petrol rounded p-space-sm">
                      <span className="font-label-sm text-label-sm text-cool-gray block">Tempo Médio de Giro</span>
                      <span className="font-code-num text-headline-sm text-electric-cyan">23 dias</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive 3D Inspection Shell with Telemetry HUD Overlays */}
                <div id="terminal-3d" className="lg:col-span-6 relative mt-space-lg lg:mt-0">
                  <div className="relative w-full rounded-xl bg-graphite p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                    <div className="w-full h-[580px] sm:h-[520px] rounded-2xl bg-gradient-to-b from-deep-petrol/60 to-surface-container-lowest border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_45%,rgba(0,199,212,0.18),rgba(11,16,21,0.9))] pointer-events-none"></div>
                      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-electric-cyan/10 blur-2xl rounded-full pointer-events-none"></div>
                      
                      {/* Jeep Renegade 3D Scan Video - perfectly framed on mobile and desktop */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center -translate-y-8 sm:translate-y-0">
                        <video
                          src="/assets/Jeep_Renegade_Scan_v5_textured_81c4e3b6.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls={false}
                          disablePictureInPicture
                          disableRemotePlayback
                          className="w-full h-[360px] sm:h-full object-contain p-2 sm:p-space-md filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] mix-blend-screen pointer-events-none select-none video-vignette-mask scale-110 sm:scale-100"
                        />
                      </div>

                      {/* Hotspot 1: Para-choque */}
                      <div className="absolute z-20 top-[52%] sm:top-[60%] left-[8%] sm:left-[16%] flex items-center gap-1.5 sm:gap-2 group">
                        <div className="relative flex items-center justify-center">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-coral-red/20 animate-ping absolute"></div>
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-coral-red border border-white flex items-center justify-center cursor-pointer shadow-lg"></div>
                        </div>
                        <div className="bg-graphite/95 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-coral-red/30 shadow-xl flex items-center gap-1 whitespace-nowrap">
                          <span className="material-symbols-outlined text-coral-red text-[12px] sm:text-[14px]">car_crash</span>
                          <span className="font-label-sm text-[10px] sm:text-label-sm text-ice-white font-medium">
                            Para-choque: <strong className="text-coral-red">-R$ 600</strong>
                          </span>
                        </div>
                      </div>

                      {/* Hotspot 2: Baixa KM */}
                      <div className="absolute z-20 top-[35%] sm:top-[42%] left-[10%] sm:left-[28%] flex items-center gap-1.5 sm:gap-2 group">
                        <div className="relative flex items-center justify-center">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-signal-lime/20 animate-ping absolute"></div>
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-signal-lime border border-white flex items-center justify-center cursor-pointer shadow-lg"></div>
                        </div>
                        <div className="bg-graphite/95 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-signal-lime/30 shadow-xl flex items-center gap-1 whitespace-nowrap">
                          <span className="material-symbols-outlined text-signal-lime text-[12px] sm:text-[14px]">speed</span>
                          <span className="font-label-sm text-[10px] sm:text-label-sm text-ice-white font-medium">
                            Baixa KM: <strong className="text-signal-lime">+R$ 1.600</strong>
                          </span>
                        </div>
                      </div>

                      {/* Hotspot 3: Demanda SP */}
                      <div className="absolute z-20 top-[20%] sm:top-[26%] right-[6%] sm:right-[22%] flex items-center gap-1.5 sm:gap-2 group">
                        <div className="relative flex items-center justify-center">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-electric-cyan/20 animate-ping absolute"></div>
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-electric-cyan border border-white flex items-center justify-center cursor-pointer shadow-lg"></div>
                        </div>
                        <div className="bg-graphite/95 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-electric-cyan/30 shadow-xl flex items-center gap-1 whitespace-nowrap">
                          <span className="material-symbols-outlined text-electric-cyan text-[12px] sm:text-[14px]">trending_up</span>
                          <span className="font-label-sm text-[10px] sm:text-label-sm text-ice-white font-medium">
                            Demanda SP: <strong className="text-electric-cyan">+R$ 900</strong>
                          </span>
                        </div>
                      </div>

                      {/* Top HUD Indicators */}
                      <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex items-center justify-between pointer-events-none z-30">
                        <div className="bg-graphite/90 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg flex items-center gap-2 sm:gap-3 shadow-xl">
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-signal-lime animate-ping"></div>
                          <div>
                            <span className="font-label-sm text-[9px] sm:text-label-sm text-cool-gray block">Chassi Identificado</span>
                            <span className="font-title-md text-xs sm:text-title-md text-ice-white font-semibold">
                              Jeep Renegade Sport 2022
                            </span>
                          </div>
                        </div>
                        <div className="bg-graphite/90 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-right shadow-xl">
                          <span className="font-label-sm text-[9px] sm:text-label-sm text-cool-gray block">Índice de Certeza</span>
                          <span className="font-code-num text-xs sm:text-title-md text-signal-lime font-bold">91% Confiança</span>
                        </div>
                      </div>

                      {/* Bottom HUD Output Card */}
                      <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 bg-graphite/95 backdrop-blur-xl rounded-xl p-3 sm:p-space-md shadow-2xl z-30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-space-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 sm:px-2 py-0.5 rounded font-label-sm text-[10px] sm:text-label-sm bg-signal-lime/10 text-signal-lime font-semibold">
                                Valor Auditado Vencar
                              </span>
                              <span className="font-body-sm text-[11px] sm:text-body-sm text-cool-gray line-through">
                                FIPE: R$ 94.200
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-0.5 sm:mt-1">
                              <span className="text-2xl sm:text-display-lg-mobile text-ice-white font-bold tracking-tight">
                                R$ 87.400
                              </span>
                              <span className="font-body-sm text-xs sm:text-body-sm text-coral-red font-semibold">
                                - R$ 6.800 (-7,2%)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-deep-petrol px-2 sm:px-space-sm py-1.5 sm:py-2 rounded text-center flex-1 sm:flex-initial">
                              <span className="font-label-sm text-[9px] sm:text-label-sm text-cool-gray block">Margem Mesa</span>
                              <span className="font-code-num text-xs sm:text-title-md text-electric-cyan font-semibold">
                                R$ 10.400
                              </span>
                            </div>
                            <div className="bg-deep-petrol px-2 sm:px-space-sm py-1.5 sm:py-2 rounded text-center flex-1 sm:flex-initial">
                              <span className="font-label-sm text-[9px] sm:text-label-sm text-cool-gray block">Giro Médio</span>
                              <span className="font-code-num text-xs sm:text-title-md text-ice-white font-semibold">19d</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-electric-cyan/20 rounded-full blur-md"></div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION 2: HUD ANATOMIA DA PRECIFICAÇÃO (REAL-TIME VALUE COMPOSITION) */}
          <section id="anatomia" className="w-full py-space-xl bg-surface-container-lowest relative">
            <div className="max-w-[1240px] mx-auto px-space-md lg:px-space-lg">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
                <div>
                  <span className="font-label-sm text-label-sm uppercase text-electric-cyan tracking-widest block mb-1">
                    Decomposição Preditiva
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-ice-white font-bold">
                    Anatomia da Precificação Dinâmica
                  </h2>
                  <p className="font-body-md text-body-md text-cool-gray max-w-2xl mt-1">
                    Cada real de desvio em relação ao benchmark teórico é justificado por variáveis empíricas do veículo inspecionado.
                  </p>
                </div>
                <div className="flex items-center gap-2"></div>
              </div>

              {/* Main Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                
                {/* Left: Granular Value Variance List */}
                <div className="lg:col-span-7 bg-graphite rounded-xl p-space-md lg:p-space-lg flex flex-col justify-between">
                  <div className="space-y-space-md">
                    <div className="flex items-center justify-between pb-space-sm">
                      <span className="font-title-md text-title-md text-ice-white font-semibold">
                        Variações Calculadas sobre o Chassi #{plate}
                      </span>
                      <span className="font-label-sm text-label-sm text-cool-gray">Auditado via API DETRAN + Vistorias</span>
                    </div>

                    <div className="space-y-space-sm">
                      {/* Item 1: Baixa KM */}
                      <div className="flex items-center justify-between p-space-sm rounded bg-deep-petrol hover:bg-surface-container-high transition-colors">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-8 h-8 rounded bg-signal-lime/10 flex items-center justify-center text-signal-lime">
                            <span className="material-symbols-outlined text-[18px]">speed</span>
                          </div>
                          <div>
                            <span className="font-body-md text-body-md text-ice-white font-medium block">
                              Baixa Quilometragem Relativa
                            </span>
                            <span className="font-body-sm text-body-sm text-cool-gray">
                              {km} vs média de 54.000 km para ano 2022
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-code-num text-title-md text-signal-lime font-bold">+ R$ 1.600</span>
                          <span className="block font-label-sm text-label-sm text-signal-lime/80">+1.8% FIPE</span>
                        </div>
                      </div>

                      {/* Item 2: Histórico Concessionária */}
                      <div className="flex items-center justify-between p-space-sm rounded bg-deep-petrol hover:bg-surface-container-high transition-colors">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-8 h-8 rounded bg-signal-lime/10 flex items-center justify-center text-signal-lime">
                            <span className="material-symbols-outlined text-[18px]">menu_book</span>
                          </div>
                          <div>
                            <span className="font-body-md text-body-md text-ice-white font-medium block">
                              Revisões Carimbadas em Autorizada
                            </span>
                            <span className="font-body-sm text-body-sm text-cool-gray">
                              10k, 20k e 30k comprovadas em livro digital
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-code-num text-title-md text-signal-lime font-bold">+ R$ 1.100</span>
                          <span className="block font-label-sm text-label-sm text-signal-lime/80">+1.2% FIPE</span>
                        </div>
                      </div>

                      {/* Item 3: Demanda Regional */}
                      <div className="flex items-center justify-between p-space-sm rounded bg-deep-petrol hover:bg-surface-container-high transition-colors">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-8 h-8 rounded bg-signal-lime/10 flex items-center justify-center text-signal-lime">
                            <span className="material-symbols-outlined text-[18px]">trending_up</span>
                          </div>
                          <div>
                            <span className="font-body-md text-body-md text-ice-white font-medium block">
                              Pressão de Demanda Regional ({uf})
                            </span>
                            <span className="font-body-sm text-body-sm text-cool-gray">
                              SUV Médio com velocidade 2.1x acima da média estadual
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-code-num text-title-md text-signal-lime font-bold">+ R$ 900</span>
                          <span className="block font-label-sm text-label-sm text-signal-lime/80">+1.0% FIPE</span>
                        </div>
                      </div>

                      {/* Item 4: Avaria em Para-choque */}
                      <div className="flex items-center justify-between p-space-sm rounded bg-deep-petrol hover:bg-surface-container-high transition-colors">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-8 h-8 rounded bg-coral-red/10 flex items-center justify-center text-coral-red">
                            <span className="material-symbols-outlined text-[18px]">car_crash</span>
                          </div>
                          <div>
                            <span className="font-body-md text-body-md text-ice-white font-medium block">
                              Dano Cosmético em Para-choque Dianteiro
                            </span>
                            <span className="font-body-sm text-body-sm text-cool-gray">
                              Identificado por visão computacional no laudo de entrada
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-code-num text-title-md text-coral-red font-bold">- R$ 600</span>
                          <span className="block font-label-sm text-label-sm text-coral-red/80">-0.7% FIPE</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-space-md pt-space-sm flex items-center justify-between text-cool-gray font-label-sm text-label-sm border-t border-steel/40">
                    <span>
                      Soma dos ajustes de chassi: <strong className="text-signal-lime">+ R$ 3.000</strong>
                    </span>
                    <span>
                      Ajuste de mercado deflacionário FIPE: <strong className="text-coral-red">- R$ 9.800</strong>
                    </span>
                  </div>
                </div>

                {/* Right: Actionable Pillars for Dealer Desk */}
                <div className="lg:col-span-5 flex flex-col gap-space-sm">
                  {/* Pilar 1 */}
                  <div className="bg-graphite rounded-xl p-space-md flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded font-label-sm text-label-sm bg-electric-cyan/20 text-electric-cyan uppercase font-bold tracking-wide">
                        Pilar de Compra / Entrada
                      </span>
                      <span className="material-symbols-outlined text-electric-cyan">verified</span>
                    </div>
                    <div className="mt-1">
                      <span className="font-label-sm text-label-sm text-cool-gray block">
                        Teto Máximo Recomendado para Compra
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-display-lg-mobile text-display-lg-mobile text-ice-white font-bold">
                          R$ 77.000
                        </span>
                        <span className="font-label-md text-label-md text-signal-lime">Margem Alvo 13.5%</span>
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-cool-gray">
                      Garante absorção de custos de recondicionamento e taxa de intermediação protegida.
                    </p>
                  </div>

                  {/* Pilar 2 */}
                  <div className="bg-graphite rounded-xl p-space-md flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded font-label-sm text-label-sm bg-warm-amber/20 text-warm-amber uppercase font-bold tracking-wide">
                        Pilar de Giro Imediato
                      </span>
                      <span className="material-symbols-outlined text-warm-amber">bolt</span>
                    </div>
                    <div className="mt-1">
                      <span className="font-label-sm text-label-sm text-cool-gray block">
                        Preço de Liquidez Rápida (Até 10 dias)
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-display-lg-mobile text-display-lg-mobile text-warm-amber font-bold">
                          R$ 84.500
                        </span>
                        <span className="font-label-md text-label-md text-ice-white">Desconto Tático 3.3%</span>
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-cool-gray">
                      Recomendado para fechar meta de faturamento mensal ou reduzir custo financeiro de estoque.
                    </p>
                  </div>

                  {/* Pilar 3 */}
                  <div className="bg-graphite rounded-xl p-space-md flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded font-label-sm text-label-sm bg-cobalt-blue/20 text-secondary uppercase font-bold tracking-wide">
                        Pilar de Vitrine Digital
                      </span>
                      <span className="material-symbols-outlined text-secondary">storefront</span>
                    </div>
                    <div className="mt-1">
                      <span className="font-label-sm text-label-sm text-cool-gray block">
                        Preço Sugerido para Publicação em Portais
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="font-display-lg-mobile text-display-lg-mobile text-ice-white font-bold">
                          R$ 89.900
                        </span>
                        <span className="font-label-md text-label-md text-secondary">Margem Bruta R$ 12.900</span>
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-cool-gray">
                      Posicionamento no quartil de maior clique com espaço programado para margem de contra-proposta.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION 3: COMPARATIVO VISUAL INTERATIVO FIPE VS VENCAR */}
          <section className="w-full py-space-xl relative">
            <div className="max-w-[1240px] mx-auto px-space-md lg:px-space-lg">
              <div className="text-center max-w-3xl mx-auto mb-space-lg">
                <span className={`font-label-sm text-label-sm uppercase tracking-widest block mb-1 font-semibold ${
                  theme === 'light' ? 'text-emerald-700' : 'text-signal-lime'
                }`}>
                  Diferencial Metodológico
                </span>
                <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-ice-white font-bold">
                  O Custo Invisível de Comprar Carros pela Tabela FIPE
                </h2>
                <p className="font-body-lg text-body-md lg:text-body-lg text-cool-gray mt-2">
                  A FIPE é uma média declarada de anúncios do mês anterior com defasagem de até 45 dias. Em mercados dinâmicos, essa cegueira custa entre R$ 4.000 e R$ 14.000 por transação.
                </p>
              </div>

              {/* High-Contrast Comparison Table / Split Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-stretch">
                
                {/* The Old Way: FIPE Estática */}
                <div className={`rounded-xl p-space-lg flex flex-col justify-between relative overflow-hidden transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-50 border-2 border-slate-300 shadow-sm text-slate-800'
                    : 'bg-graphite/70 border border-steel/40 text-cool-gray'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-coral-red/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div>
                    <div className="flex items-center justify-between pb-space-sm mb-space-md">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-coral-red">history</span>
                        <span className={`font-title-md text-title-md font-bold ${
                          theme === 'light' ? 'text-slate-900' : 'text-cool-gray'
                        }`}>
                          Tabela FIPE Clássica
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold border ${
                        theme === 'light'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-coral-red/10 text-coral-red border-coral-red/20'
                      }`}>
                        Defasagem Crítica
                      </span>
                    </div>

                    <div className="space-y-space-md">
                      <div>
                        <span className={`font-label-sm text-label-sm block font-medium ${
                          theme === 'light' ? 'text-slate-600' : 'text-cool-gray'
                        }`}>
                          Referência Declarada para o Modelo
                        </span>
                        <span className={`font-code-num text-headline-md font-bold ${
                          theme === 'light' ? 'text-slate-900' : 'text-cool-gray'
                        }`}>
                          R$ 94.200
                        </span>
                      </div>

                      <div className={`space-y-space-sm font-body-sm text-body-sm ${
                        theme === 'light' ? 'text-slate-700' : 'text-cool-gray'
                      }`}>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-coral-red text-[18px]">close</span>
                          <span>
                            <strong className={theme === 'light' ? 'text-slate-900 font-semibold' : 'text-white'}>Não enxerga o chassi:</strong> Não diferencia carro com 10.000 km de outro com 90.000 km na mesma safra.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-coral-red text-[18px]">close</span>
                          <span>
                            <strong className={theme === 'light' ? 'text-slate-900 font-semibold' : 'text-white'}>Defasagem de até 45 dias:</strong> Em períodos de queda de juros ou liquidações de montadoras, o preço da FIPE fica congelado no passado.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-coral-red text-[18px]">close</span>
                          <span>
                            <strong className={theme === 'light' ? 'text-slate-900 font-semibold' : 'text-white'}>Cego à micro-região:</strong> Aplica o mesmo valor em São Paulo (alta liquidez) e no interior do Amazonas.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-coral-red text-[18px]">close</span>
                          <span>
                            <strong className={theme === 'light' ? 'text-slate-900 font-semibold' : 'text-white'}>Ignora histórico de pátio:</strong> Desconsidera se o modelo leva 12 ou 65 dias para girar na sua praça.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-space-lg pt-space-md -mx-space-lg -mb-space-lg p-space-md rounded-b-xl ${
                    theme === 'light' ? 'bg-slate-200/80 border-t border-slate-300' : 'bg-deep-petrol/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-label-md text-label-md font-medium ${
                        theme === 'light' ? 'text-slate-800' : 'text-cool-gray'
                      }`}>
                        Risco de Pátio Encalhado:
                      </span>
                      <span className="font-code-num text-title-md text-coral-red font-bold">ALTO (48+ dias)</span>
                    </div>
                  </div>
                </div>

                {/* The Modern Way: Vencar Dynamic Pricing */}
                <div className={`rounded-xl p-space-lg flex flex-col justify-between relative overflow-hidden shadow-2xl transition-colors ${
                  theme === 'light'
                    ? 'bg-white border-2 border-electric-cyan shadow-[0_10px_30px_rgba(0,199,212,0.15)] text-slate-800'
                    : 'bg-graphite border border-steel'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-electric-cyan/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div>
                    <div className="flex items-center justify-between pb-space-sm mb-space-md">
                      <div className="flex items-center gap-2">
                        <img
                          alt={theme === 'light' ? 'logo-dark.png' : 'logo-white.png'}
                          className={`h-5 w-auto object-contain transition-all ${
                            theme === 'light' ? 'filter invert hue-rotate-180 contrast-125 brightness-90' : ''
                          }`}
                          src="https://lh3.googleusercontent.com/aida/AEtjO1XgVJN6Gj-uZjk8Z7SHFNWi2r0uhIaDzG-vAHVMlwk70gN2DZ2wGVC6t-1mpZ0_yj9PGofzcDOkr1fNWj9noJcqSW8ySLYz9TjFHQdjkppF0updDj7Znn7u1kabZUmUB454CyYf_rpruhq4teIu2CFJ4Iji9mqdd_x9mmspIIPARaQByTHxBI0nFkWvo_iiJvNaxMnSraDdDBGvz8Lr1Hdva0EwDfZvHe_1MIpvrRHhiCI4vSU_3K6dhVUt"
                        />
                      </div>
                      <span className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-bold ${
                        theme === 'light'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-400 shadow-xs'
                          : 'bg-signal-lime/20 text-signal-lime'
                      }`}>
                        Tempo Real e Determinístico
                      </span>
                    </div>

                    <div className="space-y-space-md">
                      <div>
                        <span className="font-label-sm text-label-sm text-cool-gray block">
                          Preço Real Auditado de Mercado
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className={`font-code-num text-headline-md font-bold ${
                            theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                          }`}>
                            R$ 87.400
                          </span>
                          <span className="font-label-md text-label-md text-electric-cyan font-semibold">Acurácia de 98.4%</span>
                        </div>
                      </div>

                      <div className={`space-y-space-sm font-body-sm text-body-sm ${
                        theme === 'light' ? 'text-slate-700' : 'text-on-surface'
                      }`}>
                        <div className="flex items-start gap-2">
                          <span className={`material-symbols-outlined text-[18px] ${
                            theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'
                          }`}>check_circle</span>
                          <span>
                            <strong className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Chassi &amp; Odômetro Individualizado:</strong> Valora a cada km e histórico específico de passagens e leilões.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={`material-symbols-outlined text-[18px] ${
                            theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'
                          }`}>check_circle</span>
                          <span>
                            <strong className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Micro-região Georreferenciada:</strong> Algoritmo analisa elasticidade de preço raio por raio (ex: Zona Sul vs ABC).
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={`material-symbols-outlined text-[18px] ${
                            theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'
                          }`}>check_circle</span>
                          <span>
                            <strong className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Velocidade de Giro Calibrada:</strong> Sugere preço de compra baseado no tempo meta de pátio (ex: saída em 23 dias).
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={`material-symbols-outlined text-[18px] ${
                            theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'
                          }`}>check_circle</span>
                          <span>
                            <strong className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Laudo Estrutural Integrado:</strong> Desconto peças repintadas, funilaria e avarias cosméticas detectadas.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-space-lg pt-space-md -mx-space-lg -mb-space-lg p-space-md rounded-b-xl ${
                    theme === 'light' ? 'bg-emerald-50/70 border-t border-emerald-200' : 'bg-deep-petrol'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-label-md text-label-md ${
                        theme === 'light' ? 'text-slate-700' : 'text-cool-gray'
                      }`}>
                        Proteção de Margem Líquida:
                      </span>
                      <span className={`font-code-num text-title-md font-bold ${
                        theme === 'light' ? 'text-emerald-700' : 'text-signal-lime'
                      }`}>
                        + R$ 6.800 Salvos na Compra
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION 4: SIMULADOR DE MARGEM DA MESA DE CAPTAÇÃO */}
          <section id="simulador" className="w-full py-space-xl bg-surface-container-lowest">
            <div className="max-w-[1240px] mx-auto px-space-md lg:px-space-lg">
              <div className="bg-graphite rounded-xl p-space-md lg:p-space-xl shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
                  
                  {/* Left Controls */}
                  <div className="lg:col-span-6 flex flex-col gap-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase text-electric-cyan tracking-widest block mb-1">
                        Simulador Financeiro
                      </span>
                      <h2 className="font-headline-md text-headline-md text-ice-white font-bold">
                        Defesa de Margem de Pátio
                      </h2>
                      <p className="font-body-md text-body-md text-cool-gray mt-1">
                        Configure os parâmetros de compra para visualizar em tempo real a margem bruta gerada na mesa de negociação.
                      </p>
                    </div>

                    {/* Profile Selector Toggle */}
                    <div className="flex items-center p-1 bg-deep-petrol rounded-lg max-w-md">
                      <button
                        className={`flex-1 py-2 px-3 rounded font-label-md text-label-md font-semibold transition-all cursor-pointer ${
                          profile === 'lojista'
                            ? 'bg-electric-cyan text-asphalt-black'
                            : 'text-cool-gray hover:text-ice-white'
                        }`}
                        onClick={() => handleProfileChange('lojista')}
                        type="button"
                      >
                        Concessionária / Lojista
                      </button>
                      <button
                        className={`flex-1 py-2 px-3 rounded font-label-md text-label-md font-medium transition-all cursor-pointer ${
                          profile === 'particular'
                            ? 'bg-electric-cyan text-asphalt-black font-semibold'
                            : 'text-cool-gray hover:text-ice-white'
                        }`}
                        onClick={() => handleProfileChange('particular')}
                        type="button"
                      >
                        Comprador Particular
                      </button>
                    </div>

                    {/* Sliders for interactive calculation */}
                    <div className="space-y-space-md">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-label-sm text-label-sm text-cool-gray uppercase">
                            Valor de Captação Pago (Compra)
                          </span>
                          <span className="font-code-num text-title-md text-ice-white font-bold">
                            R$ {compra.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <input
                          className="w-full custom-range-slider slider-compra"
                          max={85000}
                          min={65000}
                          step={500}
                          type="range"
                          value={compra}
                          onChange={(e) => setCompra(parseFloat(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-label-sm text-label-sm text-cool-gray uppercase">
                            Custo de Recondicionamento / Laudo
                          </span>
                          <span className="font-code-num text-title-md text-ice-white font-bold">
                            R$ {prep.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <input
                          className="w-full custom-range-slider slider-prep"
                          max={5000}
                          min={500}
                          step={100}
                          type="range"
                          value={prep}
                          onChange={(e) => setPrep(parseFloat(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-label-sm text-label-sm text-cool-gray uppercase">
                            Preço Alvo de Venda (Estoque)
                          </span>
                          <span className="font-code-num text-title-md text-ice-white font-bold">
                            R$ {venda.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <input
                          className="w-full custom-range-slider slider-venda"
                          max={98000}
                          min={80000}
                          step={500}
                          type="range"
                          value={venda}
                          onChange={(e) => setVenda(parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Chart / Waterfall Projection */}
                  <div className="lg:col-span-6 bg-deep-petrol rounded-xl p-space-md lg:p-space-lg flex flex-col justify-between mt-6 lg:mt-0">
                    <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                      <span className="font-label-md text-label-md text-cool-gray uppercase font-semibold">
                        Projeção da Mesa de Operação
                      </span>
                      <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${
                        theme === 'light'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-signal-lime/10 text-signal-lime'
                      }`}>
                        Margem Saudável
                      </span>
                    </div>

                    {/* Visualization Bars */}
                    <div className="space-y-space-md py-space-sm">
                      <div>
                        <div className="flex justify-between text-body-sm font-label-md text-cool-gray mb-1">
                          <span>Preço de Venda Projetado</span>
                          <span className="text-ice-white font-semibold">
                            R$ {venda.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="w-full h-5 bg-asphalt-black rounded overflow-hidden">
                          <div className="h-full bg-electric-cyan rounded" style={{ width: '100%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-body-sm font-label-md text-cool-gray mb-1">
                          <span>Custo Total de Entrada (Compra + Prep)</span>
                          <span className="text-coral-red font-semibold">
                            R$ {custoTotal.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="w-full h-5 bg-asphalt-black rounded overflow-hidden">
                          <div
                            className="h-full bg-steel rounded transition-all duration-300"
                            style={{ width: `${custoRatio}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Highlight Summary Card */}
                    <div className="mt-space-md bg-graphite rounded-lg p-space-md">
                      <div className="grid grid-cols-2 gap-space-sm">
                        <div>
                          <span className="font-label-sm text-label-sm text-cool-gray block">Margem Bruta Estimada</span>
                          <span
                            className={`font-headline-md text-headline-md font-bold ${
                              margem >= 0
                                ? theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'
                                : 'text-coral-red'
                            }`}
                          >
                            {margem >= 0 ? '+' : '-'} R$ {Math.abs(margem).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-label-sm text-label-sm text-cool-gray block">
                            ROI sobre Capital Empenhado
                          </span>
                          <span className="font-headline-md text-headline-md text-ice-white font-bold">
                            {roi}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-space-sm pt-space-xs flex items-center justify-between text-cool-gray font-label-sm text-label-sm border-t border-steel/40">
                        <span className="flex items-center gap-1">
                          <span className={`material-symbols-outlined text-[14px] ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>schedule</span>
                          Tempo projetado de estoque: <strong>21 dias</strong>
                        </span>
                        <span>Margem protegida</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: MODELO DE PRECIFICAÇÃO POR CRÉDITOS */}
          <section id="precos" className="w-full py-space-xl relative">
            <div className="max-w-[1240px] mx-auto px-space-md lg:px-space-lg">
              <div className="text-center max-w-3xl mx-auto mb-space-lg">
                <span className="font-label-sm text-label-sm uppercase text-electric-cyan tracking-widest block mb-1">
                  Precificação Descomplicada
                </span>
                <h2 className={`font-headline-lg text-headline-lg-mobile lg:text-headline-lg font-bold ${
                  theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                }`}>
                  Pague pelo que usar. Sem mensalidades surpresa.
                </h2>
                <p className={`font-body-lg text-body-md lg:text-body-lg mt-2 ${
                  theme === 'light' ? 'text-slate-600' : 'text-cool-gray'
                }`}>
                  Sem mensalidades obrigatórias ou contratos de fidelidade. Você adquire pacotes de consultas e consome no seu ritmo, ideal tanto para negociar 1 carro quanto para frotas inteiras.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
                
                {/* Plano 1: Starter */}
                <div className={`rounded-xl p-space-lg flex flex-col justify-between transition-all ${
                  theme === 'light'
                    ? 'bg-white border-2 border-slate-200 shadow-sm text-slate-800 hover:shadow-md'
                    : 'bg-graphite hover:bg-surface-container'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-space-sm">
                      <span className="font-label-md text-label-md text-cool-gray uppercase font-semibold">
                        Passe Inicial
                      </span>
                      <span className="material-symbols-outlined text-cool-gray">local_activity</span>
                    </div>
                    <h3 className={`font-headline-sm text-headline-sm font-bold ${
                      theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                    }`}>Starter</h3>
                    <p className={`font-body-sm text-body-sm mt-1 mb-space-md ${
                      theme === 'light' ? 'text-slate-600' : 'text-cool-gray'
                    }`}>
                      Para particulares ou avaliadores pontuais comprando seu próximo veículo.
                    </p>
                    <div className="flex items-baseline gap-1 mb-space-md">
                      <span className={`font-display-lg-mobile text-display-lg-mobile font-bold ${
                        theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                      }`}>R$ 49</span>
                      <span className="font-label-md text-label-md text-cool-gray">/ 10 consultas</span>
                    </div>

                    <div className={`space-y-space-sm font-body-sm text-body-sm pb-space-lg ${
                      theme === 'light' ? 'text-slate-700' : 'text-cool-gray'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">check</span>
                        <span>R$ 4,90 por consulta</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">check</span>
                        <span>Consulta completa por Placa ou Chassi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">check</span>
                        <span>Preço justo e liquidez imediata</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">check</span>
                        <span>Validade dos créditos: 12 meses</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setModalType('Plano Starter (10 Créditos - R$ 49)')}
                    className={`w-full h-11 rounded font-label-md text-label-md font-semibold transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-deep-petrol hover:bg-surface-container-high text-ice-white'
                    }`}
                  >
                    Adquirir 10 Créditos
                  </button>
                </div>

                {/* Plano 2: Pro Lojista (Destaque) */}
                <div className={`rounded-xl p-space-lg flex flex-col justify-between relative shadow-2xl scale-100 lg:scale-[1.03] z-10 transition-all ${
                  theme === 'light'
                    ? 'bg-white border-2 border-electric-cyan shadow-[0_12px_40px_rgba(0,199,212,0.18)] text-slate-800'
                    : 'bg-gradient-to-b from-graphite to-deep-petrol border border-steel'
                }`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-electric-cyan to-signal-lime text-asphalt-black font-label-sm text-label-sm font-bold uppercase px-3 py-0.5 rounded shadow">
                    Mais Escolhido por Lojas
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-space-sm mt-1">
                      <span className="font-label-md text-label-md text-electric-cyan uppercase font-bold">
                        Mesa de Captação
                      </span>
                      <span className={`material-symbols-outlined ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>verified</span>
                    </div>
                    <h3 className={`font-headline-sm text-headline-sm font-bold ${
                      theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                    }`}>
                      Pro Lojista
                    </h3>
                    <p className={`font-body-sm text-body-sm mt-1 mb-space-md ${
                      theme === 'light' ? 'text-slate-600' : 'text-cool-gray'
                    }`}>
                      Para revendas, agências multimarcas e corretores com giro ativo.
                    </p>
                    <div className="flex items-baseline gap-1 mb-space-md">
                      <span className={`font-display-lg-mobile text-display-lg-mobile font-bold ${
                        theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                      }`}>
                        R$ 290
                      </span>
                      <span className="font-label-md text-label-md text-cool-gray">/ 100 consultas</span>
                    </div>

                    <div className={`space-y-space-sm font-body-sm text-body-sm pb-space-lg ${
                      theme === 'light' ? 'text-slate-700' : 'text-ice-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>check</span>
                        <span>
                          <strong className={theme === 'light' ? 'text-slate-900' : 'text-white'}>R$ 2,90 por consulta</strong> (Economia de 41%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>check</span>
                        <span>Download de Dossiê PDF White-Label com seu logo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>check</span>
                        <span>Análise de Danos por Fotos (Visão Computacional)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>check</span>
                        <span>Múltiplos usuários da loja no mesmo saldo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>check</span>
                        <span>Créditos nunca expiram</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setModalType('Plano Pro Lojista (100 Créditos - R$ 290)')}
                    className="w-full h-12 rounded bg-electric-cyan hover:bg-primary text-asphalt-black font-title-md text-title-md font-bold tracking-tight shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    Adquirir 100 Créditos
                  </button>
                </div>

                {/* Plano 3: API Enterprise */}
                <div className={`rounded-xl p-space-lg flex flex-col justify-between transition-all ${
                  theme === 'light'
                    ? 'bg-white border-2 border-slate-200 shadow-sm text-slate-800 hover:shadow-md'
                    : 'bg-graphite hover:bg-surface-container'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-space-sm">
                      <span className="font-label-md text-label-md text-cool-gray uppercase font-semibold">
                        Volume &amp; Integração
                      </span>
                      <span className="material-symbols-outlined text-cobalt-blue">hub</span>
                    </div>
                    <h3 className={`font-headline-sm text-headline-sm font-bold ${
                      theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                    }`}>API Enterprise</h3>
                    <p className={`font-body-sm text-body-sm mt-1 mb-space-md ${
                      theme === 'light' ? 'text-slate-600' : 'text-cool-gray'
                    }`}>
                      Para frotistas, bancos, fintechs automotivas e portais de classificados.
                    </p>
                    <div className="flex items-baseline gap-1 mb-space-md">
                      <span className={`font-headline-md text-headline-md font-bold ${
                        theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                      }`}>Sob Demanda</span>
                    </div>

                    <div className={`space-y-space-sm font-body-sm text-body-sm pb-space-lg ${
                      theme === 'light' ? 'text-slate-700' : 'text-cool-gray'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">check</span>
                        <span>API RESTful de altíssima latência (&lt; 200ms)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">check</span>
                        <span>Cargas em lote de inventário por webhook</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">check</span>
                        <span>SLA de 99.98% de disponibilidade garantido</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-cyan text-[18px]">check</span>
                        <span>Faturamento pós-pago via fatura corporativa</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setModalType('Engenharia de Soluções API Enterprise')}
                    className="w-full h-11 rounded bg-cobalt-blue hover:bg-secondary-container text-pure-white font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                  >
                    Falar com Engenharia de Soluções
                  </button>
                </div>

              </div>

              {/* Trust Assurance Strip */}
              <div className={`mt-space-xl p-space-md rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-md transition-colors ${
                theme === 'light'
                  ? 'bg-white border-2 border-slate-200 shadow-sm'
                  : 'bg-graphite'
              }`}>
                <div className="flex items-center gap-3">
                  <img
                    alt="Vencar Seal"
                    className="w-9 h-9 object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwg3zCzXD1VnCgWqI9ToTcZfwXuhj-CcfUzz1UmzPvvCTIWKRQKwRo5LhZxCBi2eWUIBMaLHGyhd7mUaHNml07a6cXNiSZQk9HMMgiYoo7WQaw3iVtvRVa5sDtrLy8KklNfFeefyS_QdRdOK_MFPS6tkEr395VMgMLKfuKSHYrn7iuF4NZ3muUxdF5BLfKPR9TCR72Cyl_AATUVrfTu7p65TKcPfR462gi7f6VuVfcZvuIkthgrs0WeQ"
                  />
                  <div>
                    <span className={`font-title-md text-title-md font-semibold block ${
                      theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                    }`}>
                      Garantia de Utilidade Vencar
                    </span>
                    <span className={`font-body-sm text-body-sm ${
                      theme === 'light' ? 'text-slate-600' : 'text-cool-gray'
                    }`}>
                      Se a consulta não encontrar histórico suficiente para precificar, o crédito é estornado automaticamente.
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-4 font-label-md text-label-md whitespace-nowrap ${
                  theme === 'light' ? 'text-slate-700 font-medium' : 'text-cool-gray'
                }`}>
                  <span className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[18px] ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>check</span> PIX Instantâneo
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[18px] ${theme === 'light' ? 'text-emerald-600' : 'text-signal-lime'}`}>check</span> Cartão em até 12x
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 6: EXECUTIVE CTA FOOTPRINT */}
          <section className={`w-full py-space-xl relative overflow-hidden transition-colors ${
            theme === 'light'
              ? 'bg-gradient-to-t from-slate-100 via-white to-slate-50 border-t border-slate-200'
              : 'bg-gradient-to-t from-graphite to-asphalt-black'
          }`}>
            <div className="max-w-[1240px] mx-auto px-space-md lg:px-space-lg text-center">
              <div className="max-w-2xl mx-auto space-y-space-md">
                <span className={`px-3 py-1 rounded font-label-sm text-label-sm font-semibold uppercase tracking-widest inline-block ${
                  theme === 'light'
                    ? 'bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold'
                    : 'bg-deep-petrol text-electric-cyan'
                }`}>
                  Chega de operar no escuro
                </span>
                <h2 className={`font-display-lg-mobile lg:text-headline-lg font-bold leading-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-ice-white'
                }`}>
                  Proteja a margem da sua próxima captação automotiva.
                </h2>
                <p className={`font-body-md text-body-md ${
                  theme === 'light' ? 'text-slate-600' : 'text-cool-gray'
                }`}>
                  Acesse a infraestrutura analítica que já auditou mais de R$ 420 milhões em negociações reais de veículos seminovos.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-space-sm">
                  <button
                    onClick={() => scrollToSection('hero', 'visao-geral')}
                    className="w-full sm:w-auto px-space-xl h-12 rounded bg-electric-cyan hover:bg-primary text-asphalt-black font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">directions_car</span>
                    Testar com 1 Carro Agora
                  </button>
                  <button
                    onClick={() => setModalType('Amostra de Dossiê PDF Vencar')}
                    className={`w-full sm:w-auto px-space-lg h-12 rounded font-title-md text-title-md font-medium flex items-center justify-center transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-sm'
                        : 'bg-deep-petrol hover:bg-surface-container-high text-ice-white'
                    }`}
                  >
                    Ver Amostra de Dossiê PDF
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-lowest mt-space-xl py-space-xl border-t border-steel/30">
        <div className="max-w-[1240px] mx-auto px-space-md lg:px-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <img
              alt={theme === 'light' ? 'logo-dark.png' : 'logo-white.png'}
              className={`h-6 w-auto object-contain opacity-80 transition-all ${
                theme === 'light' ? 'filter invert hue-rotate-180 contrast-125 brightness-90' : ''
              }`}
              src="https://lh3.googleusercontent.com/aida/AEtjO1XgVJN6Gj-uZjk8Z7SHFNWi2r0uhIaDzG-vAHVMlwk70gN2DZ2wGVC6t-1mpZ0_yj9PGofzcDOkr1fNWj9noJcqSW8ySLYz9TjFHQdjkppF0updDj7Znn7u1kabZUmUB454CyYf_rpruhq4teIu2CFJ4Iji9mqdd_x9mmspIIPARaQByTHxBI0nFkWvo_iiJvNaxMnSraDdDBGvz8Lr1Hdva0EwDfZvHe_1MIpvrRHhiCI4vSU_3K6dhVUt"
            />
            <span className="font-body-sm text-body-sm text-cool-gray">
              © 2025 Vencar Analytics Inc. Liquidez automotiva e inteligência de precificação.
            </span>
          </div>
          <div className="flex items-center gap-space-lg">
            <button
              onClick={() => setModalType('Segurança & Compliance SOC2')}
              className="font-label-md text-label-md text-cool-gray hover:text-ice-white transition-colors cursor-pointer"
            >
              Segurança &amp; SOC2
            </button>
            <button
              onClick={() => setModalType('Documentação REST API Vencar')}
              className="font-label-md text-label-md text-cool-gray hover:text-ice-white transition-colors cursor-pointer"
            >
              API Docs
            </button>
            <button
              onClick={() => setModalType('Status dos Serviços')}
              className="font-label-md text-label-md text-cool-gray hover:text-ice-white transition-colors cursor-pointer"
            >
              Status
            </button>
          </div>
        </div>
      </footer>

      {/* Informative Modal for CTA Triggers */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-asphalt-black/80 backdrop-blur-md"
            onClick={() => setModalType(null)}
          ></div>
          <div className="relative bg-graphite border border-steel rounded-xl max-w-lg w-full p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-steel">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-electric-cyan text-[22px]">verified</span>
                <h3 className="font-title-md text-title-md text-ice-white font-bold">{modalType}</h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="w-7 h-7 rounded bg-deep-petrol text-cool-gray hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="font-body-md text-body-md text-cool-gray">
              O módulo solicitado <strong>{modalType}</strong> está totalmente integrado aos pipelines de precificação determinística da Vencar.
            </p>
            <div className="p-3 bg-deep-petrol rounded font-mono text-xs text-ice-white space-y-1">
              <div>API Status: <span className="text-signal-lime">Operacional (99.98% SLA)</span></div>
              <div>Ambiente: <span className="text-electric-cyan">Produção / Micro-região SP</span></div>
              <div>Latência Média: <span className="text-white">184ms</span></div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded bg-electric-cyan text-asphalt-black font-label-md text-label-md font-bold hover:bg-primary cursor-pointer transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
