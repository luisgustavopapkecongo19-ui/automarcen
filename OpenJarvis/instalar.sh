#!/usr/bin/env bash
# Instala o OpenJarvis a partir desta pasta (dependências Python, extensão Rust, frontend e modelo inicial).
set -euo pipefail
cd "$(dirname "$0")"

uv sync --extra desktop
uv run --with maturin maturin develop --release -m rust/crates/openjarvis-python/Cargo.toml

# O frontend exige npm 11+
(cd frontend && npx -y npm@11 install)

if command -v ollama >/dev/null 2>&1; then
  if ! curl -s localhost:11434 >/dev/null; then
    nohup ollama serve >/dev/null 2>&1 &
    sleep 3
  fi
  ollama pull qwen3:0.6b
else
  echo "Ollama não encontrado: instale em https://ollama.com e rode 'ollama pull qwen3:0.6b'."
fi

uv run jarvis doctor
