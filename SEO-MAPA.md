# Mapa SEO — Nexa Sites Dev

Domínio canônico: `https://nexasitesdev.com.br/`

Este mapa foi montado a partir de pesquisas atuais de SERP e padrões repetidos nos resultados brasileiros. **Não representa volume de busca pago/estimado**; o objetivo é organizar intenção e arquitetura sem criar páginas vazias ou duplicadas.

## Onda 1 — termos genéricos
| Palavra-chave principal | Intenção | URL |
|---|---|---|
| criação de sites | Comercial / contratação | `/criacao-de-sites/` |
| site profissional para empresa | Comercial / contratação | `/site-profissional-para-empresas/` |
| site para negócios locais | Comercial / contratação | `/sites-para-negocios-locais/` |
| criação de landing page | Comercial / contratação | `/landing-pages/` |
| SEO local para empresas | Comercial / contratação | `/seo-local/` |

## Onda 2 — termos específicos por nicho/subnicho
| Palavra-chave principal | Intenção | URL |
|---|---|---|
| site para clínica com agendamento no WhatsApp | Comercial / problema específico | `/site-para-clinica-com-agendamento-no-whatsapp/` |
| site para clínica de estética com agendamento | Comercial / problema específico | `/site-para-clinica-de-estetica-com-agendamento/` |
| site para dentista com agendamento | Comercial / problema específico | `/site-para-dentista-com-agendamento/` |
| site para oficina mecânica com orçamento no WhatsApp | Comercial / problema específico | `/site-para-oficina-mecanica-com-orcamento-no-whatsapp/` |
| site para restaurante com cardápio e WhatsApp | Comercial / problema específico | `/site-para-restaurante-com-cardapio-e-whatsapp/` |
| site para imobiliária com captação de leads | Comercial / problema específico | `/site-para-imobiliaria-com-captacao-de-leads/` |
| site para contabilidade para aparecer no Google | Comercial / problema específico | `/site-para-contabilidade-para-aparecer-no-google/` |
| site para vidraçaria com orçamento | Comercial / problema específico | `/site-para-vidracaria-com-orcamento/` |
| site para dedetizadora com orçamento | Comercial / problema específico | `/site-para-dedetizadora-com-orcamento/` |
| landing page para energia solar | Comercial / problema específico | `/landing-page-para-energia-solar/` |
| site para salão de beleza com agendamento | Comercial / problema específico | `/site-para-salao-de-beleza-com-agendamento/` |

## Padrões observados nas buscas
- Negócios locais respondem melhor a páginas que deixam **serviço + região + WhatsApp** claros.
- Clínicas, estética e odontologia concentram intenção em **especialidade/procedimento + agendamento**.
- Oficinas concentram intenção em **serviço/sintoma + orçamento + confiança**.
- Restaurantes concentram intenção em **cardápio + horário + pedido/reserva**.
- Imobiliárias concentram intenção em **imóvel/filtro + lead + WhatsApp/CRM**.
- Contabilidade concentra intenção em **necessidade concreta** (abrir empresa, trocar contador, regularizar).
- Vidraçarias e serviços visuais precisam de **galeria de obra + orçamento**.
- Dedetizadoras se beneficiam de **página por praga + segurança/licenças + orçamento**.
- Energia solar combina melhor com **landing page de benefício, prova e pedido de simulação/orçamento**.

## Implementação técnica
- Canonical absoluto em todas as páginas.
- Sitemap XML contendo apenas URLs canônicas.
- `robots.txt` com referência ao sitemap.
- `Organization` + `WebSite` + `WebPage` na home.
- `Service` + `BreadcrumbList` + `WebPage` nas páginas de intenção.
- Open Graph/Twitter Cards.
- Lazy loading em imagens abaixo da dobra; hero com `fetchpriority="high"`.
- Links internos entre serviços, segmentos e home.
- `_redirects` preparado para consolidar HTTP/WWW no host canônico em Netlify.
