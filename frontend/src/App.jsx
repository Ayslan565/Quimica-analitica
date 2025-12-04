import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import './App.css'

// --- IMPORTAÇÃO DOS ANÚNCIOS (Não mexer) ---
import AdBanner from './AdBanner'

// --- IMPORTAÇÃO SEGURA DO PLOTLY ---
import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'
const Plot = createPlotlyComponent.default 
  ? createPlotlyComponent.default(Plotly) 
  : createPlotlyComponent(Plotly)

// --- IMPORTAÇÃO: TABELA PERIÓDICA ---
import TabelaPeriodica from './TabelaPeriodica'

// --- CONFIGURAÇÃO DA API ---
const API_URL = import.meta.env.PROD 
  ? 'https://quimica-analitica.onrender.com' 
  : ''; 

function App() {
  // --- NAVEGAÇÃO ---
  const [activeTab, setActiveTab] = useState('dados')
  const navigate = useNavigate();
  // --- ESTADOS: TRATAMENTO DE DADOS ---
  const [qtdColunas, setQtdColunas] = useState(3)
  const [linhas, setLinhas] = useState([{ volume: 0 }, { volume: 1 }, { volume: 2 }])
  const [resultado, setResultado] = useState(null)
  const [status, setStatus] = useState("Aguardando dados...")
  
  // --- ESTADOS: MOLARIDADE & DILUIÇÃO ---
  const [molMassa, setMolMassa] = useState(''); const [molMM, setMolMM] = useState(''); const [molVol, setMolVol] = useState(''); const [molResultado, setMolResultado] = useState(null)
  const [dilC1, setDilC1] = useState(''); const [dilV1, setDilV1] = useState(''); const [dilC2, setDilC2] = useState(''); const [dilV2, setDilV2] = useState('') 

  // --- ESTADOS: FUNCIONALIDADES EXTRAS ---
  const [mmFormula, setMmFormula] = useState(''); const [mmResultado, setMmResultado] = useState(null)
  const [prepConc, setPrepConc] = useState(''); const [prepVol, setPrepVol] = useState(''); const [prepMM, setPrepMM] = useState(''); const [prepMassa, setPrepMassa] = useState(null)
  const [beerAbs, setBeerAbs] = useState(''); const [beerEpsilon, setBeerEpsilon] = useState(''); const [beerCaminho, setBeerCaminho] = useState('1'); const [beerConc, setBeerConc] = useState(null)

  // --- ESTADO: TITULAÇÃO ---
  const [titCa, setTitCa] = useState('')
  const [titVa, setTitVa] = useState('')
  const [titCb, setTitCb] = useState('')
  const [titPka, setTitPka] = useState('4.75')
  const [titIsWeak, setTitIsWeak] = useState(false)
  const [titResultado, setTitResultado] = useState(null)

  // --- NOVO ESTADO: TAMPÃO ---
  const [bufPh, setBufPh] = useState('')
  const [bufPka, setBufPka] = useState('4.75')
  const [bufConc, setBufConc] = useState('0.1')
  const [bufVol, setBufVol] = useState('100')
  const [bufMMAcido, setBufMMAcido] = useState('60.05') // Ex: Acético
  const [bufMMSal, setBufMMSal] = useState('82.03')   // Ex: Acetato de Sódio
  const [bufResultado, setBufResultado] = useState(null)

  // --- PERSONALIZAÇÃO (UI) ---
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [accentColor, setAccentColor] = useState('#6366f1') 

  // --- PERSONALIZAÇÃO (GRÁFICO) ---
  const [mediaColor, setMediaColor] = useState('#6366f1')   
  const [seriesColors, setSeriesColors] = useState({
    0: '#4472C4', 1: '#ED7D31', 2: '#A5A5A5', 3: '#FFC000', 4: '#5B9BD5'
  })

  const [mostrarSeries, setMostrarSeries] = useState(true)
  const [grossuraMedia, setGrossuraMedia] = useState(4)
  const [grossuraGeralSeries, setGrossuraGeralSeries] = useState(2)
  const [tituloGrafico, setTituloGrafico] = useState('Média NaOH 0,01 M')
  const [eixoX, setEixoX] = useState('Volume em gotas')
  const [eixoY, setEixoY] = useState('pH')
  const [nomeLegenda, setNomeLegenda] = useState('Média Experimental')

  // --- MODAL ---
  const [showModal, setShowModal] = useState(false)
  const [actionToDelete, setActionToDelete] = useState(null)

  // --- ESTADO MENU MOBILE & GESTOS ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const sidebarRef = useRef(null)

  const handleTouchStart = (e) => { touchStartY.current = e.targetTouches[0].clientY }
  const handleTouchMove = (e) => { touchEndY.current = e.targetTouches[0].clientY }
  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;
    const swipeDistance = touchStartY.current - touchEndY.current
    const threshold = 50 
    if (swipeDistance > threshold && !isMobileMenuOpen) setIsMobileMenuOpen(true)
    if (swipeDistance < -threshold && isMobileMenuOpen) setIsMobileMenuOpen(false)
    touchStartY.current = 0; touchEndY.current = 0
  }

  // EFEITO CSS
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--primary-soft', `${accentColor}20`);
    if (isDarkMode) document.body.classList.remove('light-mode');
    else document.body.classList.add('light-mode');
  }, [isDarkMode, accentColor]);

  const updateSeriesColor = (index, newColor) => {
    setSeriesColors(prev => ({ ...prev, [index]: newColor }))
  }

  // --- CÁLCULOS ---
  const calcularMolaridade = () => { const m = parseFloat(molMassa); const mm = parseFloat(molMM); const v = parseFloat(molVol); if (m && mm && v) setMolResultado((m / (mm * (v / 1000))).toFixed(4)); }
  const calcularDiluicao = () => { 
      const c1 = parseFloat(dilC1); const v1 = parseFloat(dilV1); const c2 = parseFloat(dilC2); const v2 = parseFloat(dilV2);
      if (c1 && v1 && c2 && !v2) alert(`V2: ${((c1 * v1) / c2).toFixed(2)} mL`); 
      else if (c1 && v1 && !c2 && v2) alert(`C2: ${((c1 * v1) / v2).toFixed(4)} M`);
      else if (!c1 && v1 && c2 && v2) alert(`C1: ${((c2 * v2) / v1).toFixed(4)} M`);
      else if (c1 && !v1 && c2 && v2) alert(`V1: ${((c2 * v2) / c1).toFixed(2)} mL`);
      else alert("Preencha 3 campos!");
  }

  // --- API ---
  const chamarAPI = async (endpoint, payload, setFunction) => {
    try { const res = await axios.post(`${API_URL}/quimica/${endpoint}`, payload); if (res.data.erro) alert(res.data.erro); else setFunction(res.data); } catch (e) { alert("Erro na API"); console.error(e); }
  }
  const calcMassaMolar = () => { if(!mmFormula) return; chamarAPI('massa-molar', { formula: mmFormula }, setMmResultado) }
  const calcPreparo = () => { if(!prepConc || !prepVol || !prepMM) return; chamarAPI('preparo', { concentracao: parseFloat(prepConc), volume: parseFloat(prepVol), massa_molar: parseFloat(prepMM) }, setPrepMassa) }
  const calcBeer = () => { if(!beerAbs || !beerEpsilon || !beerCaminho) return; chamarAPI('beer', { absorbancia: parseFloat(beerAbs), epsilon: parseFloat(beerEpsilon), caminho: parseFloat(beerCaminho) }, setBeerConc) }
  const calcTitulacao = () => {
    if(!titCa || !titVa || !titCb) return;
    const payload = { conc_acido: parseFloat(titCa), vol_acido: parseFloat(titVa), conc_base: parseFloat(titCb), pka: titIsWeak ? parseFloat(titPka) : null }
    chamarAPI('titulacao', payload, setTitResultado)
  }
  // NOVO: Cálculo de Tampão
  const calcTampao = () => {
      if(!bufPh || !bufPka || !bufConc || !bufVol) return;
      const payload = {
          ph: parseFloat(bufPh),
          pka: parseFloat(bufPka),
          conc_total: parseFloat(bufConc),
          volume: parseFloat(bufVol),
          mm_acido: parseFloat(bufMMAcido),
          mm_sal: parseFloat(bufMMSal)
      }
      chamarAPI('tampao', payload, setBufResultado)
  }

  // --- TRATAMENTO DE DADOS ---
  const handlePaste = (e, r, c, t) => { e.preventDefault(); const d = e.clipboardData.getData('text'); const rw = d.split(/\r\n|\n|\r/).filter(x => x.trim()); const nl = [...linhas]; rw.forEach((rx, i) => { const idx = r + i; if (!nl[idx]) nl[idx] = {}; const cls = rx.split('\t'); cls.forEach((val, j) => { const cv = val.trim().replace(',', '.'); if (t === 'vol') { if (j === 0) nl[idx].volume = cv; else if (j-1 < qtdColunas) nl[idx][`ph${j-1}`] = cv; } else if (t === 'ph' && c+j < qtdColunas) nl[idx][`ph${c+j}`] = cv; }); }); setLinhas(nl); };
  const addLinha = () => { setLinhas([...linhas, { volume: (parseFloat(linhas[linhas.length-1]?.volume)||0) + 1 }]) }
  const addColuna = () => setQtdColunas(qtdColunas + 1)
  const confirmDelete = (t) => { setActionToDelete(t); setShowModal(true); }
  const executeDelete = () => { if (actionToDelete === 'row' && linhas.length > 1) { const n = [...linhas]; n.pop(); setLinhas(n); } else if (actionToDelete === 'col' && qtdColunas > 1) { setQtdColunas(qtdColunas - 1); } setShowModal(false) }
  const handleChange = (i, k, v) => { const n = [...linhas]; if (!n[i]) n[i] = {}; n[i][k] = v; setLinhas(n); }

  const timeoutRefAPI = useRef(null)
  const executarCalculoAPI = async () => {
    setStatus("Calculando...")
    try { const dt = linhas.map(r => { let o = { volume: parseFloat(r.volume) }; for(let i=0; i < qtdColunas; i++){ if(r[`ph${i}`]) o[`ph${i}`] = r[`ph${i}`] } return o }); const res = await axios.post(`${API_URL}/experimental/calcular`, dt); setResultado(res.data); setStatus("Atualizado") } catch (error) { console.error(error); setStatus("Erro na API") }
  }
  useEffect(() => {
    if(activeTab === 'dados') { 
        if (timeoutRefAPI.current) clearTimeout(timeoutRefAPI.current)
        timeoutRefAPI.current = setTimeout(() => { executarCalculoAPI() }, 1000)
        return () => clearTimeout(timeoutRefAPI.current)
    }
  }, [linhas, qtdColunas, activeTab]) 

  const gerarDadosGrafico = () => {
    if (!resultado) return []
    let traces = []
    const defaultColors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5'];
    
    if (mostrarSeries) { 
        for (let i = 0; i < qtdColunas; i++) { 
            const xData = []; const yData = []; 
            linhas.forEach(row => { 
                if (row.volume !== undefined && row[`ph${i}`] !== undefined && row[`ph${i}`] !== "") { 
                    xData.push(parseFloat(row.volume)); 
                    yData.push(parseFloat(String(row[`ph${i}`]).replace(',', '.'))) 
                } 
            }); 
            if (xData.length > 0) { 
                const corSerie = seriesColors[i] || defaultColors[i % defaultColors.length];
                traces.push({ 
                    x: xData, y: yData, 
                    type: 'scatter', mode: 'lines+markers', 
                    name: `Série ${i + 1}`, 
                    line: { color: corSerie, width: grossuraGeralSeries, shape: 'spline' }, 
                    marker: { size: (grossuraGeralSeries) + 4 }, 
                    showlegend: true, opacity: 0.9, connectgaps: true 
                }) 
            } 
        } 
    }
    
    traces.push({ 
        x: resultado.grafico.x, y: resultado.grafico.y, 
        type: 'scatter', mode: 'lines+markers', 
        name: nomeLegenda, 
        line: {color: mediaColor, width: grossuraMedia, shape: 'spline'}, 
        marker: {color: isDarkMode ? '#fff' : '#000', size: grossuraMedia + 4, line: {color: mediaColor, width: 2}}, 
        error_y: { type: 'data', array: resultado.grafico.erro, visible: true, color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }, 
        connectgaps: true 
    })
    return traces
  }

  return (
    <div className="dashboard-layout">
      
      <aside 
        ref={sidebarRef}
        className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mobile-pull-handle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <div className="handle-bar"></div>
            <span>{isMobileMenuOpen ? 'Fechar' : 'Menu'}</span>
        </div>

          <div className="brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
      🧪 LabData Pro
      <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight:'normal'}}>Voltar ao Menu</div>
  </div>
        
        <div className="sidebar-content">
          <div className="menu-group" style={{marginBottom: '20px'}}>
             <div className="setting-item">
                <span>Modo Escuro</span>
                <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '🌙' : '☀️'}</button>
             </div>
             <div className="setting-item">
                <span>Cor do Sistema</span>
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="color-picker"/>
             </div>
          </div>

          <div className="menu-group">
            <div className="menu-label">Ferramentas</div>
            <button className={`btn-sidebar ${activeTab === 'dados' ? 'active' : ''}`} onClick={() => {setActiveTab('dados'); setIsMobileMenuOpen(false)}}>📉 Tratamento</button>
            <button className={`btn-sidebar ${activeTab === 'titulacao' ? 'active' : ''}`} onClick={() => {setActiveTab('titulacao'); setIsMobileMenuOpen(false)}}>⚗️ Titulação</button>
            <button className={`btn-sidebar ${activeTab === 'tampao' ? 'active' : ''}`} onClick={() => {setActiveTab('tampao'); setIsMobileMenuOpen(false)}}>🌡️ Tampão</button>
            <button className={`btn-sidebar ${activeTab === 'molaridade' ? 'active' : ''}`} onClick={() => {setActiveTab('molaridade'); setIsMobileMenuOpen(false)}}>🧪 Molaridade</button>
            <button className={`btn-sidebar ${activeTab === 'diluicao' ? 'active' : ''}`} onClick={() => {setActiveTab('diluicao'); setIsMobileMenuOpen(false)}}>💧 Diluição</button>
            
            <div className="menu-label" style={{marginTop:'10px'}}>Novas Funções</div>
            <button className={`btn-sidebar ${activeTab === 'tabela' ? 'active' : ''}`} onClick={() => {setActiveTab('tabela'); setIsMobileMenuOpen(false)}}>🧩 Tabela Periódica</button>
            <button className={`btn-sidebar ${activeTab === 'massa-molar' ? 'active' : ''}`} onClick={() => {setActiveTab('massa-molar'); setIsMobileMenuOpen(false)}}>🧬 Massa Molar</button>
            <button className={`btn-sidebar ${activeTab === 'solucoes' ? 'active' : ''}`} onClick={() => {setActiveTab('solucoes'); setIsMobileMenuOpen(false)}}>⚗️ Preparo Sol.</button>
            <button className={`btn-sidebar ${activeTab === 'espectro' ? 'active' : ''}`} onClick={() => {setActiveTab('espectro'); setIsMobileMenuOpen(false)}}>🌈 Beer-Lambert</button>
          </div>

          <div className="menu-group">
             <AdBanner slotId="8301937517" style={{minHeight: '250px', width: '100%', display: 'block'}} /> 
          </div>

          {activeTab === 'dados' && (
            <div className="menu-group settings-group">
                <div className="menu-label">Tabela</div>
                <div style={{display: 'flex', gap: '10px', width: '100%', marginBottom: '15px'}}>
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <button className="btn-sidebar" style={{border: '1px solid var(--primary)'}} onClick={addLinha}><span>➕</span> Linha</button>
                        <button className="btn-sidebar" style={{border: '1px solid var(--primary)'}} onClick={addColuna}><span>➕</span> Coluna</button>
                    </div>
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <button className="btn-sidebar danger" style={{border: '1px solid #ef4444'}} onClick={() => confirmDelete('row')}><span>➖</span> Linha</button>
                        <button className="btn-sidebar danger" style={{border: '1px solid #ef4444'}} onClick={() => confirmDelete('col')}><span>➖</span> Coluna</button>
                    </div>
                </div>

                <div className="menu-label">Gráfico</div>
                <div className="setting-item"><span>Mostrar Séries</span><button className="theme-toggle" onClick={() => setMostrarSeries(!mostrarSeries)}>{mostrarSeries ? '👁️ ON' : '🚫 OFF'}</button></div>
                <div className="setting-item"><span>Cor Média</span><input type="color" value={mediaColor} onChange={(e) => setMediaColor(e.target.value)} className="color-picker"/></div>
                <div className="input-group-sidebar" style={{marginTop:'15px'}}><label>Título</label><input className="input-sidebar" value={tituloGrafico} onChange={e => setTituloGrafico(e.target.value)} /></div>
                <div className="input-group-sidebar"><label>Eixo X</label><input className="input-sidebar" value={eixoX} onChange={e => setEixoX(e.target.value)} /></div>
                <div className="input-group-sidebar"><label>Eixo Y</label><input className="input-sidebar" value={eixoY} onChange={e => setEixoY(e.target.value)} /></div>
            </div>
          )}
        </div>
      </aside>

      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <main className="main-content">
        <AdBanner slotId="2103376582" format="horizontal" style={{marginBottom: '20px', minHeight: '90px', width: '100%', display: 'block'}} />
        
        {activeTab === 'dados' && (
            <>
                <header className="header-info">
                <div><h2 style={{margin:0}}>Tratamento de Dados</h2><small style={{color:'var(--text-muted)'}}>Dashboard Experimental</small></div>
                <span className={`status-badge ${status === 'Calculando...' ? 'loading' : 'live'}`}>{status === 'Atualizado' ? '● Tempo Real' : status}</span>
                </header>
                <div className="table-container">
                <table>
                    <thead><tr><th className="sticky-col">{eixoX}</th>{[...Array(qtdColunas)].map((_, i) => <th key={i}>pH {i + 1}</th>)}</tr></thead>
                    <tbody>
                    {linhas.map((linha, i) => (
                        <tr key={i}>
                        <td className="sticky-col"><input type="number" value={linha.volume} onChange={e => handleChange(i, 'volume', e.target.value)} onPaste={(e) => handlePaste(e, i, 0, 'vol')}/></td>
                        {[...Array(qtdColunas)].map((_, j) => (
                            <td key={j}><input type="number" step="0.01" placeholder="-" value={linha[`ph${j}`] || ''} onChange={e => handleChange(i, `ph${j}`, e.target.value)} onPaste={(e) => handlePaste(e, i, j, 'ph')}/></td>
                        ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                {resultado && (
                <div className="results-grid">
                    <div className="card">
                    <Plot data={gerarDadosGrafico()} useResizeHandler={true} style={{width: '100%'}} layout={{ title: { text: tituloGrafico, font: { size: 20, color: isDarkMode ? '#f8fafc' : '#1e293b', family: 'Arial' } }, autosize: true, height: 450, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: {color: isDarkMode ? '#94a3b8' : '#475569'}, margin: {l: 70, r: 30, t: 80, b: 100}, xaxis: { title: { text: eixoX, font: {size:14} }, gridcolor: isDarkMode ? '#334155' : '#e2e8f0', zerolinecolor: '#334155' }, yaxis: { title: { text: eixoY, font: {size:14} }, gridcolor: isDarkMode ? '#334155' : '#e2e8f0', zerolinecolor: '#334155' }, legend: { orientation: 'h', y: -0.3 } }} />
                    </div>
                    <div className="card">
                    <h3>Estatística</h3>
                    {resultado.tabela.map((row, k) => (
                        <div key={k} className="data-row"><span>{row.volume} {eixoX.toLowerCase().includes('ml') ? 'mL' : ''}</span><span><strong>{row.media}</strong> <small> (±{row.desvio})</small></span></div>
                    ))}
                    </div>
                </div>
                )}
            </>
        )}
        
        {activeTab === 'titulacao' && (
            <div className="card" style={{maxWidth: '800px', margin: '0 auto', padding: '30px'}}>
                <h2 style={{textAlign: 'center', marginBottom: '30px'}}>Simulador de Titulação</h2>
                
                <div className="form-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>Concentração Ácido (mol/L)</label>
                        <input className="input-sidebar" type="number" placeholder="Ex: 0.1" value={titCa} onChange={e => setTitCa(e.target.value)} style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>Volume Ácido (mL)</label>
                        <input className="input-sidebar" type="number" placeholder="Ex: 25" value={titVa} onChange={e => setTitVa(e.target.value)} style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>Concentração Base (mol/L)</label>
                        <input className="input-sidebar" type="number" placeholder="Ex: 0.1" value={titCb} onChange={e => setTitCb(e.target.value)} style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{display:'flex', flexDirection: 'column', gap:'10px', justifyContent: 'end'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>Tipo de Ácido</label>
                        <button className="theme-toggle" onClick={() => setTitIsWeak(!titIsWeak)} style={{width: '100%', padding: '12px', justifyContent: 'center'}}>
                            {titIsWeak ? '✅ ÁCIDO FRACO' : '⚡ ÁCIDO FORTE'}
                        </button>
                    </div>
                    {titIsWeak && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: '1 / -1', animation: 'fadeIn 0.3s'}}>
                            <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>Valor do pKa</label>
                            <input className="input-sidebar" type="number" placeholder="Ex: 4.75" value={titPka} onChange={e => setTitPka(e.target.value)} style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                        </div>
                    )}
                </div>

                <button className="btn-sidebar" onClick={calcTitulacao} style={{marginTop: '30px', width: '100%', justifyContent: 'center', padding: '15px', fontSize: '1.1rem', background: 'var(--primary)', color: 'white'}}>GERAR CURVA DE TITULAÇÃO</button>
                
                {titResultado && (
                    <div style={{marginTop: '30px', borderTop: '1px solid var(--primary-soft)', paddingTop: '20px'}}>
                        <Plot 
                           data={[{x: titResultado.volume_base, y: titResultado.ph, type: 'scatter', mode: 'lines', line: {color: accentColor, width: 3}}]}
                           layout={{ title: `Curva de ${titResultado.tipo}`, xaxis: {title: 'Volume Base (mL)', gridcolor: isDarkMode?'#333':'#eee'}, yaxis: {title: 'pH', range:[0,14], gridcolor: isDarkMode?'#333':'#eee'}, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: {color: isDarkMode ? '#ccc' : '#333'}}}
                           useResizeHandler={true}
                           style={{width:'100%', height:'400px'}}
                        />
                        <div style={{textAlign:'center', marginTop:'15px', padding:'15px', background:'var(--primary-soft)', borderRadius:'8px'}}>Ponto de Equivalência: <strong style={{fontSize: '1.2rem'}}>{titResultado.ponto_equivalencia} mL</strong></div>
                    </div>
                )}
            </div>
        )}
        
        {/* --- ABA TAMPÃO (NOVO) --- */}
        {activeTab === 'tampao' && (
             <div className="card" style={{maxWidth: '800px', margin: '0 auto', padding: '30px'}}>
                <h2 style={{textAlign: 'center', marginBottom: '30px'}}>Calculadora de Tampão</h2>
                <p style={{textAlign: 'center', marginBottom: '30px', color: 'var(--text-muted)'}}>Mistura de Ácido e Sal Conjugado (Henderson-Hasselbalch)</p>

                <div className="form-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>pH Desejado</label>
                        <input className="input-sidebar" type="number" value={bufPh} onChange={e => setBufPh(e.target.value)} placeholder="Ex: 5.0" style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>pKa do Ácido</label>
                        <input className="input-sidebar" type="number" value={bufPka} onChange={e => setBufPka(e.target.value)} placeholder="Ex: 4.75" style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>Concentração Total (M)</label>
                        <input className="input-sidebar" type="number" value={bufConc} onChange={e => setBufConc(e.target.value)} placeholder="Ex: 0.1" style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>Volume Total (mL)</label>
                        <input className="input-sidebar" type="number" value={bufVol} onChange={e => setBufVol(e.target.value)} placeholder="Ex: 100" style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>MM Ácido (g/mol)</label>
                        <input className="input-sidebar" type="number" value={bufMMAcido} onChange={e => setBufMMAcido(e.target.value)} placeholder="Ex: 60.05" style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <label className="input-group-sidebar" style={{fontSize: '1rem', fontWeight: '500', marginBottom:0, padding:0}}>MM Sal (g/mol)</label>
                        <input className="input-sidebar" type="number" value={bufMMSal} onChange={e => setBufMMSal(e.target.value)} placeholder="Ex: 82.03" style={{padding: '12px', width: '100%', boxSizing: 'border-box'}} />
                    </div>
                </div>

                <button className="btn-sidebar" onClick={calcTampao} style={{marginTop: '30px', width: '100%', justifyContent: 'center', padding: '15px', fontSize: '1.1rem', background: 'var(--primary)', color: 'white'}}>CALCULAR RECEITA</button>

                {bufResultado && (
                    <div style={{marginTop: '30px', borderTop: '1px solid var(--primary-soft)', paddingTop: '20px', animation: 'fadeIn 0.5s'}}>
                        <h3 style={{textAlign: 'center', marginBottom: '20px'}}>🧪 Receita de Preparo</h3>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                             <div style={{background: 'var(--primary-soft)', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                                <div style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Massa de Ácido</div>
                                <div style={{fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)'}}>{bufResultado.massa_acido} g</div>
                                <small>({bufResultado.conc_acido_real} M)</small>
                             </div>
                             <div style={{background: 'var(--primary-soft)', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                                <div style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Massa de Sal</div>
                                <div style={{fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)'}}>{bufResultado.massa_sal} g</div>
                                <small>({bufResultado.conc_sal_real} M)</small>
                             </div>
                        </div>
                        <div style={{marginTop: '20px', textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)'}}>
                            Misture os sólidos em aprox. 80% do volume de água, ajuste o pH se necessário e complete o volume para <strong>{bufVol} mL</strong>.
                        </div>
                    </div>
                )}
             </div>
        )}

        {activeTab === 'tabela' && <TabelaPeriodica apiUrl={API_URL} />}

        {activeTab === 'molaridade' && (<div className="card" style={{maxWidth: '600px', margin: '0 auto'}}><h2>Molaridade</h2><div className="input-group-sidebar"><label>Massa (g)</label><input className="input-sidebar" type="number" value={molMassa} onChange={e => setMolMassa(e.target.value)} /></div><div className="input-group-sidebar"><label>MM (g/mol)</label><input className="input-sidebar" type="number" value={molMM} onChange={e => setMolMM(e.target.value)} /></div><div className="input-group-sidebar"><label>Vol (mL)</label><input className="input-sidebar" type="number" value={molVol} onChange={e => setMolVol(e.target.value)} /></div><button className="btn-sidebar" onClick={calcularMolaridade}>CALCULAR</button>{molResultado && (<div style={{marginTop: '20px', fontSize: '2rem', textAlign: 'center', color: 'var(--primary)'}}>{molResultado} M</div>)}</div>)}
        
        {activeTab === 'diluicao' && (
             <div className="card" style={{maxWidth: '800px', margin: '0 auto'}}>
                    <h2>Calculadora de Diluição</h2>
                    <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>Preencha 3 campos e deixe vazio o que você quer descobrir.</p>
                    <div className="diluicao-wrapper">
                        <div className="diluicao-block"><h3>🧪 Solução Inicial</h3><div className="input-group-sidebar"><label>Concentração (C1)</label><input className="input-sidebar" type="number" placeholder="Ex: 1.5 M" value={dilC1} onChange={e => setDilC1(e.target.value)} /></div><div className="input-group-sidebar"><label>Volume (V1)</label><input className="input-sidebar" type="number" placeholder="Ex: 20 mL" value={dilV1} onChange={e => setDilV1(e.target.value)} /></div></div>
                        <div className="diluicao-arrow">➔</div>
                        <div className="diluicao-block"><h3>💧 Solução Final</h3><div className="input-group-sidebar"><label>Concentração (C2)</label><input className="input-sidebar" type="number" placeholder="-" value={dilC2} onChange={e => setDilC2(e.target.value)} /></div><div className="input-group-sidebar"><label>Volume (V2)</label><input className="input-sidebar" type="number" placeholder="-" value={dilV2} onChange={e => setDilV2(e.target.value)} /></div></div>
                    </div>
                    <button className="btn-sidebar" style={{background: 'var(--primary)', color: 'white', marginTop: '25px', justifyContent: 'center', height: '50px', fontSize:'1.1rem'}} onClick={calcularDiluicao}>CALCULAR</button>
             </div>
        )}

        {activeTab === 'massa-molar' && (<div className="card" style={{maxWidth: '600px', margin: '0 auto'}}><h2>Massa Molar Automática</h2><p>Ex: H2SO4</p><div className="input-group-sidebar"><label>Fórmula</label><input className="input-sidebar" type="text" value={mmFormula} onChange={e => setMmFormula(e.target.value)} /></div><button className="btn-sidebar" onClick={calcMassaMolar}>CALCULAR</button>{mmResultado && (<div style={{marginTop:'20px', textAlign:'center'}}><h3>{mmResultado.formula}</h3><div style={{fontSize:'2.5rem', color:'var(--primary)'}}>{mmResultado.massa_molar} g/mol</div></div>)}</div>)}

        {activeTab === 'solucoes' && (<div className="card" style={{maxWidth: '600px', margin: '0 auto'}}><h2>Preparo de Soluções</h2><div className="input-group-sidebar"><label>Conc. (mol/L)</label><input className="input-sidebar" type="number" value={prepConc} onChange={e => setPrepConc(e.target.value)} /></div><div className="input-group-sidebar"><label>Vol (mL)</label><input className="input-sidebar" type="number" value={prepVol} onChange={e => setPrepVol(e.target.value)} /></div><div className="input-group-sidebar"><label>MM (g/mol)</label><input className="input-sidebar" type="number" value={prepMM} onChange={e => setPrepMM(e.target.value)} /></div><button className="btn-sidebar" onClick={calcPreparo}>CALCULAR MASSA</button>{prepMassa && (<div style={{marginTop:'20px', textAlign:'center'}}><div style={{fontSize:'2.5rem', color:'var(--primary)'}}>{prepMassa.massa_necessaria} g</div></div>)}</div>)}

        {activeTab === 'espectro' && (<div className="card" style={{maxWidth: '600px', margin: '0 auto'}}><h2>Lei de Beer-Lambert</h2><div className="input-group-sidebar"><label>Abs (A)</label><input className="input-sidebar" type="number" value={beerAbs} onChange={e => setBeerAbs(e.target.value)} /></div><div className="input-group-sidebar"><label>Epsilon (ε)</label><input className="input-sidebar" type="number" value={beerEpsilon} onChange={e => setBeerEpsilon(e.target.value)} /></div><div className="input-group-sidebar"><label>Caminho (cm)</label><input className="input-sidebar" type="number" value={beerCaminho} onChange={e => setBeerCaminho(e.target.value)} /></div><button className="btn-sidebar" onClick={calcBeer}>CALCULAR</button>{beerConc && (<div style={{marginTop:'20px', textAlign:'center'}}><div style={{fontSize:'2.5rem', color:'var(--primary)'}}>{beerConc.concentracao} M</div></div>)}</div>)}

      </main>
      {showModal && (<div className="modal-overlay"><div className="modal"><h2>Confirmar</h2><div className="modal-actions"><button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn-confirm" onClick={executeDelete}>Excluir</button></div></div></div>)}
    </div>
  )
}

export default App