"""
Parse src/components/talent/ + src/styles/talent.css and emit four
artifacts under docs/talent-analysis/ documenting every animation,
transition, WebGL component, and the source-code-derived timeline.

Heuristics — not perfect, but good enough to map the surface area.
"""
import json, re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
TALENT_DIR = ROOT / "src/components/talent"
LIB_DIR = ROOT / "src/lib"
CSS = ROOT / "src/styles/talent.css"
OUT = ROOT / "docs/talent-analysis"
OUT.mkdir(parents=True, exist_ok=True)

# ---------- helpers ----------

MOTION_TAGS = ("motion.div", "motion.button", "motion.span", "motion.section",
               "motion.p", "motion.a", "motion.h1", "motion.h2", "motion.ul",
               "motion.li", "motion.img")

def find_brace_block(src, start):
    """Given an index of `{`, return the matching `}` index (naive but OK
    for the well-formed JSX we have)."""
    depth = 0
    for i in range(start, len(src)):
        if src[i] == "{": depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0: return i
    return -1

def extract_props_around(src, tag_pos):
    """Find the JSX element tag opening near tag_pos, walk attributes,
    return a dict of prop_name → raw value string."""
    # Look ahead from tag_pos for the closing '>' or '/>'
    end = src.find(">", tag_pos)
    if end == -1: return {}
    header = src[tag_pos:end]
    props = {}
    # prop="..." or prop={...}
    for m in re.finditer(r'\b(initial|animate|exit|transition|whileHover|whileTap|whileInView|drag|dragMomentum|dragElastic|dragConstraints|layoutId|variants)\b', header):
        pname = m.group(1)
        after = header[m.end():].lstrip()
        if after.startswith("="):
            after = after[1:].lstrip()
            if after.startswith("{"):
                # find matching closing brace within `header`
                start_in_src = tag_pos + m.end() + (header[m.end():].find("{"))
                close = find_brace_block(src, start_in_src)
                if close != -1:
                    props[pname] = src[start_in_src+1:close].strip()
            elif after.startswith('"'):
                close = after.find('"', 1)
                if close != -1:
                    props[pname] = after[1:close]
            else:
                # bare value e.g. drag (no =) — represented above
                props[pname] = "true"
        else:
            # boolean-only prop (no value)
            props[pname] = "true"
    return props

# ---------- walk talent components ----------

ANIM_MANIFEST = []   # framer-motion entries
GSAP_CALLS = []      # gsap timeline / tween calls
TRANSITION_MAP = []  # CSS transitions / transforms / keyframes
WEBGL = []           # three.js / R3F references

for jsfile in sorted(list(TALENT_DIR.rglob("*.js")) + list(LIB_DIR.glob("*.js"))):
    src = jsfile.read_text()
    rel = str(jsfile.relative_to(ROOT))

    # framer-motion components
    for tag in MOTION_TAGS:
        for m in re.finditer(re.escape("<" + tag), src):
            pos = m.start()
            props = extract_props_around(src, pos + 1)
            if not props: continue
            # line number
            line = src[:pos].count("\n") + 1
            ANIM_MANIFEST.append({
                "file": rel,
                "line": line,
                "component": tag,
                "props": props,
            })

    # GSAP calls
    for m in re.finditer(r'gsap\.(to|from|fromTo|set|timeline)\s*\(', src):
        line = src[:m.start()].count("\n") + 1
        # capture up to the matching close paren on the same line(s) — rough
        snippet = src[m.start():m.start()+260].split("\n")[0].strip()
        GSAP_CALLS.append({"file": rel, "line": line, "snippet": snippet})

    # WebGL / three.js / R3F
    for m in re.finditer(r'(from\s+["\'])((three|@react-three[\w/-]*))(["\'])', src):
        WEBGL.append({"file": rel, "import": m.group(2)})
    for m in re.finditer(r'<Canvas[\s>]|useFrame\s*\(|useThree\s*\(|OrbitControls', src):
        line = src[:m.start()].count("\n") + 1
        WEBGL.append({"file": rel, "line": line, "match": m.group(0).strip("<>( ")})

# ---------- CSS file ----------

if CSS.exists():
    css = CSS.read_text()
    # @keyframes blocks
    for m in re.finditer(r'@(?:-webkit-)?keyframes\s+([A-Za-z0-9_-]+)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}', css):
        TRANSITION_MAP.append({
            "kind": "keyframes",
            "name": m.group(1),
            "css": m.group(0),
        })
    # transition rules (any line containing `transition:`)
    for m in re.finditer(r'transition:\s*([^;]+);', css):
        line = css[:m.start()].count("\n") + 1
        TRANSITION_MAP.append({"kind": "transition", "line": line, "value": m.group(1).strip()})
    # animation: rules
    for m in re.finditer(r'animation:\s*([^;]+);', css):
        line = css[:m.start()].count("\n") + 1
        TRANSITION_MAP.append({"kind": "animation", "line": line, "value": m.group(1).strip()})

