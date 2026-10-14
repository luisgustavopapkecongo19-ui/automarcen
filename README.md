# Croqui 3D

Ferramenta de projeto de marcenaria para celular, tablet e computador: desenho técnico com medidas, móveis paramétricos, 3D, lista de peças, plano de corte e orçamento em PDF.

**Abrir:** https://luisgustavopapkecongo19-ui.github.io/croqui-3d/

## Instalar no Android
1. Abra o link acima no Chrome.
2. Toque em **Instalar app** no topo da ferramenta, ou no menu ⋮ do Chrome → **Instalar app** (ou **Adicionar à tela inicial**).
3. O ícone do Croqui 3D aparece na tela inicial. Depois da primeira abertura com internet, ele abre e funciona sem sinal.

## Salvar e levar para outro aparelho
Os projetos ficam salvos no próprio aparelho. Para levar a outro aparelho, use **Exportar → Projeto (.json)** e depois **Projetos → Importar**.

## Arquivos
Site estático, sem etapa de build. `index.html` é a ferramenta; `sw.js` guarda os arquivos para uso sem internet; `vendor/` tem three.js r128 e jsPDF 2.5.1; `fonts/` tem Instrument Sans e IBM Plex Mono (licença OFL).
Ao mudar qualquer arquivo, rode `python3 tools/mksw.py .` para atualizar a lista e a versão do cache em `sw.js`.
