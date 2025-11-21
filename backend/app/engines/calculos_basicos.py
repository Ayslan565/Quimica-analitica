def calcular_ph_acido_forte(concentracao: float):
    import numpy as np
    
    if concentracao <= 0:
        return {"erro": "Concentração deve ser maior que zero"}
    
    # Fórmula básica: pH = -log[H+]
    ph = -np.log10(concentracao)
    return {"ph": round(ph, 2), "concentracao": concentracao}