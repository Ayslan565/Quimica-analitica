import { useEffect } from 'react';

const AdBanner = ({ slotId, format = 'auto', style = {} }) => {
  useEffect(() => {
    try {
      // Tenta empurrar o anuncio para a fila do AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erro no AdSense:", e);
    }
  }, []); // O array vazio garante que isso rode apenas quando o componente montar

  return (
    <div style={{ margin: '20px 0', textAlign: 'center', ...style }}>
        <small style={{display:'block', color:'#ccc', fontSize:'10px'}}>Publicidade</small>
        <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-SEU_ID_DO_ADSENSE_AQUI" /* COLOCAR SEU ID AQUI TAMBÉM */
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true">
        </ins>
    </div>
  );
};

export default AdBanner;