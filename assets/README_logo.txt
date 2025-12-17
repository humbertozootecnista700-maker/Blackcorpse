Por favor, salve a imagem do bode que você anexou neste projeto com o nome exato:

  assets/goat-logo.png

Observações:
- O arquivo deve ser PNG ou JPG (PNG recomendado para melhor qualidade). 
- Depois de colado, abra `Blackcorpse.html` no navegador — o logo será carregado automaticamente.
- Se preferir que eu gere uma versão otimizada (redimensionada) do logo para web, me diga a largura desejada em pixels (ex: 128, 256, 512) e eu prepararei um arquivo raster aqui.

Como colocar a imagem no Windows (PowerShell):
1. Salve o anexo na sua pasta de Downloads como `goat.png`.
2. Execute no terminal (na raiz do projeto):

   Copy-Item -Path "$env:USERPROFILE\Downloads\goat.png" -Destination "assets\goat-logo.png"

Ou simplesmente arraste o arquivo para a pasta `assets/` e renomeie para `goat-logo.png`.

Se quiser, eu também posso renomear automaticamente o arquivo e ajustar o HTML; basta confirmar que eu posso sobrescrever arquivos existentes.
