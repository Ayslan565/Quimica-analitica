import numpy as np

def calcular_curva_titulacao(ca: float, va: float, cb: float, pka: float = None):
    """
    Simula titulação de Ácido (Forte ou Fraco) com Base Forte.
    - ca: Concentração Ácido (mol/L)
    - va: Volume Ácido (mL)
    - cb: Concentração Base (mol/L)
    - pka: Se fornecido, considera ácido fraco. Se None, ácido forte.
    """
    
    # Volume de equivalência: Ca * Va = Cb * Veq
    if cb <= 0: return {"erro": "Concentração da base deve ser maior que zero."}
    v_eq = (ca * va) / cb
    v_final = 2 * v_eq if v_eq > 0 else 10.0
    
    # Gera 200 pontos para o gráfico ficar suave
    volumes_base = np.linspace(0, v_final, 200)
    phs = []

    # Constante de dissociação da água
    kw = 1.0e-14
    
    # Se for ácido fraco, calcula Ka
    ka = 10**(-pka) if pka is not None else None

    for vb in volumes_base:
        v_total = va + vb
        
        # --- LÓGICA: ÁCIDO FORTE ---
        if pka is None:
            if vb == 0:
                ph = -np.log10(ca)
            elif vb < v_eq:
                mols_h = (ca * va) - (cb * vb)
                ph = -np.log10(mols_h / v_total)
            elif np.isclose(vb, v_eq):
                ph = 7.00
            else:
                mols_oh = (cb * vb) - (ca * va)
                poh = -np.log10(mols_oh / v_total)
                ph = 14.0 - poh

        # --- LÓGICA: ÁCIDO FRACO (Novo!) ---
        else:
            if vb == 0:
                # Início: pH depende apenas da dissociação do ácido fraco
                # Aproximação: [H+] = sqrt(Ka * Ca)
                h_plus = np.sqrt(ka * ca)
                ph = -np.log10(h_plus)
            
            elif vb < v_eq:
                # Região Tampão (Henderson-Hasselbalch)
                # pH = pKa + log([Sal]/[Acido])
                mols_sal = cb * vb       # O que reagiu virou sal
                mols_acido = (ca * va) - mols_sal # O que sobrou
                
                # Proteção contra log(0)
                if mols_acido <= 1e-10: mols_acido = 1e-10
                if mols_sal <= 1e-10: mols_sal = 1e-10
                
                ph = pka + np.log10(mols_sal / mols_acido)
            
            elif np.isclose(vb, v_eq, atol=1e-3):
                # Ponto de Equivalência: Hidrólise do Sal
                # A- + H2O <-> HA + OH-
                # Kh = Kw / Ka
                # [OH-] = sqrt(Kh * C_sal)
                kh = kw / ka
                c_sal = (ca * va) / v_total
                oh_minus = np.sqrt(kh * c_sal)
                poh = -np.log10(oh_minus)
                ph = 14.0 - poh
            
            else:
                # Excesso de Base Forte (suprime a hidrólise)
                # O pH é dominado apenas pelo excesso de OH- da base forte
                mols_oh = (cb * vb) - (ca * va)
                poh = -np.log10(mols_oh / v_total)
                ph = 14.0 - poh
        
        # Garante limites físicos (0-14) para o gráfico não quebrar
        ph = max(0.0, min(14.0, ph))
        phs.append(round(ph, 2))

    return {
        "volume_base": volumes_base.tolist(),
        "ph": phs,
        "ponto_equivalencia": float(round(v_eq, 2)),
        "tipo": "Ácido Fraco" if pka else "Ácido Forte"
    }