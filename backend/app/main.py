import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Importa engines
from app.engines.titulacao import calcular_curva_titulacao 
from app.engines.estatistica import calcular_estatisticas_triplicata
from app.engines.calibracao import calcular_regressao_linear

# Importa engines de química (incluindo a nova função calcular_tampao)
from app.engines.quimica import (
    calcular_massa_molar, 
    calcular_preparo_solucao, 
    calcular_beer_lambert, 
    obter_tabela_completa, 
    calcular_tampao
)

app = FastAPI(title="API Química Analítica")

# CORS
origins = [
    "http://localhost:5173",
    "https://quimica-analitica-1.onrender.com",
    "https://quimica-analitica.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROTAS ---

# Rota de Titulação (Atualizada para aceitar pKa opcional para ácido fraco)
@app.post("/quimica/titulacao")
def api_titulacao(
    conc_acido: float = Body(...), 
    vol_acido: float = Body(...), 
    conc_base: float = Body(...),
    pka: float = Body(None) # Opcional: Se enviado, calcula como ácido fraco
):
    return calcular_curva_titulacao(conc_acido, vol_acido, conc_base, pka)

# Rota de Tratamento Estatístico
@app.post("/experimental/calcular")
def api_experimental(dados: list = Body(...)):
    return calcular_estatisticas_triplicata(dados)

# Rota de Calibração
@app.post("/calibracao/calcular")
def api_calibracao(dados: list = Body(...)):
    return calcular_regressao_linear(dados)

# Rota de Massa Molar
@app.post("/quimica/massa-molar")
def api_massa_molar(formula: str = Body(..., embed=True)):
    return calcular_massa_molar(formula)

# Rota de Preparo de Soluções
@app.post("/quimica/preparo")
def api_preparo(concentracao: float = Body(...), volume: float = Body(...), massa_molar: float = Body(...)):
    return calcular_preparo_solucao(concentracao, volume, massa_molar)

# Rota de Lei de Beer-Lambert
@app.post("/quimica/beer")
def api_beer(absorbancia: float = Body(...), epsilon: float = Body(...), caminho: float = Body(...)):
    return calcular_beer_lambert(absorbancia, epsilon, caminho)

# Rota da Tabela Periódica
@app.get("/quimica/tabela")
def api_tabela():
    return obter_tabela_completa()

# NOVA ROTA: Calculadora de Tampão
@app.post("/quimica/tampao")
def api_tampao(
    ph: float = Body(...),
    pka: float = Body(...),
    conc_total: float = Body(...),
    volume: float = Body(...),
    mm_acido: float = Body(...),
    mm_sal: float = Body(...)
):
    return calcular_tampao(ph, pka, conc_total, volume, mm_acido, mm_sal)

# --- SERVIR SITE (Frontend estático) ---
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(backend_dir)
path_frontend_dist = os.path.join(project_root, "frontend", "dist")

if os.path.exists(path_frontend_dist):
    app.mount("/", StaticFiles(directory=path_frontend_dist, html=True), name="site")