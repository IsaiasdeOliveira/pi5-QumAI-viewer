# QumAI -  (Frontend)

Este repositório contém a aplicação de interface gráfica (Frontend) do projeto **QumAI**, desenvolvida para o campeonato da disciplina de Projeto Integrador V. 

O objetivo desta aplicação é consumir a API central do campeonato e fornecer um painel de controle interativo, permitindo o registro de jogadores inteligentes, o gerenciamento de credenciais de acesso (Tokens) e a visualização em tempo real das partidas.

---

##  Tecnologias Utilizadas

A aplicação foi projetada para ser leve, reativa e de rápida renderização, utilizando o seguinte ecossistema:

* **React (JS):** Biblioteca principal para a construção da interface baseada em componentes.
* **Vite:** *Bundler* de alta performance utilizado para otimização do ambiente de desenvolvimento e construção do *build* de produção.
* **CSS/Estilização (Tailwind CSS):** Abordagem utilitária para construção rápida de layouts responsivos, garantindo um tema escuro (*Dark Mode*) de alto contraste adequado para o painel da Arena.
* **Fetch API / WebSockets:** Camadas de comunicação assíncrona (REST) e streaming em tempo real para escutar as atualizações dos robôs na Arena.

---

## Arquitetura e Estrutura de Diretórios

O projeto segue uma arquitetura modularizada, separando claramente as responsabilidades de roteamento, componentes visuais e lógica de integração:

* `/src/components`: Contém os componentes globais e reutilizáveis da aplicação (ex: `root-layout.jsx`, `root-menu.jsx`).
* `/src/feature/game`: Agrupa os componentes e a lógica de estado específicos para a visualização das partidas e interação com o tabuleiro.
* `/src/routes`: Define as rotas principais de navegação da aplicação (Home, Sobre, Jogador).
* `/src/helpers` & `/src/constants`: Funções utilitárias e constantes globais de rede.
* `/src/styles` & `/src/ui`: Definições visuais e elementos de interface primitivos.

---

##  Funcionalidades Principais

A interface atende a todos os requisitos de visualização e controle do campeonato:

1. **Gestão de Identidade (Painel do Jogador):**
   * Interface para cadastro de novos agentes lógicos (IA) na API do professor.
   * Sistema de sincronização e atualização dinâmica do *Endpoint de Movimento* da IA (ex: configuração da rota `/move` da API Python do QumAI).
   * Armazenamento seguro de sessão via integração com o *Local Storage* para o *Access Token* JWT.

2. **Arena e Visualização de Partidas (Home):**
   * Listagem de todas as partidas registradas no servidor do campeonato.
   * Exibição do status em tempo real de cada embate (`FINISHED`, `WAITING_PLAYERS`, etc.).
   * Injeção dinâmica de cabeçalhos de autorização (`Bearer Token`) para acessar rotas protegidas e consumir os dados do torneio sem bloqueios de CORS ou erros de 401 Unauthorized.
   * Histórico real-time com alimentação híbrida via Sockets e HTTP Fallback.

---

## Como Executar o Projeto Localmente

Para iniciar o visualizador da Arena em sua máquina, certifique-se de ter o **Node.js** instalado e siga os passos:

1. Clone o repositório para a sua máquina local.
2. Navegue até a pasta do projeto e instale as dependências executando:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```
4. Abra o seu navegador e acesse o endereço gerado no terminal (geralmente http://localhost:5173).

## Documentação de Entrega e Decisões de Projeto
Para uma explicação detalhada sobre as motivações de design, a estrutura de montagem de cada componente, tratamento de falhas e os critérios obrigatórios avaliados pelo professor, acesse o arquivo **[REPORT.md](./REPORT.md)** presente na raiz deste repositório.
   
