# OpenJarvis (cópia local)

Cópia do código-fonte de https://github.com/open-jarvis/OpenJarvis, licença Apache 2.0.
A versão copiada está em `.upstream-commit`. Toda semana a GitHub Action
`.github/workflows/atualizar-openjarvis.yml` confere o original e abre um pull request
quando houver atualização.

O binário `desktop/src-tauri/binaries/ollama-aarch64-apple-darwin` (77 MB, só macOS)
foi removido; o instalador baixa o Ollama automaticamente.

## Instalação rápida (macOS / Linux / WSL2)

```bash
curl -fsSL https://open-jarvis.github.io/OpenJarvis/install.sh | bash
```

## Instalação a partir desta pasta

Requisitos: [uv](https://docs.astral.sh/uv/), [Rust](https://rustup.rs/), Node.js 22.22+ e [Ollama](https://ollama.com).

```bash
./instalar.sh
```

Depois:

```bash
uv run jarvis          # chat no terminal
uv run jarvis gui      # interface no navegador
uv run jarvis doctor   # verificar a instalação
```
