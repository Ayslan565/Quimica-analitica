import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './App.css'

// --- IMPORTAÇÃO DOS ANÚNCIOS ---
// Certifique-se de que o arquivo AdBanner.jsx existe na pasta src
import AdBanner from './AdBanner'

// --- IMPORTAÇÃO SEGURA DO PLOTLY ---
import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'
const Plot = createPlotlyComponent.default 
  ? createPlotlyComponent.default(Plotly) 
  : createPlotlyComponent(Plotly)

// --- CONFIGURAÇÃO DA API (ATUALIZADA) ---
// Se estiver em produção (Render), usa o link do seu backend.
// Se estiver local, o Vite gerencia o proxy (vazio).
const API_URL = import.meta.env.PROD 
  ? 'https://quimica-analitica.onrender.com' 
  : ''; 

function App() {
  // --- NAVEGAÇÃO ---
  const [activeTab, setActiveTab] = useState('dados') // 'dados', 'molaridade', 'diluicao'

  // --- ESTADOS: TRATAMENTO DE DADOS ---
  const [qtdColunas, setQtdColunas] = useState(3)
  const [linhas, setLinhas] = useState([{ volume: 0 }, { volume: 1 }, { volume: 2 }])
  const [resultado, setResultado] = useState(null)
  const [status, setStatus] = useState("Aguardando dados...")
  
  // --- ESTADOS: MOLARIDADE ---
  const [molMassa, setMolMassa] = useState('')
  const [molMM, setMolMM] = useState('')
  const [molVol, setMolVol] = useState('')
  const [molResultado, setMolResultado] = useState(null)

  // --- ESTADOS: DILUIÇÃO ---
  const [dilC1, setDilC1] = useState('')
  const [dilV1, setDilV1] = useState('')
  const [dilC2, setDilC2] = useState('')
  const [dilV2, setDilV2] = useState('') 

  // --- PERSONALIZAÇÃO GERAL ---
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [accentColor, setAccentColor] = useState('#6366f1') 
  const [mostrarSeries, setMostrarSeries] = useState(true)
  
  // --- ESTILOS DO GRÁFICO ---
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

  // --- FUNÇÕES: MOLARIDADE ---
  const calcularMolaridade = () => {
    const m = parseFloat(molMassa)
    const mm = parseFloat(molMM)
    const v = parseFloat(molVol)
    if (m && mm && v) {
      const mol = m / (mm * (v / 1000)) // V em mL para L
      setMolResultado(mol.toFixed(4))
    }
  }

  // --- FUNÇÕES: DILUIÇÃO ---
  const calcularDiluicao = () => {
    const c1 = parseFloat(dilC1); const v1 = parseFloat(dilV1);
    const c2 = parseFloat(dilC2); const v2 = parseFloat(dilV2);
    
    let res = 0;
    if (c1 && v1 && c2 && !v2) { res = (c1 * v1) / c2; alert(`V2 Calculado: ${res.toFixed(2)} mL`); }
    else if (c1 && v1 && !c2 && v2) { res = (c1 * v1) / v2; alert(`C2 Calculado: ${res.toFixed(4)} M`); }
    else if (!c1 && v1 && c2 && v2) { res = (c2 * v2) / v1; alert(`C1 Calculado: ${res.toFixed(4)} M`); }
    else if (c1 && !v1 && c2 && v2) { res = (c2 * v2) / c1; alert(`V1 Calculado: ${res.toFixed(2)} mL`); }
    else { alert("Preencha 3 campos para calcular o 4º!"); }
  }

  // --- FUNÇÕES: TRATAMENTO DE DADOS ---
  const handlePaste = (e, rowIndexStart, colIndexStart, type) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const rows = pasteData.split(/\r\n|\n|\r/).filter(row => row.trim() !== '');
    const novasLinhas = [...linhas];
    rows.forEach((row, i) => {
      const currentRowIdx = rowIndexStart + i;
      if (!novasLinhas[currentRowIdx]) novasLinhas[currentRowIdx] = {};
      const cols = row.split('\t');
      cols.forEach((val, j) => {
        const cleanVal = val.trim().replace(',', '.');
        if (type === 'vol') {
          if (j === 0) novasLinhas[currentRowIdx].volume = cleanVal;
          else { const phIndex = j - 1; if (phIndex < qtdColunas) novasLinhas[currentRowIdx][`ph${phIndex}`] = cleanVal; }
        } else if (type === 'ph') {
          const currentPhIdx = colIndexStart + j;
          if (currentPhIdx < qtdColunas) novasLinhas[currentRowIdx][`ph${currentPhIdx}`] = cleanVal;
        }
      });
    });
    setLinhas(novasLinhas);
  };

  const addLinha = () => {
    const ultVol = linhas.length > 0 ? parseFloat(linhas[linhas.length-1].volume || 0) : 0
    setLinhas([...linhas, { volume: ultVol + 1 }])
  }
  const addColuna = () => setQtdColunas(qtdColunas + 1)
  const confirmDelete = (tipo) => { setActionToDelete(tipo); setShowModal(true); }
  const executeDelete = () => {
    if (actionToDelete === 'row' && linhas.length > 1) {
        const novas = [...linhas]; novas.pop(); setLinhas(novas);
    } else if (actionToDelete === 'col' && qtdColunas > 1) {
        setQtdColunas(qtdColunas - 1);
    }
    setShowModal(false)
  }
  const handleChange = (index, chave, valor) => {
    const novas = [...linhas]; if (!novas[index]) novas[index] = {}; novas[index][chave] = valor; setLinhas(novas);
  }
  const updateCustomStyle = (idx, field, value) => {
    setCustomStyles(prev => ({ ...prev, [idx]: { ...prev[idx], [field]: value } }))
  }

  const calcular = useCallback(async () => {
    setStatus("Calculando...")
    try {
      const dadosLimpos = linhas.map(row => {
        let obj = { volume: parseFloat(row.volume) }
        for(let i=0; i < qtdColunas; i++){ if(row[`ph${i}`]) obj[`ph${i}`] = row[`ph${i}`] }
        return obj
      })
      
      // --- CHAMADA COM O LINK DO RENDER ---
      const res = await axios.post(`${API_URL}/experimental/calcular`, dadosLimpos) 
      
      setResultado(res.data)
      setStatus("Atualizado")
    } catch (error) { 
        console.error(error)
        setStatus("Erro na API") 
    }
  }, [linhas, qtdColunas])

  useEffect(() => {
    if(activeTab === 'dados') { 
        const timer = setTimeout(() => calcular(), 800)
        return () => clearTimeout(timer)
    }
  }, [calcular, activeTab])

  const gerarDadosGrafico = () => {
    if (!resultado) return []
    let traces = []
    const defaultColors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5'];

    if (mostrarSeries) {
      for (let i = 0; i < qtdColunas; i++) {
        const xData = []; const yData = []
        linhas.forEach(row => {
          if (row.volume !== undefined && row[`ph${i}`] !== undefined && row[`ph${i}`] !== "") {
             xData.push(parseFloat(row.volume)); yData.push(parseFloat(String(row[`ph${i}`]).replace(',', '.')))
          }
        })
        if (xData.length > 0) {
          const style = customStyles[i] || {}
          traces.push({
            x: xData, y: yData, type: 'scatter', mode: 'lines+markers',
            name: `Série ${i + 1}`,
            line: { color: style.color || defaultColors[i % defaultColors.length], width: style.width || grossuraGeralSeries, shape: 'spline' },
            marker: { size: (style.width || grossuraGeralSeries) + 4 }, 
            showlegend: true, opacity: 0.9, connectgaps: true
          })
        }
      }
    }
    traces.push({
      x: resultado.grafico.x, y: resultado.grafico.y, type: 'scatter', mode: 'lines+markers',
      name: nomeLegenda, 
      line: {color: accentColor, width: grossuraMedia, shape: 'spline'},
      marker: {color: isDarkMode ? '#fff' : '#000', size: grossuraMedia + 4, line: {color: accentColor, width: 2}},
      error_y: { type: 'data', array: resultado.grafico.erro, visible: true, color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' },
      connectgaps: true
    })
    return traces
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">🧪 LabData Pro</div>
        <div className="sidebar-content">
          
          {/* --- MENU DE NAVEGAÇÃO --- */}
          <div className="menu-group">
            <div className="menu-label">Ferramentas</div>
            <button className={`btn-sidebar ${activeTab === 'dados' ? 'active' : ''}`} onClick={() => setActiveTab('dados')}>
                📉 Tratamento de Dados
            </button>
            <button className={`btn-sidebar ${activeTab === 'molaridade' ? 'active' : ''}`} onClick={() => setActiveTab('molaridade')}>
                🧪 Molaridade
            </button>
            <button className={`btn-sidebar ${activeTab === 'diluicao' ? 'active' : ''}`} onClick={() => setActiveTab('diluicao')}>
                💧 Diluição
            </button>
          </div>

          {/* --- ANÚNCIO SIDEBAR --- */}
          {/* Coloque seu ID do AdSense no lugar de 'SEU_ID...' se ja tiver */}
          <div className="menu-group">
             <AdBanner 
                slotId="SEU_ID_BLOCO_VERTICAL" 
                style={{minHeight: '250px'}} 
             /> 
          </div>

          {/* --- CONTROLES (Só aparecem na aba DADOS) --- */}
          {activeTab === 'dados' && (
            <>
                <div className="menu-group" style={{borderTop: '1px solid var(--border)', paddingTop: '15px'}}>
                    <div className="menu-label">Estrutura</div>
                    <button className="btn-sidebar" onClick={addLinha}><span>➕</span> Add Linha</button>
                    <button className="btn-sidebar" onClick={addColuna}><span>➕</span> Add Coluna</button>
                    <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
                        <button className="btn-sidebar danger small" onClick={() => confirmDelete('row')}>- Linha</button>
                        <button className="btn-sidebar danger small" onClick={() => confirmDelete('col')}>- Coluna</button>
                    </div>
                </div>

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
            </>
          )}

          {/* CONFIGURAÇÃO GLOBAL */}
          <div className="menu-group" style={{marginTop: 'auto'}}>
             <div className="setting-item"><span>Tema</span><button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '🌙' : '☀️'}</button></div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        
        {/* --- ANÚNCIO TOPO (Banner Horizontal) --- */}
        <AdBanner 
            slotId="SEU_ID_BLOCO_HORIZONTAL" 
            format="horizontal" 
            style={{marginBottom: '20px', minHeight: '90px'}} 
        />

        {/* --- ABA 1: TRATAMENTO DE DADOS --- */}
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
                        <td className="sticky-col">
                            <input type="number" value={linha.volume} onChange={e => handleChange(i, 'volume', e.target.value)} onPaste={(e) => handlePaste(e, i, 0, 'vol')}/>
                        </td>
                        {[...Array(qtdColunas)].map((_, j) => (
                            <td key={j}>
                            <input type="number" step="0.01" placeholder="-" value={linha[`ph${j}`] || ''} onChange={e => handleChange(i, `ph${j}`, e.target.value)} onPaste={(e) => handlePaste(e, i, j, 'ph')}/>
                            </td>
                        ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                {resultado && (
                <div className="results-grid">
                    <div className="card">
                    <Plot
                        data={gerarDadosGrafico()}
                        layout={{
                        title: { text: tituloGrafico, font: { size: 20, color: isDarkMode ? '#f8fafc' : '#1e293b', family: 'Arial' } },
                        autosize: true, height: 450,
                        paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                        font: {color: isDarkMode ? '#94a3b8' : '#475569'},
                        margin: {l: 70, r: 30, t: 80, b: 100},
                        xaxis: { title: { text: eixoX, font: {size:14} }, gridcolor: isDarkMode ? '#334155' : '#e2e8f0', zerolinecolor: '#334155' },
                        yaxis: { title: { text: eixoY, font: {size:14} }, gridcolor: isDarkMode ? '#334155' : '#e2e8f0', zerolinecolor: '#334155' },
                        legend: { orientation: 'h', y: -0.3 }
                        }}
                        useResizeHandler={true} style={{width: '100%'}}
                    />
                    </div>
                    <div className="card">
                    <h3>Estatística</h3>
                    {resultado.tabela.map((row, k) => (
                        <div key={k} className="data-row">
                        <span>{row.volume} {eixoX.toLowerCase().includes('ml') ? 'mL' : ''}</span>
                        <span><strong>{row.media}</strong> <small> (±{row.desvio})</small></span>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </>
        )}

        {/* --- ABA 2: MOLARIDADE --- */}
        {activeTab === 'molaridade' && (
            <>
                <header className="header-info">
                    <div><h2 style={{margin:0}}>Calculadora de Molaridade</h2></div>
                </header>
                <div className="card" style={{maxWidth: '600px', margin: '0 auto'}}>
                    <div className="input-group-sidebar">
                        <label>Massa do Soluto (g)</label>
                        <input className="input-sidebar" type="number" value={molMassa} onChange={e => setMolMassa(e.target.value)} placeholder="Ex: 50" />
                    </div>
                    <div className="input-group-sidebar">
                        <label>Massa Molar (g/mol)</label>
                        <input className="input-sidebar" type="number" value={molMM} onChange={e => setMolMM(e.target.value)} placeholder="Ex: 58.44 (NaCl)" />
                    </div>
                    <div className="input-group-sidebar">
                        <label>Volume da Solução (mL)</label>
                        <input className="input-sidebar" type="number" value={molVol} onChange={e => setMolVol(e.target.value)} placeholder="Ex: 500" />
                    </div>
                    <button className="btn-sidebar" style={{background: 'var(--primary)', color: 'white', marginTop: '20px', justifyContent: 'center'}} onClick={calcularMolaridade}>CALCULAR</button>
                    
                    {molResultado && (
                        <div style={{marginTop: '30px', textAlign: 'center', padding: '20px', background: 'var(--bg-body)', borderRadius: '8px'}}>
                            <h3 style={{margin:0, color: 'var(--text-muted)'}}>Concentração Molar</h3>
                            <div style={{fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)'}}>{molResultado} <span style={{fontSize: '1.5rem'}}>mol/L</span></div>
                        </div>
                    )}
                </div>
            </>
        )}

        {/* --- ABA 3: DILUIÇÃO --- */}
        {activeTab === 'diluicao' && (
            <>
                <header className="header-info">
                    <div><h2 style={{margin:0}}>Calculadora de Diluição</h2><small>C1 . V1 = C2 . V2</small></div>
                </header>
                <div className="card" style={{maxWidth: '800px', margin: '0 auto'}}>
                    <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>Preencha 3 campos e deixe vazio o que você quer descobrir.</p>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        <div className="input-group-sidebar"><label>Concentração Inicial (C1)</label><input className="input-sidebar" type="number" value={dilC1} onChange={e => setDilC1(e.target.value)} /></div>
                        <div className="input-group-sidebar"><label>Volume Inicial (V1)</label><input className="input-sidebar" type="number" value={dilV1} onChange={e => setDilV1(e.target.value)} /></div>
                        <div className="input-group-sidebar"><label>Concentração Final (C2)</label><input className="input-sidebar" type="number" value={dilC2} onChange={e => setDilC2(e.target.value)} /></div>
                        <div className="input-group-sidebar"><label>Volume Final (V2)</label><input className="input-sidebar" type="number" value={dilV2} onChange={e => setDilV2(e.target.value)} /></div>
                    </div>
                    <button className="btn-sidebar" style={{background: 'var(--primary)', color: 'white', marginTop: '20px', justifyContent: 'center'}} onClick={calcularDiluicao}>CALCULAR</button>
                </div>
            </>
        )}

      </main>
      
      {showModal && (<div className="modal-overlay"><div className="modal"><h2>Confirmar</h2><p>Deseja excluir?</p><div className="modal-actions"><button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn-confirm" onClick={executeDelete}>Excluir</button></div></div></div>)}
    </div>
  )
}

export default App