# NEXA BLUE — Auditoria de navegação e publicação
**Data:** 30/10/2026
**Repositório:** Tiago22a/nexa-sites · branch main
**Escopo:** homepage, BARCO, IATE, SUBMARINO, NEXA SHOP, contatos, checkout, acessos administrativos e configuração de publicação.

## Diagnóstico de disponibilidade (pendente)
- O endereço previamente divulgado `https://nexasitesdev.com.br/` não pôde ser aberto pelos testes externos executados.
- O ambiente de inspeção também não conseguiu resolver nomes de outros domínios conhecidos; isso impede atribuir o problema exclusivamente ao DNS do domínio da NEXA.
- Uma URL provisória de Netlify havia sido referida em trabalho anterior (`https://nexasite.netlify.app/`), mas não pôde ser validada em tempo real.
- O GitHub confirma os arquivos, mas não é a hospedagem; GitHub Pages não está habilitado.
- A confirmação de um link público funcional exige verificar o estado do projeto, último deploy publicado, associação do repositório e eventual suspensão da equipe no painel do Netlify. **Não considerar a produção homologada.**

## Jornada simulada por inspeção de código
| Passo do visitante | Verificação no código | Resultado |
|---|---|---|
| Abrir a homepage | index.html e navegação de menu | Rotas e IDs de seção encontrados |
| Selecionar Soluções | Botões `data-service` e JS de abertura WhatsApp | Vinculados no código |
| Escolher BARCO / IATE / SUBMARINO | Cards e links para páginas individuais | Destinos locais existentes |
| Solicitar conversa imediata | Botões WhatsApp na home e no hero de cada plano | Mensagens pré-preenchidas por plano |
| Explorar entregas | Âncoras para galeria, operação, entregáveis e contratação | Âncoras existentes |
| Alternar 'Visão do cliente' e 'Nos bastidores' | Antes sem handler | Corrigido com JS e teclado |
| Consultar dúvidas | `details/summary` nativo | Disponível |
| BARCO / IATE: selecionar condição | Radios e resumo gerado em JS | Conectados por script; pagamento não ocorre no site |
| Gerar minuta PDF | Script de geração local, condicionado aos campos | Implementado; download não validado em navegador publicado |
| SUBMARINO: solicitar orçamento | Sem preço, com ficha de pré-proposta e WhatsApp | Fluxo diferenciado; sem cobrança antecipada |
| Navegar na vitrine SHOP | Catálogo e 9 páginas individuais | Arquivos de destino existentes |
| Abrir contato em produto | WhatsApp com produto e link | Endereço enviado agora usa origem atual, não domínio Netlify fixo |
| Abrir formulário de contato | Modal de contato via `data-open-contact` | Script presente |
| Abrir o painel interno | `/comando/` e `/admin/` | Interfaces disponíveis no código; login depende de variáveis privadas e hospedagem |

## Correções realizadas
1. BARCO: coleção de até seis artes e legendas, entrega via grupo de WhatsApp e Google Drive, sem gestão contínua; publicação inicial opcional como cortesia.
2. IATE: execução recorrente pela NEXA, com limites contratuais preservados.
3. SUBMARINO: orçamento sob consulta; suprimidas opções de pagamento sem preço, e mensagens específicas de pré-proposta.
4. Botão de WhatsApp com contexto do plano na home e no início de cada página.
5. NEXA SHOP: links de produto no WhatsApp acompanham o domínio atual do visitante.
6. Removida requisição para vídeo de pescador que estava ausente; preservada imagem oceânica oficial.
7. Corrigidas abas Visão do cliente / Nos bastidores nos três planos.
8. Atualizados sitemap e cabeçalhos de privacidade do admin.
9. Adicionado `netlify.toml` com empacotamento do site para `dist/`, incluindo funções Netlify.
10. Adicionada auditoria automatizada com GitHub Actions para links internos, arquivos locais e sintaxe JavaScript.

## Evidência de inspeção estática
- 12 páginas essenciais: 487 referências `href/src` inspecionadas; foi detectado o vídeo MP4 ausente (corrigido).
- 10 páginas do SHOP (catálogo e 9 produtos): 244 referências inspecionadas; nenhuma referência interna de arquivo ausente nesse grupo.
- Todos os 20 URLs de sitemap possuíam arquivos correspondentes no repositório no momento da checagem.
**Limite importante:** verificação dos arquivos GitHub não equivale a uma sessão real de navegador no domínio publicado.

## Checklist de homologação — hospedagem
- [ ] Confirmar em Netlify se o projeto está ativo (não pausado por limites de uso/créditos).
- [ ] Confirmar que o repositório `Tiago22a/nexa-sites` e a branch `main` estão vinculados.
- [ ] Abrir histórico de deploys; conferir a execução bem-sucedida do último deploy.
- [ ] Confirmar build command `node scripts/netlify-build.mjs` e publish directory `dist`.
- [ ] Testar URL de produção `*.netlify.app` e domínio adicional sem redirecionamentos inesperados.
- [ ] Verificar domínio final, apontamento DNS, certificado HTTPS, canonicals e sitemap após a troca pelo Tiago.
- [ ] Percorrer as jornadas em celular e desktop com cliques reais, incluindo WhatsApp, formulários, PDFs e modal.
- [ ] Validar as funções e os logins administrativos com variáveis privadas (sem publicar credenciais).
- [ ] Verificar GitHub Actions: workflow `NEXA BLUE - auditoria de navegacao e publicacao`.
- [ ] Verificar política de privacidade, cookies e textos finais com a equipe jurídica/operacional antes de campanhas.

## Resumo
**Código corrigido e enviado ao GitHub. Publicação pública e testes end-to-end ainda não confirmados.**
