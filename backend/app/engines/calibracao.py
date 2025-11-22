import numpy as np
from x import stats

def calcular_regressao_linear(dados: list):
    """
    Recebe uma lista de pares {x, y}.
    Retorna a inclinação, intercepto, R² e pontos para o gráfico.
    """
    x_vals = []
    y_vals = []

    # Filtra dados válidos
    for item in dados:
        try:
            vx = float(str(item.get('x')).replace(',', '.'))
            vy = float(str(item.get('y')).replace(',', '.'))
            x_vals.append(vx)
            y_vals.append(vy)
        except (ValueError, TypeError):
            continue

    if len(x_vals) < 2:
        return {"erro": "É necessário pelo menos 2 pontos para calcular."}

    # --- O CÁLCULO CIENTÍFICO (SciPy) ---
    slope, intercept, r_value, p_value, std_err = stats.linregress(x_vals, y_vals)
    
    # Gera a linha de tendência (para o gráfico ficar bonito)
    x_line = np.linspace(min(x_vals), max(x_vals), 100)
    y_line = slope * x_line + intercept

    return {
        "resultados": {
            "inclinacao_a": round(slope, 5),
            "intercepto_b": round(intercept, 5),
            "r_quadrado": round(r_value**2, 5),
            "equacao": f"y = {slope:.4f}x + {intercept:.4f}" if intercept >= 0 else f"y = {slope:.4f}x - {abs(intercept):.4f}"
        },
        "grafico": {
            "x_reais": x_vals,
            "y_reais": y_vals,
            "x_linha": x_line.tolist(),
            "y_linha": y_line.tolist()
        }
    }