# ---------- write artifacts ----------

(OUT / "animations_manifest.json").write_text(
    json.dumps({"count": len(ANIM_MANIFEST), "entries": ANIM_MANIFEST},
               indent=2, ensure_ascii=False)
)

(OUT / "webgl_analysis.json").write_text(
    json.dumps({
        "count": len(WEBGL),
        "entries": WEBGL,
        "note": "Current /talent is pure DOM + framer-motion. No three.js / "
                "R3F / Canvas elements are imported. Foam.org's live "
                "/talent-2024 IS WebGL (three.js r160) but this project "
                "intentionally uses framer-motion layoutId morphs instead "
                "(layoutId requires DOM siblings, can't cross WebGL boundary).",
    }, indent=2, ensure_ascii=False)
)

(OUT / "transition_map.json").write_text(
    json.dumps({
        "count": len(TRANSITION_MAP),
        "gsap_calls": GSAP_CALLS,
        "css": TRANSITION_MAP,
    }, indent=2, ensure_ascii=False)
)

# Group by file for readable timeline
by_file = defaultdict(list)
for e in ANIM_MANIFEST:
    by_file[e["file"]].append(e)

lines = ["# /talent — Animation timeline (source-derived)\n"]
lines.append("Generated by `scripts/extract-talent-animations.py`. ")
lines.append("Walks `src/components/talent/`, `src/lib/talent-*.js`, and "
             "`src/styles/talent.css`, surfacing every framer-motion "
             "`motion.X` element, every GSAP call, every CSS keyframe/"
             "transition/animation, and every three.js/R3F reference.\n")

lines.append("## Phase machine (controls everything)\n")
lines.append("`TalentExperience.js` owns a `phase` state that gates "
             "what's rendered and animated:\n")
lines.append("```")
lines.append("intro      (t=0)     foam wordmark + TALENT op-art fade in")
lines.append("hero-zoom  (t=0.1)   layoutId='hero-card' enters at 85vw")
lines.append("gallery    (t=2.4)   layoutId morph: hero shrinks to grid")
lines.append("portfolio  (on tap)  Portfolio mounts via layoutId; URL")
lines.append("                     swaps via history.pushState")
lines.append("```\n")

lines.append("## Per-file animation surface\n")
for fname, entries in sorted(by_file.items()):
    lines.append(f"### `{fname}` ({len(entries)} framer-motion node{'s' if len(entries)!=1 else ''})\n")
    for e in entries:
        keys = ", ".join(sorted(e["props"].keys()))
        lines.append(f"- L{e['line']} `<{e['component']}>` — {keys}")
    lines.append("")

lines.append("## GSAP calls\n")
if GSAP_CALLS:
    for g in GSAP_CALLS:
        lines.append(f"- `{g['file']}:{g['line']}` — `{g['snippet'][:100]}`")
else:
    lines.append("_No GSAP calls in talent code._")
lines.append("")

lines.append("## CSS keyframes / transitions\n")
kf = [t for t in TRANSITION_MAP if t["kind"] == "keyframes"]
tx = [t for t in TRANSITION_MAP if t["kind"] == "transition"]
an = [t for t in TRANSITION_MAP if t["kind"] == "animation"]
lines.append(f"- **{len(kf)} keyframe block{'s' if len(kf)!=1 else ''}**: " +
             (", ".join(k["name"] for k in kf) if kf else "_none_"))
lines.append(f"- **{len(tx)} `transition:` declarations** in talent.css")
lines.append(f"- **{len(an)} `animation:` declarations** in talent.css\n")

lines.append("## WebGL / three.js footprint\n")
if WEBGL:
    for w in WEBGL:
        lines.append(f"- `{w['file']}` — {w.get('import') or w.get('match')}")
else:
    lines.append("_Zero. This build is pure DOM + framer-motion + GSAP "
                 "(GSAP only in FoamSidebar). Three.js / R3F were "
                 "deliberately removed in a prior refactor because "
                 "framer-motion's layoutId morphs (the hero-zoom-into-"
                 "gallery shared-element animation) require both endpoints "
                 "to live in the DOM._")

(OUT / "animation_timeline.md").write_text("\n".join(lines))

print(f"animation_manifest.json: {len(ANIM_MANIFEST)} entries")
print(f"webgl_analysis.json:     {len(WEBGL)} entries")
print(f"transition_map.json:     {len(TRANSITION_MAP)} CSS + {len(GSAP_CALLS)} GSAP")
print(f"animation_timeline.md:   {len(lines)} lines")
print(f"output dir:              {OUT}")
