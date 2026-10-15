#!/usr/bin/env python3
"""Monta o AutoMarcen a partir das partes em src/.

Uso:
  python3 tools/build.py           monta tudo
  python3 tools/build.py --check   só confere se os arquivos montados estão em dia

Saídas:
  index.html, app.js, sw.js       raiz do repositório: a versão instalável (PWA), publicada no GitHub Pages
  dist/claude/AutoMarcen.html     arquivo único para o link do claude.ai

Como as partes se juntam (linhas especiais, cada uma sozinha na linha):
  <!--#include caminho-->  ou  //#include caminho   coloca ali o arquivo src/caminho
  //#if app ... //#else ... //#endif                 trecho só de algumas versões
  <!--# texto-->  ou  //# texto                      comentário que não vai para a saída
Versões e as marcas que cada uma liga:
  claude  -> claude          (dentro do claude.ai: conta Claude, downloads e IA do claude.ai)
  pwa     -> app, pwa        (instalada pelo navegador; salva só no aparelho)
Uma versão futura para Windows (Tauri) entra aqui como  "tauri": {"app","tauri"}.
"""
import re, sys, pathlib, shutil
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import mksw

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
TARGETS = {"claude": {"claude"}, "pwa": {"app", "pwa"}}
LINE = re.compile(r'^[ \t]*(?://|<!--)[ \t]*#(include|if|else|endif|[ \t])[ \t]*(.*?)[ \t]*(?:-->)?[ \t]*\r?\n?$')

def render(path, flags):
    out, stack = [], []          # stack: (ligado_antes, condição, já_no_else)
    on = True
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(keepends=True), 1):
        m = LINE.match(line)
        if not m:
            if on: out.append(line)
            continue
        kind, arg = m.groups()
        where = f"{path.relative_to(SRC)}:{n}"
        if kind == "if":
            stack.append((on, any(a.strip() in flags for a in arg.split("|")), False))
            on = stack[-1][0] and stack[-1][1]
        elif kind == "else":
            if not stack or stack[-1][2]: raise SystemExit(f"#else sem #if em {where}")
            prev, cond, _ = stack[-1]; stack[-1] = (prev, cond, True); on = prev and not cond
        elif kind == "endif":
            if not stack: raise SystemExit(f"#endif sem #if em {where}")
            on = stack.pop()[0]
        elif kind == "include":
            if on: out.append(render(SRC / arg, flags))
        # "# texto": comentário de montagem, some
    if stack: raise SystemExit(f"#if sem #endif em {path.relative_to(SRC)}")
    return "".join(out)

def build():
    out = {name: render(SRC / "index.html", flags) for name, flags in TARGETS.items()}
    return {
        ROOT / "dist/claude/AutoMarcen.html": out["claude"],
        ROOT / "index.html": out["pwa"],
        ROOT / "app.js": (SRC / "pwa/app.js").read_text(encoding="utf-8"),
    }

def main():
    files = build()
    if "--check" in sys.argv:
        bad = [p for p, t in files.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        if not bad and (ROOT / "sw.js").read_text() == mksw.make(ROOT): print("em dia"); return
        raise SystemExit("desatualizado: " + ", ".join(str(p.relative_to(ROOT)) for p in bad or [ROOT / "sw.js"]) + "  (rode python3 tools/build.py)")
    for p, t in files.items():
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(t.encode("utf-8"))
        print(f"{p.relative_to(ROOT)}  {len(t.encode())} bytes")
    (ROOT / "sw.js").write_text(mksw.make(ROOT))
    print("sw.js  versão", mksw.version(ROOT))

if __name__ == "__main__":
    main()
