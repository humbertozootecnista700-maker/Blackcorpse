// convert-images.js
// Requisitos: node.js e sharp (instale com `npm install`)
// Uso: node convert-images.js
// Gera versões WebP e JPEG em múltiplas larguras a partir de assets/cemiterio.png

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, 'assets', 'cemiterio.png');
if(!fs.existsSync(input)){
  console.error('Arquivo não encontrado:', input);
  process.exit(1);
}

const sizes = [480, 800, 1200, 2000];

async function run(){
  console.log('Iniciando conversão de', input);
  const srcset = [];
  for(const w of sizes){
    const outWebP = path.join(__dirname, 'assets', `cemiterio-${w}.webp`);
    const outJpg = path.join(__dirname, 'assets', `cemiterio-${w}.jpg`);

    // WebP otimizado
    await sharp(input)
      .rotate()
      .resize({ width: w })
      .webp({ quality: 82 })
      .toFile(outWebP);

    // JPEG fallback
    await sharp(input)
      .rotate()
      .resize({ width: w })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(outJpg);

    console.log('Gerado:', outWebP, outJpg);
    srcset.push(`${path.basename(outWebP)} ${w}w`);
  }

  // gerar arquivo HTML snippet com srcset (útil se quiser usar <img> ou <picture>)
  const snippet = `<!-- Gerado por convert-images.js -->\n<picture>\n  <source type=\"image/webp\" srcset=\"${sizes.map(s=>`assets/cemiterio-${s}.webp ${s}w`).join(', ')}\">\n  <img src=\"assets/cemiterio-1200.jpg\" srcset=\"${sizes.map(s=>`assets/cemiterio-${s}.jpg ${s}w`).join(', ')}\" sizes=\"100vw\" alt=\"Cemitério\">\n</picture>\n`;

  const outSnippet = path.join(__dirname, 'assets', 'cemiterio-srcset.html');
  fs.writeFileSync(outSnippet, snippet, 'utf8');
  console.log('Snippet gerado em', outSnippet);
  console.log('Concluído. Agora carregue os arquivos em assets/ e atualize o site (detect-bg.js escolhe o melhor WebP).');
}

run().catch(err => { console.error(err); process.exit(1); });
