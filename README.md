# AutoMarcen

Ferramenta de projeto de marcenaria para celular, tablet e computador: desenho técnico com medidas, móveis paramétricos, 3D, lista de peças, plano de corte e orçamento em PDF.

**Abrir:** https://luisgustavopapkecongo19-ui.github.io/automarcen/

## Instalar no Android
1. Abra o link acima no Chrome.
2. Toque em **Instalar app** no topo da ferramenta, ou no menu ⋮ do Chrome → **Instalar app** (ou **Adicionar à tela inicial**).
3. O ícone do AutoMarcen aparece na tela inicial. Depois da primeira abertura com internet, ele abre e funciona sem sinal.

## Salvar e levar para outro aparelho
Os projetos ficam salvos no próprio aparelho. Para levar a outro aparelho, use **Exportar → Projeto (.json)** e depois **Projetos → Importar**.

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
| `src/js/projeto.js`, `salvar.js` | projetos e como eles são salvos |
| `src/js/painel.js`, `moveis.js` | painel do móvel e desenho virando móvel |
| `src/js/foto-voz.js` | montar móvel por foto ou por frase |
| `src/js/exportar.js`, `pecas-corte-orcamento.js`, `cliente.js` | arquivos, peças, corte, orçamento e envio ao cliente |
| `src/js/3d.js`, `abas.js`, `chat.js`, `inicio.js` | 3D, troca de abas, ajuda e abertura do app |
| `src/pwa/app.js` | só da versão instalável: instalar, atualizar e guardar sem internet |

As diferenças entre as versões ficam marcadas no próprio código, com `//#if app` … `//#else` … `//#endif` (`app` é a versão instalável; o resto é a do claude.ai). Uma futura versão para Windows (Tauri) entra como mais uma versão em `tools/build.py`.

## Arquivos publicados
`vendor/` tem three.js r128 e jsPDF 2.5.1; `fonts/` tem Instrument Sans e IBM Plex Mono (licença OFL); `icons/` e `manifest.webmanifest` são do app instalável. O `build.py` também atualiza a lista e a versão do cache em `sw.js`.
