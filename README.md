# Mangayomi Comics — experimental

Extensões JavaScript para **BatCave** (https://batcave.biz) e **ReadComicsOnline.ru** (https://readcomicsonline.ru).

## Instalar no Mangayomi (iOS)

Em Configurações → Explorar/Browse → Repositórios de extensões → Manga, adicione:

https://raw.githubusercontent.com/viniman27/mangayomi-comics/main/index.json

Depois abra Explorar → Extensões → Manga, atualize a lista e instale BatCave e ReadComicsOnline (idioma inglês/en). Não é necessário modo desenvolvedor.

As fontes estão marcadas como NSFW por precaução; caso não apareçam, confira o filtro de conteúdo adulto/NSFW e o filtro de idioma. Essa marcação não filtra o conteúdo do site.

## Limitações importantes

- Catálogo, novidades, busca, detalhes, capítulos e URLs de páginas implementados.
- 15 testes locais com fixtures **sintéticas** passaram; não comprovam funcionamento nos sites nem no runtime do app.
- As tentativas de leitura real foram bloqueadas por Cloudflare. **Nenhuma leitura foi homologada no Mangayomi.**
- Se houver bloqueio, abra a fonte na WebView do Mangayomi, conclua manualmente a verificação e tente novamente. Isso não garante liberação; BatCave pode exigir DLE Guard.
- Versão mínima configurada: 0.9.95, cuja interface/contrato foi usada como referência. Compatibilidade com versões anteriores não certificada.
- Sem filtros avançados, login ou tradução de conteúdo.

Este repositório contém somente código, metadados de instalação e licença. Não contém quadrinhos, credenciais ou cookies. Não é afiliado ao Mangayomi ou aos sites.

## BatCave 1.0.1

Corrige a dupla codificação do corpo JSON no bridge HTTP do Mangayomi. A versão 1.0.0 enviava uma string JSON onde a API espera um objeto. Os testes agora modelam essa serialização e reproduzem a falha anterior.

Erros HTTP passaram a mostrar método e rota (sem query string). O diagnóstico de resposta sem imagens identifica o quadrinho e capítulo. Isso não equivale a uma correção confirmada de HTTP 404: a rota específica ainda precisa ser identificada.

Para receber o patch, atualize a lista de extensões e atualize BatCave para **1.0.1**. Não é necessário remover a fonte ou a biblioteca.

## Créditos

Seletores e protocolo adaptados das implementações públicas do projeto [Keiyoushi](https://github.com/keiyoushi/extensions-source). Veja LICENSE (Apache-2.0) e NOTICE.
