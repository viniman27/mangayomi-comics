# Mangayomi Comics — experimental

Extensões JavaScript para **BatCave** (https://batcave.biz) e **ReadComicsOnline.ru** (https://readcomicsonline.ru).

## Instalar no Mangayomi (iOS)

Em Configurações → Explorar/Browse → Repositórios de extensões → Manga, adicione:

https://raw.githubusercontent.com/viniman27/mangayomi-comics/main/index.json

Depois abra Explorar → Extensões → Manga, atualize a lista e instale BatCave e ReadComicsOnline (idioma inglês/en). Não é necessário modo desenvolvedor.

As fontes estão marcadas como NSFW por precaução; caso não apareçam, confira o filtro de conteúdo adulto/NSFW e o filtro de idioma. Essa marcação não filtra o conteúdo do site.

## Limitações importantes

- Catálogo, novidades, busca, detalhes, capítulos e URLs de páginas implementados.
- 19 testes locais com fixtures **sintéticas** passaram; não comprovam funcionamento nos sites nem no runtime do app.
- BatCave 1.0.1 teve funcionamento confirmado por uso no iOS. ReadComicsOnline continua experimental e sem leitura confirmada. As tentativas diretas no ambiente de desenvolvimento seguem bloqueadas por Cloudflare.
- Se houver bloqueio, abra a fonte na WebView do Mangayomi, conclua manualmente a verificação e tente novamente. Isso não garante liberação; BatCave pode exigir DLE Guard.
- Versão mínima configurada: 0.9.95, cuja interface/contrato foi usada como referência. Compatibilidade com versões anteriores não certificada.
- Sem filtros avançados, login ou tradução de conteúdo.

Este repositório contém somente código, metadados de instalação e licença. Não contém quadrinhos, credenciais ou cookies. Não é afiliado ao Mangayomi ou aos sites.

## BatCave 1.0.1

Corrige a dupla codificação do corpo JSON no bridge HTTP do Mangayomi. A versão 1.0.0 enviava uma string JSON onde a API espera um objeto. Os testes agora modelam essa serialização e reproduzem a falha anterior.

Erros HTTP passaram a mostrar método e rota (sem query string). O diagnóstico de resposta sem imagens identifica o quadrinho e capítulo. Isso não equivale a uma correção confirmada de HTTP 404: a rota específica ainda precisa ser identificada.

Para receber o patch, atualize a lista de extensões e atualize BatCave para **1.0.1**. Não é necessário remover a fonte ou a biblioteca.

## ReadComicsOnline 1.0.1

Se a primeira página do catálogo vier vazia, bloqueada ou não reconhecida por HTTP, tenta carregar a mesma URL pela WebView interna do Mangayomi. Utiliza `evaluateJavascriptViaWebview` disponível no app e pode levar até cerca de 20 segundos nessa tentativa adicional.

Se ainda não conseguir reconhecer o catálogo, informa se houve timeout, Cloudflare ou quantos cards/títulos/links foram encontrados. O diagnóstico não exporta HTML, cookies ou dados da sessão para este repositório.

Esta é uma alternativa experimental, **não uma correção confirmada da causa no iOS**. A WebView usada em segundo plano pode ter comportamento diferente da WebView visível. A mudança cobre populares e novidades; busca textual, detalhes e leitor continuam usando HTTP.

Atualize a lista de extensões e instale a atualização **ReadComicsOnline 1.0.1**. Não remova a biblioteca nem reinstale o repositório. O código do BatCave não mudou nesta atualização.

## Créditos

Seletores e protocolo adaptados das implementações públicas do projeto [Keiyoushi](https://github.com/keiyoushi/extensions-source). Veja LICENSE (Apache-2.0) e NOTICE.
