# LingoRPG English AI

LingoRPG é um jogo de aventura interativo baseado em texto, projetado para tornar o aprendizado de inglês divertido e imersivo. Embarque em missões épicas onde a IA atua como seu Mestre de Jogo pessoal, guiando-o através de uma história que você molda com suas decisões.

## Funcionalidades

- **Mestre de Jogo IA**: Uma IA guia sua história, criando desafios únicos e corrigindo seu inglês em tempo real.
- **Conversão de Texto em Fala**: Ouça a narração da IA. Clique no botão de play em uma mensagem para ouvi-la em voz alta. Você também pode clicar em qualquer frase para reproduzi-la individualmente.
- **Construtor de Vocabulário**: Dê um duplo clique em qualquer palavra na história para traduzi-la automaticamente e salvá-la em sua lista de vocabulário pessoal para revisão posterior.
- **Tradução Instantânea**: Selecione qualquer frase ou sentença para ver uma tradução instantânea para o português.

## Modos da Aplicação

O aplicativo é dividido em três seções principais:

1.  **RPG**: O coração da aplicação. Comece uma aventura baseada em texto, fornecendo um tema. A IA gerará um mundo para você explorar, e corrigirá sua gramática enquanto você joga.
2.  **Vocabulary**: Revise as palavras que você salvou. Use os flashcards para testar sua memória da palavra em inglês e sua tradução.
3.  **About**: Encontre informações sobre o projeto e suas funcionalidades.

## Pilha de Tecnologia

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **API de IA**: Google Gemini API (`@google/genai`)

## Configuração e Uso

1.  Instale as dependências do projeto com `npm install`.
2.  A API do Google Gemini requer uma chave de API. A aplicação espera que esta chave esteja disponível como uma variável de ambiente `process.env.API_KEY`.
3.  Durante o desenvolvimento, execute `npm run dev` para iniciar o servidor de desenvolvimento do Vite.
4.  Para gerar uma versão pronta para distribuição, utilize `npm run build`. Os arquivos serão gerados na pasta `dist` e podem ser servidos por qualquer servidor de conteúdo estático.

## Licença

Copyright (c) 2025 Cally Afiune.

Este projeto está licenciado sob a [Licença MIT](https://opensource.org/licenses/MIT).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
