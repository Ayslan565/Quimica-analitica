import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

// --- IMPORTAÇÃO DOS ANÚNCIOS (Não mexer) ---
import AdBanner from './AdBanner'

// --- IMPORTAÇÃO SEGURA DO PLOTLY ---
import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'
const Plot = createPlotlyComponent.default 
  ? createPlotlyComponent.default(Plotly) 
  : createPlotlyComponent(Plotly)

// --- NOVA IMPORTAÇÃO: TABELA PERIÓDICA ---
import TabelaPeriodica from './TabelaPeriodica'

// --- CONFIGURAÇÃO DA API ---
const API_URL = import.meta.env.PROD 
  ? 'https://quimica-analitica.onrender.com' 
  : ''; 

function App() {
  // --- NAVEGAÇÃO ---
  const [activeTab, setActiveTab] = useState('dados')
  
  // --- ESTADO MENU MOBILE (NOVO) ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // --- ESTADOS: TRATAMENTO DE DADOS ---
  const [qtdColunas, setQtdColunas] = useState(3)
  const [linhas, setLinhas] = useState([{ volume: 0 }, { volume: 1 }, { volume: 2 }])
  const [resultado, setResultado] = useState(null)
  const [status, setStatus] = useState("Aguardando dados...")
  
  // --- ESTADOS: MOLARIDADE & DILUIÇÃO ---
  const [molMassa, setMolMassa] = useState(''); const [molMM, setMolMM] = useState(''); const [molVol, setMolVol] = useState(''); const [molResultado, setMolResultado] = useState(null)
  const [dilC1, setDilC1] = useState(''); const [dilV1, setDilV1] = useState(''); const [dilC2, setDilC2] = useState(''); const [dilV2, setDilV2] = useState('') 

  // --- NOVOS ESTADOS (FUNCIONALIDADES EXTRAS) ---
  const [mmFormula, setMmFormula] = useState(''); const [mmResultado, setMmResultado] = useState(null)
  const [prepConc, setPrepConc] = useState(''); const [prepVol, setPrepVol] = useState(''); const [prepMM, setPrepMM] = useState(''); const [prepMassa, setPrepMassa] = useState(null)
  const [beerAbs, setBeerAbs] = useState(''); const [beerEpsilon, setBeerEpsilon] = useState(''); const [beerCaminho, setBeerCaminho] = useState('1'); const [beerConc, setBeerConc] = useState(null)

  // --- PERSONALIZAÇÃO ---
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [accentColor, setAccentColor] = useState('#6366f1') 
  const [mostrarSeries, setMostrarSeries] = useState(true)
  const [grossuraMedia, setGrossuraMedia] = useState(4)
  const [grossuraGeralSeries, setGrossuraGeralSeries] = useState(2)
  const [customStyles, setCustomStyles] = useState({})
  const [tituloGrafico, setTituloGrafico] = useState('Média NaOH 0,01 M')
  const [eixoX, setEixoX] = useState('Volume em gotas')
  const [eixoY, setEixoY] = useState('pH')
  const [nomeLegenda, setNomeLegenda] = useState('Média Experimental')

  // --- MODAL ---
  const [showModal, setShowModal] = useState(false)
  const [actionToDelete, setActionToDelete] = useState(null)

  // EFEITO CSS
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--primary-soft', `${accentColor}20`);
    if (isDarkMode) document.body.classList.remove('light-mode');
    else document.body.classList.add('light-mode');
  }, [isDarkMode, accentColor]);

  // --- FUNÇÕES ANTIGAS ---
  const calcularMolaridade = () => { const m = parseFloat(molMassa); const mm = parseFloat(molMM); const v = parseFloat(molVol); if (m && mm && v) setMolResultado((m / (mm * (v / 1000))).toFixed(4)); }
  const calcularDiluicao = () => { 
      const c1 = parseFloat(dilC1); const v1 = parseFloat(dilV1); const c2 = parseFloat(dilC2); const v2 = parseFloat(dilV2);
      if (c1 && v1 && c2 && !v2) alert(`V2: ${((c1 * v1) / c2).toFixed(2)} mL`); 
      else if (c1 && v1 && !c2 && v2) alert(`C2: ${((c1 * v1) / v2).toFixed(4)} M`);
      else if (!c1 && v1 && c2 && v2) alert(`C1: ${((c2 * v2) / v1).toFixed(4)} M`);
      else if (c1 && !v1 && c2 && v2) alert(`V1: ${((c2 * v2) / c1).toFixed(2)} mL`);
      else alert("Preencha 3 campos!");
  }

  // --- NOVAS FUNÇÕES (CHAMADAS API) ---
  const chamarAPI = async (endpoint, payload, setFunction) => {
    try { const res = await axios.post(`${API_URL}/quimica/${endpoint}`, payload); if (res.data.erro) alert(res.data.erro); else setFunction(res.data); } catch (e) { alert("Erro na API"); console.error(e); }
  }
  const calcMassaMolar = () => { if(!mmFormula) return; chamarAPI('massa-molar', { formula: mmFormula }, setMmResultado) }
  const calcPreparo = () => { if(!prepConc || !prepVol || !prepMM) return; chamarAPI('preparo', { concentracao: parseFloat(prepConc), volume: parseFloat(prepVol), massa_molar: parseFloat(prepMM) }, setPrepMassa) }
  const calcBeer = () => { if(!beerAbs || !beerEpsilon || !beerCaminho) return; chamarAPI('beer', { absorbancia: parseFloat(beerAbs), epsilon: parseFloat(beerEpsilon), caminho: parseFloat(beerCaminho) }, setBeerConc) }

  // --- FUNÇÕES DE TABELA (DADOS) ---
  const handlePaste = (e, r, c, t) => { e.preventDefault(); const d = e.clipboardData.getData('text'); const rw = d.split(/\r\n|\n|\r/).filter(x => x.trim()); const nl = [...linhas]; rw.forEach((rx, i) => { const idx = r + i; if (!nl[idx]) nl[idx] = {}; const cls = rx.split('\t'); cls.forEach((val, j) => { const cv = val.trim().replace(',', '.'); if (t === 'vol') { if (j === 0) nl[idx].volume = cv; else if (j-1 < qtdColunas) nl[idx][`ph${j-1}`] = cv; } else if (t === 'ph' && c+j < qtdColunas) nl[idx][`ph${c+j}`] = cv; }); }); setLinhas(nl); };
  const addLinha = () => { setLinhas([...linhas, { volume: (parseFloat(linhas[linhas.length-1]?.volume)||0) + 1 }]) }
  const addColuna = () => setQtdColunas(qtdColunas + 1)
  const confirmDelete = (t) => { setActionToDelete(t); setShowModal(true); }
  const executeDelete = () => { if (actionToDelete === 'row' && linhas.length > 1) { const n = [...linhas]; n.pop(); setLinhas(n); } else if (actionToDelete === 'col' && qtdColunas > 1) { setQtdColunas(qtdColunas - 1); } setShowModal(false) }
  const handleChange = (i, k, v) => { const n = [...linhas]; if (!n[i]) n[i] = {}; n[i][k] = v; setLinhas(n); }

  // --- CÁLCULO AUTOMÁTICO DADOS (BLINDADO) ---
  const timeoutRef = useRef(null)
  const executarCalculoAPI = async () => {
    setStatus("Calculando...")
    try { const dt = linhas.map(r => { let o = { volume: parseFloat(r.volume) }; for(let i=0; i < qtdColunas; i++){ if(r[`ph${i}`]) o[`ph${i}`] = r[`ph${i}`] } return o }); const res = await axios.post(`${API_URL}/experimental/calcular`, dt); setResultado(res.data); setStatus("Atualizado") } catch (error) { console.error(error); setStatus("Erro na API") }
  }
  useEffect(() => {
    if(activeTab === 'dados') { 
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => { executarCalculoAPI() }, 1000)
        return () => clearTimeout(timeoutRef.current)
    }
  }, [linhas, qtdColunas, activeTab]) 

  // --- DADOS GRÁFICO ---
  const gerarDadosGrafico = () => {
    if (!resultado) return []
    let traces = []
    const defaultColors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5'];
    if (mostrarSeries) { for (let i = 0; i < qtdColunas; i++) { const xData = []; const yData = []; linhas.forEach(row => { if (row.volume !== undefined && row[`ph${i}`] !== undefined && row[`ph${i}`] !== "") { xData.push(parseFloat(row.volume)); yData.push(parseFloat(String(row[`ph${i}`]).replace(',', '.'))) } }); if (xData.length > 0) { const style = customStyles[i] || {}; traces.push({ x: xData, y: yData, type: 'scatter', mode: 'lines+markers', name: `Série ${i + 1}`, line: { color: style.color || defaultColors[i % defaultColors.length], width: style.width || grossuraMedia, shape: 'spline' }, marker: { size: (style.width || grossuraMedia) + 4 }, showlegend: true, opacity: 0.9, connectgaps: true }) } } }
    traces.push({ x: resultado.grafico.x, y: resultado.grafico.y, type: 'scatter', mode: 'lines+markers', name: nomeLegenda, line: {color: accentColor, width: grossuraMedia, shape: 'spline'}, marker: {color: isDarkMode ? '#fff' : '#000', size: grossuraMedia + 4, line: {color: accentColor, width: 2}}, error_y: { type: 'data', array: resultado.grafico.erro, visible: true, color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }, connectgaps: true })
    return traces
  }

  return (
    <div className="dashboard-layout">
      
      {/* --- SIDEBAR (MENU) --- */}
      {/* No mobile, ela ganha a classe 'mobile-open' quando aberta */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        
        {/* PUXADOR DO MOBILE (SÓ APARECE NO CELULAR) */}
        <div className="mobile-pull-handle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <div className="handle-bar"></div>
            <span>{isMobileMenuOpen ? 'Fechar Menu' : 'Abrir Menu'}</span>
        </div>

        <div className="brand">🧪 LabData Pro</div>
        
        <div className="sidebar-content">
          {/* --- TEMA --- */}
          <div className="menu-group" style={{marginBottom: '20px'}}>
             <div className="setting-item"><span>Tema</span><button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '🌙' : '☀️'}</button></div>
          </div>

          <div className="menu-group">
            <div className="menu-label">Ferramentas</div>
            <button className={`btn-sidebar ${activeTab === 'dados' ? 'active' : ''}`} onClick={() => {setActiveTab('dados'); setIsMobileMenuOpen(false)}}>📉 Tratamento</button>
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
                <div className="menu-label">Gráfico</div>
                <div className="setting-item"><span>Mostrar Séries</span><button className="theme-toggle" onClick={() => setMostrarSeries(!mostrarSeries)}>{mostrarSeries ? '👁️ ON' : '🚫 OFF'}</button></div>
                <div className="input-group-sidebar"><label>Título</label><input className="input-sidebar" value={tituloGrafico} onChange={e => setTituloGrafico(e.target.value)} /></div>
                <div className="input-group-sidebar"><label>Eixo X</label><input className="input-sidebar" value={eixoX} onChange={e => setEixoX(e.target.value)} /></div>
                <div className="input-group-sidebar"><label>Eixo Y</label><input className="input-sidebar" value={eixoY} onChange={e => setEixoY(e.target.value)} /></div>
                <div className="setting-item"><span>Cor Média</span><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="color-picker"/></div>
                <div className="input-group-sidebar">
                    <label style={{display:'flex', justifyContent:'space-between'}}>Grossura <span>{grossuraMedia}px</span></label>
                    <input type="range" min="1" max="10" value={grossuraMedia} onChange={(e) => setGrossuraMedia(parseInt(e.target.value))} style={{width:'100%'}} />
                </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay escuro para fechar o menu clicando fora (Mobile) */}
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
        
        {/* --- NOVAS ABAS --- */}
        {activeTab === 'tabela' && <TabelaPeriodica apiUrl={API_URL} />}

        {activeTab === 'molaridade' && (<div className="card" style={{maxWidth: '600px', margin: '0 auto'}}><h2>Molaridade</h2><div className="input-group-sidebar"><label>Massa (g)</label><input className="input-sidebar" type="number" value={molMassa} onChange={e => setMolMassa(e.target.value)} /></div><div className="input-group-sidebar"><label>MM (g/mol)</label><input className="input-sidebar" type="number" value={molMM} onChange={e => setMolMM(e.target.value)} /></div><div className="input-group-sidebar"><label>Vol (mL)</label><input className="input-sidebar" type="number" value={molVol} onChange={e => setMolVol(e.target.value)} /></div><button className="btn-sidebar" onClick={calcularMolaridade}>CALCULAR</button>{molResultado && (<div style={{marginTop: '20px', fontSize: '2rem', textAlign: 'center', color: 'var(--primary)'}}>{molResultado} M</div>)}</div>)}
        
        {activeTab === 'diluicao' && (<div className="card" style={{maxWidth: '800px', margin: '0 auto'}}><h2>Diluição</h2><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}><div className="input-group-sidebar"><label>C1</label><input className="input-sidebar" type="number" value={dilC1} onChange={e => setDilC1(e.target.value)} /></div><div className="input-group-sidebar"><label>V1</label><input className="input-sidebar" type="number" value={dilV1} onChange={e => setDilV1(e.target.value)} /></div><div className="input-group-sidebar"><label>C2</label><input className="input-sidebar" type="number" value={dilC2} onChange={e => setDilC2(e.target.value)} /></div><div className="input-group-sidebar"><label>V2</label><input className="input-sidebar" type="number" value={dilV2} onChange={e => setDilV2(e.target.value)} /></div></div><button className="btn-sidebar" onClick={calcularDiluicao}>CALCULAR</button></div>)}

        {activeTab === 'massa-molar' && (<div className="card" style={{maxWidth: '600px', margin: '0 auto'}}><h2>Massa Molar Automática</h2><p>Ex: H2SO4</p><div className="input-group-sidebar"><label>Fórmula</label><input className="input-sidebar" type="text" value={mmFormula} onChange={e => setMmFormula(e.target.value)} /></div><button className="btn-sidebar" onClick={calcMassaMolar}>CALCULAR</button>{mmResultado && (<div style={{marginTop:'20px', textAlign:'center'}}><h3>{mmResultado.formula}</h3><div style={{fontSize:'2.5rem', color:'var(--primary)'}}>{mmResultado.massa_molar} g/mol</div></div>)}</div>)}

        {activeTab === 'solucoes' && (<div className="card" style={{maxWidth: '600px', margin: '0 auto'}}><h2>Preparo de Soluções</h2><div className="input-group-sidebar"><label>Conc. (mol/L)</label><input className="input-sidebar" type="number" value={prepConc} onChange={e => setPrepConc(e.target.value)} /></div><div className="input-group-sidebar"><label>Vol (mL)</label><input className="input-sidebar" type="number" value={prepVol} onChange={e => setPrepVol(e.target.value)} /></div><div className="input-group-sidebar"><label>MM (g/mol)</label><input className="input-sidebar" type="number" value={prepMM} onChange={e => setPrepMM(e.target.value)} /></div><button className="btn-sidebar" onClick={calcPreparo}>CALCULAR MASSA</button>{prepMassa && (<div style={{marginTop:'20px', textAlign:'center'}}><div style={{fontSize:'2.5rem', color:'var(--primary)'}}>{prepMassa.massa_necessaria} g</div></div>)}</div>)}

        {activeTab === 'espectro' && (<div className="card" style={{maxWidth: '600px', margin: '0 auto'}}><h2>Lei de Beer-Lambert</h2><div className="input-group-sidebar"><label>Abs (A)</label><input className="input-sidebar" type="number" value={beerAbs} onChange={e => setBeerAbs(e.target.value)} /></div><div className="input-group-sidebar"><label>Epsilon (ε)</label><input className="input-sidebar" type="number" value={beerEpsilon} onChange={e => setBeerEpsilon(e.target.value)} /></div><div className="input-group-sidebar"><label>Caminho (cm)</label><input className="input-sidebar" type="number" value={beerCaminho} onChange={e => setBeerCaminho(e.target.value)} /></div><button className="btn-sidebar" onClick={calcBeer}>CALCULAR</button>{beerConc && (<div style={{marginTop:'20px', textAlign:'center'}}><div style={{fontSize:'2.5rem', color:'var(--primary)'}}>{beerConc.concentracao} M</div></div>)}</div>)}

      </main>
      {showModal && (<div className="modal-overlay"><div className="modal"><h2>Confirmar</h2><div className="modal-actions"><button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn-confirm" onClick={executeDelete}>Excluir</button></div></div></div>)}
    </div>
  )
}

export default App