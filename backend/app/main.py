import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Importa engines
from app.engines.titulacao import calcular_curva_titulacao 
from app.engines.estatistica import calcular_estatisticas_triplicata
from app.engines.calibracao import calcular_regressao_linear
# NOVO IMPORT: obter_tabela_completa
from app.engines.quimica import calcular_massa_molar, calcular_preparo_solucao, calcular_beer_lambert, obter_tabela_completa

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
@app.post("/titulacao/acido-forte")
def api_titulacao(conc_acido: float, vol_acido: float, conc_base: float):
    return calcular_curva_titulacao(conc_acido, vol_acido, conc_base)

@app.post("/experimental/calcular")
def api_experimental(dados: list = Body(...)):
    return calcular_estatisticas_triplicata(dados)

@app.post("/calibracao/calcular")
def api_calibracao(dados: list = Body(...)):
    return calcular_regressao_linear(dados)

@app.post("/quimica/massa-molar")
def api_massa_molar(formula: str = Body(..., embed=True)):
    return calcular_massa_molar(formula)

@app.post("/quimica/preparo")
def api_preparo(concentracao: float = Body(...), volume: float = Body(...), massa_molar: float = Body(...)):
    return calcular_preparo_solucao(concentracao, volume, massa_molar)

@app.post("/quimica/beer")
def api_beer(absorbancia: float = Body(...), epsilon: float = Body(...), caminho: float = Body(...)):
    return calcular_beer_lambert(absorbancia, epsilon, caminho)

# --- NOVA ROTA TABELA ---
@app.get("/quimica/tabela")
def api_tabela():
    return obter_tabela_completa()

# --- SERVIR SITE ---
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(backend_dir)
path_frontend_dist = os.path.join(project_root, "frontend", "dist")

if os.path.exists(path_frontend_dist):
    app.mount("/", StaticFiles(directory=path_frontend_dist, html=True), name="site")