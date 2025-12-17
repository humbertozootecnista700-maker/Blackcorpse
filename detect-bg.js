// detect-bg.js
// Detecta suporte a WebP, escolhe a melhor largura da imagem gerada e define a variável CSS --bg-url
(function(){
  // lista de arquivos gerados pelo conversor (sizes devem existir):
  const variants = [
    {w:480, file:'assets/cemiterio-480.webp'},
    {w:800, file:'assets/cemiterio-800.webp'},
    {w:1200, file:'assets/cemiterio-1200.webp'},
    {w:2000, file:'assets/cemiterio-2000.webp'}
  ];

  function supportsWebP(callback){
    try{
      const img = new Image();
      img.onload = function(){ callback(img.width > 0 && img.height > 0); };
      img.onerror = function(){ callback(false); };
      img.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
    }catch(e){ callback(false); }
  }

  function chooseVariant(){
    const w = Math.max(window.innerWidth, document.documentElement.clientWidth || 0) * (window.devicePixelRatio || 1);
    // escolha o menor arquivo que seja >= w; caso contrário use o maior
    for(let i=0;i<variants.length;i++){
      if(variants[i].w >= w) return variants[i].file;
    }
    return variants[variants.length-1].file;
  }

  supportsWebP(function(hasWebP){
    const root = document.documentElement;
    if(hasWebP){
      const selected = chooseVariant();
      root.style.setProperty('--bg-url', `url('${selected}')`);
      root.classList.add('webp');
    } else {
      // fallback para PNG original
      root.style.setProperty('--bg-url', "url('assets/cemiterio.png')");
      root.classList.add('no-webp');
    }
  });

  // reavaliar ao redimensionar em dispositivos que possam mudar DPR
  let resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      // apenas re-run if webp supported
      if(document.documentElement.classList.contains('webp')){
        const selected = chooseVariant();
        document.documentElement.style.setProperty('--bg-url', `url('${selected}')`);
      }
    }, 250);
  });
})();
