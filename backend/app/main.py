import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Importa as engines
from app.engines.titulacao import calcular_curva_titulacao 
from app.engines.estatistica import calcular_estatisticas_triplicata
from app.engines.calibracao import calcular_regressao_linear # <--- NOVO IMPORT

app = FastAPI(title="API Química Analítica")

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

# NOVA ROTA DE CALIBRAÇÃO
@app.post("/calibracao/calcular")
def api_calibracao(dados: list = Body(...)):
    return calcular_regressao_linear(dados)

# --- SERVIR SITE ---
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(backend_dir)
path_frontend_dist = os.path.join(project_root, "frontend", "dist")

if os.path.exists(path_frontend_dist):
    app.mount("/", StaticFiles(directory=path_frontend_dist, html=True), name="site")