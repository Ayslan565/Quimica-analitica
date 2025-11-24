import { useEffect } from 'react';

const AdBanner = ({ slotId, format = 'auto', style = {} }) => {
  useEffect(() => {
    try {
      // Tenta carregar o anúncio. 
      // O array [] no final garante que isso rode apenas uma vez ao montar o componente.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erro no AdSense:", e);
    }
  }, []);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center', ...style }}>
        <small style={{display:'block', color:'#ccc', fontSize:'10px'}}>Publicidade</small>
        {/* O bloco <ins> é onde o Google injeta o anúncio */}
        <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-6572314594059473" 
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true">
        </ins>
    </div>
  );
};

export default AdBanner;