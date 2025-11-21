# Arquivo: backend/app/engines/titulacao.py
import numpy as np

def calcular_curva_titulacao(ca: float, va: float, cb: float):
    """
    Simula titulação de Ácido Forte (no erlenmeyer) com Base Forte (na bureta).
    ca: Concentração do Ácido (mol/L)
    va: Volume inicial do Ácido (mL)
    cb: Concentração da Base (mol/L)
    """
    
    # Vamos simular adicionar base de 0 até 2x o volume de equivalência
    # V_eq = (Ca * Va) / Cb
    v_eq = (ca * va) / cb
    v_final = 2 * v_eq 
    
    # Criar 100 pontos de volume (de 0 até v_final)
    volumes_base = np.linspace(0, v_final, 100)
    phs = []

    kw = 1.0e-14

    for vb in volumes_base:
        if vb == 0:
            # Apenas ácido
            h_plus = ca
            ph = -np.log10(h_plus)
        elif vb < v_eq:
            # Antes do ponto de equivalência (excesso de ácido)
            # mols H+ restantes = (Ca*Va - Cb*Vb) / V_total
            mols_h = (ca * va) - (cb * vb)
            v_total = va + vb
            h_plus = mols_h / v_total
            ph = -np.log10(h_plus)
        elif vb == v_eq:
            # Ponto de equivalência (neutro para forte/forte)
            ph = 7.0
        else:
            # Após o ponto de equivalência (excesso de base)
            # mols OH- excesso = (Cb*Vb - Ca*Va) / V_total
            mols_oh = (cb * vb) - (ca * va)
            v_total = va + vb
            oh_minus = mols_oh / v_total
            poh = -np.log10(oh_minus)
            ph = 14.0 - poh
            
        phs.append(round(ph, 2))

    # Retorna listas prontas para o gráfico
    return {
        "volume_base": volumes_base.tolist(), # eixo X
        "ph": phs,                            # eixo Y
        "ponto_equivalencia": v_eq
    }