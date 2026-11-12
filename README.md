# AutoMarcen

Ferramenta de projeto de marcenaria para celular, tablet e computador: desenho técnico com medidas, móveis paramétricos, 3D, lista de peças, plano de corte e orçamento em PDF.

**Abrir:** https://luisgustavopapkecongo19-ui.github.io/automarcen/

**Página de divulgação:** https://luisgustavopapkecongo19-ui.github.io/automarcen/conheca/ (arquivo `conheca/index.html`; o número do WhatsApp e o preço ficam em `CONFIG`, no fim do arquivo. Ela fica fora do app guardado no aparelho.)

## Instalar no Android
1. Abra o link acima no Chrome.
2. Toque em **Instalar app** no topo da ferramenta, ou no menu ⋮ do Chrome → **Instalar app** (ou **Adicionar à tela inicial**).
3. O ícone do AutoMarcen aparece na tela inicial. Depois da primeira abertura com internet, ele abre e funciona sem sinal.

## Salvar e levar para outro aparelho
Os projetos ficam salvos no próprio aparelho. Para abrir em todos os aparelhos, toque em **⋯ → Entrar na conta** (Google ou e-mail e senha): a partir daí cada projeto também vai para a nuvem e aparece onde você entrar com a mesma conta. Sem internet, o projeto fica no aparelho e sobe quando a conexão volta.

Sem conta, dá para levar um projeto com **Exportar → Projeto (.json)** e depois **Projetos → Importar**.

### Conta e nuvem (Firebase)
- Projeto Firebase `automarcen`: Authentication (Google e E-mail/senha) e Firestore em `southamerica-east1`.
- Cada pessoa grava só em `users/{uid}/projetos`; as regras do Firestore bloqueiam o resto.
- A configuração do app web fica em `src/js/conta.js` (não é senha). O SDK do Firebase 10.14.1 fica em `vendor/firebase/`, para o app abrir sem internet.
- As regras do Firestore ficam em `firestore.rules`; cole no console do Firebase (Firestore Database → Regras) sempre que mudarem.
- Só a versão instalável usa o Firebase; a do claude.ai continua salvando na conta Claude.

### IA no app (Gemini pelo Firebase AI Logic)
- O chat de ajuda, o **Croqui por foto** e as frases longas de **Falar ou escrever** usam o Gemini pelo Firebase AI Logic (API Gemini Developer, plano Spark, sem cartão). Código em `src/js/ia.js`; a versão do claude.ai continua com o Claude.
- Só quem entrou na conta usa a IA. Cada conta tem até 50 pedidos por dia (`IA_LIMITE`), contados em `users/{uid}/uso/{dia}` e conferidos pelas regras do Firestore.
- Modelos: `gemini-3.5-flash-lite` no chat e nas frases, `gemini-3.5-flash` na foto (`IA_MODELOS`).
- App Check (já exigido no AI Logic): o app usa a chave do site do reCAPTCHA Enterprise / Fraud Defense em `FB_RECAPTCHA` (`src/js/conta.js`), registrada no App Check do Firebase para o domínio do GitHub Pages. Sem o token, o Firebase recusa e o app volta para o guia.

## Código
O código fica em `src/`, separado em partes. Mude sempre ali e depois rode:

```
python3 tools/build.py
```

Ele junta as partes e gera as duas versões:
- `index.html`, `app.js` e `sw.js` na raiz: a versão instalável, publicada aqui no GitHub Pages.
- `dist/claude/AutoMarcen.html`: o arquivo único que vai para o link do claude.ai.

`python3 tools/build.py --check` só confere se esses arquivos estão em dia. Não edite à mão os arquivos gerados.

| Pasta ou arquivo | O que tem |
|---|---|
| `src/index.html` | molde da página: a ordem em que as partes entram |
| `src/tela.html` | os botões, abas e painéis da tela |
| `src/estilo/` | aparência: base, topo, desenho, painel, 3D, páginas, janelas, ajuda e ajustes de toque |
| `src/js/nucleo/` | contas sem tela: geometria dos móveis, plano de corte, ZIP e DXF |
| `src/js/desenho/` | prancheta 2D: pintar, toque e mouse, medidas, desfazer |
| `src/js/projeto.js`, `salvar.js`, `conta.js` | projetos, como eles são salvos e a conta na nuvem (Firebase) |
| `src/js/painel.js`, `moveis.js` | painel do móvel e desenho virando móvel |
| `src/js/foto-voz.js` | montar móvel por foto ou por frase |
| `src/js/exportar.js`, `pecas-corte-orcamento.js`, `cliente.js` | arquivos, peças, corte, orçamento e envio ao cliente |
| `src/js/organizador.js` | clientes e relatórios (por cliente, por mês, materiais) e Exportar tudo em JSON |
| `src/js/3d.js`, `abas.js`, `chat.js`, `inicio.js` | 3D, troca de abas, ajuda e abertura do app |
| `src/pwa/app.js` | só da versão instalável: instalar, atualizar e guardar sem internet |

As diferenças entre as versões ficam marcadas no próprio código, com `//#if app` … `//#else` … `//#endif` (`app` é a versão instalável; o resto é a do claude.ai). Uma futura versão para Windows (Tauri) entra como mais uma versão em `tools/build.py`.

## Arquivos publicados
`vendor/` tem three.js r128, jsPDF 2.5.1 e Firebase 10.14.1 (app, auth, firestore e app-check); `fonts/` tem Instrument Sans e IBM Plex Mono (licença OFL); `icons/` e `manifest.webmanifest` são do app instalável. O `build.py` também atualiza a lista e a versão do cache em `sw.js`.
