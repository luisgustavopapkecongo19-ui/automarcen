#!/usr/bin/env bash
# Substitui o conteúdo de OpenJarvis/ pela versão indicada do repositório original,
# mantendo os arquivos próprios desta cópia (INSTALAR.md, instalar.sh, .upstream-commit).
set -euo pipefail

commit="$1"
destino="OpenJarvis"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

git clone --quiet --filter=blob:none https://github.com/open-jarvis/OpenJarvis.git "$tmp/repo"
git -C "$tmp/repo" checkout --quiet "$commit"

find "$destino" -mindepth 1 -maxdepth 1 \
  ! -name INSTALAR.md ! -name instalar.sh ! -name .upstream-commit \
  -exec rm -rf {} +

# O binário do Ollama para macOS (77 MB) fica de fora; o instalador baixa o Ollama.
git -C "$tmp/repo" archive "$commit" \
  | tar -x -C "$destino" --exclude=desktop/src-tauri/binaries/ollama-aarch64-apple-darwin

echo "$commit" > "$destino/.upstream-commit"
