"""
Generate src/lib/talent-artists.js + copy needed assets out of foam-deep/site/
into public/images/talent/<slug>/.

Reads:
  foam-deep/site/meta/index.next_data.json    -> overview cards (20 artists)
  foam-deep/site/meta/<slug>.next_data.json   -> per-artist sections
  foam-deep/site/assets/images/<scrape-name>  -> local images
  foam-deep/site/assets/media/<scrape-name>   -> audio + video
Writes:
  src/lib/talent-artists.js                   -> data file
  public/images/talent/<slug>/*               -> copied images
  public/media/talent/<slug>/*                -> copied audio/video
"""
import json, re, shutil
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "foam-deep/site"
IMG_OUT_ROOT = ROOT / "public/images/talent"
MEDIA_OUT_ROOT = ROOT / "public/media/talent"
LIB_OUT = ROOT / "src/lib/talent-artists.js"

IMG_OUT_ROOT.mkdir(parents=True, exist_ok=True)
MEDIA_OUT_ROOT.mkdir(parents=True, exist_ok=True)

# Map storyblok url -> local scrape filename
# Scraper used sn(): netloc+path with / -> _, then truncated to 220.
def storyblok_to_local(url):
    """Try multiple URL forms because foam.org rewrites a.storyblok.com to
    a2.storyblok.com and appends an image-transform suffix /m/filters:quality(50).
    Return a list of candidate sanitized filenames the scraper might have
    used."""
    if not url: return []
    forms = [url]
    if "a.storyblok.com" in url:
        forms.append(url.replace("a.storyblok.com", "a2.storyblok.com"))
    extra = []
    for f in list(forms):
        if "/m/filters:" not in f:
            extra.append(f + "/m/filters:quality(50)")
            extra.append(f + "/m/filters:quality(70)")
            extra.append(f + "/m/filters:quality(90)")
    forms.extend(extra)
    out = []
    for f in forms:
        u = urlparse(f)
        name = (u.netloc + u.path).replace("/", "_") or "index"
        if u.query: name += "_" + re.sub(r'[^a-zA-Z0-9]', '_', u.query)[:80]
        out.append(name[:220])
    return out

ASSET_DIRS = ["images", "media", "fetch", "xhr", "other"]

# Multiple scrape roots in priority order. Each root may store the
# captured asset under a different folder convention; the unified hash
# index below abstracts over that.
SCRAPE_ROOTS = [
    ROOT / "foam_source",                  # WACZ extraction (richest, 39k files)
    ROOT / "foam-mega-run/foam-mega/site", # Mega Playwright (704 MB)
    ROOT / "foam-deep/site",               # Original deep Playwright (563 MB)
]

# Build a one-shot index of all asset filenames so we can substring-match
# instead of guessing every URL rewrite Foam applied. Walked once at
# import time; later lookups are O(1) keyed by the storyblok content hash.
_INDEX = {}        # legacy per-dir buckets (foam-deep flat layout)
_HASH_INDEX = {}   # 10-hex-char hash → first matching path across all roots
def _build_index():
    if _INDEX or _HASH_INDEX: return
    # Legacy: foam-deep flat assets/ layout
    for d in ASSET_DIRS:
        adir = SITE / "assets" / d
        if not adir.exists(): continue
        for f in adir.iterdir():
            if f.is_file():
                _INDEX.setdefault(d, []).append(f)
    # Unified hash index across all scrape roots. Storyblok URLs always
    # carry a 10-hex-char content hash; we scan every path for one and
    # remember the first file that contains it. Later roots in
    # SCRAPE_ROOTS only win for hashes the earlier roots didn't cover.
    hash_re = re.compile(r"([0-9a-f]{10})")
    for root in SCRAPE_ROOTS:
        if not root.exists(): continue
        for p in root.rglob("*"):
            if not p.is_file(): continue
            # Skip giant non-asset files (WARC archives etc.)
            if p.suffix in {".warc", ".gz", ".wacz", ".jsonl", ".har"}: continue
            for chash in hash_re.findall(str(p)):
                _HASH_INDEX.setdefault(chash, p)
_build_index()

def find_local_asset(url):
    """Match a Storyblok URL to its local scrape file.

    Storyblok URLs all share a unique 10-hex-char content hash in the path
    (e.g. .../f/113697/2000x1333/fcc412677f/the-longing.jpeg). We search
    every scrape root (foam_source, foam-mega-run, foam-deep) for any
    file whose path contains that hash and return the first match.
    """
    if not url: return None
    if not isinstance(url, str):
        if isinstance(url, dict) and url.get("filename"):
            url = url["filename"]
        else:
            return None
    m = re.search(r"/f/\d+/\d+x\d+/([0-9a-f]{8,16})/([A-Za-z0-9._-]+)", url)
    if not m:
        # No standard storyblok path — try the filename tail as a hint
        tail = url.rsplit("/", 1)[-1]
        for d, files in _INDEX.items():
            for f in files:
                if tail and tail in f.name: return f
        return None
    chash, name_tail = m.group(1), m.group(2)
    # First, the unified hash index across all scrape roots (richest)
    if chash in _HASH_INDEX:
        return _HASH_INDEX[chash]
    # Fallback: the legacy flat-dir scan in foam-deep
    for d in ["images", "media", "fetch", "xhr", "other"]:
        for f in _INDEX.get(d, []):
            if chash in f.name:
                return f
    return None

def kind_of(url):
    if not url: return "unknown"
    p = url.lower()
    if any(p.endswith(e) for e in [".jpg",".jpeg",".png",".webp",".gif"]): return "image"
    if any(p.endswith(e) for e in [".mp4",".webm",".mov"]): return "video"
    if any(p.endswith(e) for e in [".mp3",".wav",".m4a",".ogg"]): return "audio"
    return "image"  # storyblok images often have no extension

def copy_asset(slug, url, kind="image"):
    """Copy a storyblok asset into /public/images|media/talent/<slug>/ and
    return the public path."""
    if not isinstance(url, str):
        if isinstance(url, dict) and url.get("filename"):
            url = url["filename"]
        else:
            return None
    src = find_local_asset(url)
    if not src: return None
    # Clean filename: keep the human-readable trailing portion
    fn = Path(urlparse(url).path).name
    if not fn:
        fn = src.name[-80:]
    # Strip any weird chars but keep extension
    fn = re.sub(r'[^a-zA-Z0-9._-]', '', fn)
    if "." not in fn:
        # Inherit extension from local scrape
        ext = src.suffix or {"image":".jpg","video":".mp4","audio":".mp3"}.get(kind,"")
        fn += ext
    out_root = IMG_OUT_ROOT if kind == "image" else MEDIA_OUT_ROOT
    out_dir = out_root / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / fn
    if not out.exists():
        shutil.copy2(src, out)
    rel = out.relative_to(ROOT / "public")
    return "/" + str(rel)

# Helpers to convert prose blocks (storyblok rich-text) into plain HTML
def richtext_to_html(node):
    if node is None: return ""
    if isinstance(node, str): return node
    nt = node.get("type", "")
    children = "".join(richtext_to_html(c) for c in node.get("content", []) or [])
    if nt == "doc": return children
    if nt == "paragraph": return f"<p>{children}</p>"
    if nt == "text":
        t = node.get("text", "")
        for mark in node.get("marks", []) or []:
            m = mark.get("type")
            if m == "bold": t = f"<strong>{t}</strong>"
            elif m == "italic": t = f"<em>{t}</em>"
            elif m == "link":
                href = (mark.get("attrs") or {}).get("href", "#")
                t = f'<a href="{href}" target="_blank" rel="noopener">{t}</a>'
        return t
    if nt == "hard_break": return "<br />"
    if nt == "heading":
        lvl = (node.get("attrs") or {}).get("level", 2)
        return f"<h{lvl}>{children}</h{lvl}>"
    if nt == "blockquote": return f"<blockquote>{children}</blockquote>"
    if nt == "bullet_list": return f"<ul>{children}</ul>"
    if nt == "ordered_list": return f"<ol>{children}</ol>"
    if nt == "list_item": return f"<li>{children}</li>"
    return children  # unknown node: just emit children

def first_text(node):
    """Pluck the first ~120 chars of plain text from a richtext doc, for captions."""
    out = []
    def walk(n):
        if isinstance(n, dict):
            if n.get("type") == "text": out.append(n.get("text",""))
            for c in n.get("content", []) or []: walk(c)
    walk(node)
    return ("".join(out)).strip()

# ---- main ----
idx = json.loads((SITE / "meta/index.next_data.json").read_text())
overview = idx["props"]["pageProps"]["adaptedOverviewArtists"]

# Index page also has filter positions in 3D
filter_layout = []
for a in overview:
    for ft in (a.get("filters") or []):
        if isinstance(ft, list):
            for f in ft:
                if isinstance(f, dict) and f.get("name"):
                    # Use the topmost 'position' if present, else outer x/y/z
                    pos = f.get("position") or {"x": f.get("x"), "y": f.get("y"), "z": f.get("z")}
                    filter_layout.append({"name": f["name"], "x": pos["x"], "y": pos["y"], "z": pos["z"]})
# Dedupe by name (keep first occurrence)
seen_names = set()
filters_unique = []
for f in filter_layout:
    if f["name"] in seen_names: continue
    seen_names.add(f["name"])
    filters_unique.append(f)

# Build the per-artist record
artists = []
for o in overview:
    slug = o["slug"].split("/")[-1]
    meta = SITE / "meta" / f"{slug}.next_data.json"
    if not meta.exists():
        print(f"  skip {slug}: no next_data")
        continue
    nd = json.loads(meta.read_text())
    story = nd["props"]["pageProps"]["story"]
    content = story.get("content", {}) or {}
    intro = (content.get("intro") or [{}])[0]
    
    accent     = (intro.get("background_color") or {}).get("color") or o.get("frameBackgroundColor") or "#fff"
    accentText = (intro.get("textColor") or {}).get("color") or o.get("frameHighlightColor") or "#000"
    name       = o.get("name") or story.get("name") or slug
    exhibition = content.get("exhibitionName") or intro.get("exhibitionName") or ""
    
    # Hero (overview card) image
    asset_url = (o.get("asset") or {}).get("filename")
    hero_local = copy_asset(slug, asset_url, "image") if asset_url else None
    
    # Tags
    tags = []
    for ft in (o.get("filters") or []):
        if isinstance(ft, list):
            for f in ft:
                if isinstance(f, dict) and f.get("name"):
                    tags.append(f["name"])
    
    # Description (about / aside content)
    desc_html = ""
    for k in ["description", "asideContent", "about"]:
        if isinstance(content.get(k), dict) and content[k].get("type"):
            desc_html = richtext_to_html(content[k])
            if desc_html: break
    
    # Sections: walk and serialize a friendly schema
    sections = []
    for s in content.get("sections", []):
        comp = s.get("component")
        if comp == "OnlineExhibitionImage":
            img = s.get("image") or {}
            local = copy_asset(slug, img.get("filename"), "image")
            sections.append({
                "kind": "image",
                "src": local,
                "alt": img.get("alt") or "",
                "caption": first_text(s.get("caption")),
                "credits": first_text(s.get("credits")),
                "free": bool(s.get("freeImage")),
                "top": s.get("top"),
                "left": s.get("left"),
                "width": s.get("width"),
                "height": s.get("height"),
                "marginTop": s.get("marginTop"),
                "shadow": s.get("shadow", False),
            })
        elif comp == "OnlineExhibitionImages":
            imgs = s.get("images") or []
            local_imgs = []
            for im in imgs:
                local = copy_asset(slug, im.get("filename"), "image")
                if local:
                    local_imgs.append({
                        "src": local,
                        "alt": im.get("alt") or "",
                    })
            sections.append({
                "kind": "images",
                "items": local_imgs,
                "layout": s.get("layout") or s.get("image_layout") or [],
            })
        elif comp == "OnlineExhibitionImagesWithText":
            imgs = s.get("images") or []
            local_imgs = [{"src": copy_asset(slug, im.get("filename"), "image"), "alt": im.get("alt") or ""} for im in imgs]
            sections.append({
                "kind": "images-with-text",
                "items": [i for i in local_imgs if i["src"]],
                "html": richtext_to_html(s.get("text") or s.get("body") or {}),
            })
        elif comp == "OnlineExhibitionProse":
            title = s.get("title")
            title_text = first_text(title) if isinstance(title, dict) else (title or "")
            sections.append({
                "kind": "prose",
                "title": title_text,
                "style": s.get("style") or "",
                "html": richtext_to_html(s.get("body") or s.get("text") or s.get("prose") or {}),
            })
        elif comp == "OnlineExhibitionQuote":
            sections.append({
                "kind": "quote",
                "html": richtext_to_html(s.get("text") or s.get("quote") or {}),
            })
        elif comp == "OnlineExhibitionInlineVideo":
            mp4 = (s.get("videoMp4") or s.get("video") or {}).get("filename")
            webm = (s.get("videoWebm") or {}).get("filename")
            local_mp4 = copy_asset(slug, mp4, "video")
            local_webm = copy_asset(slug, webm, "video")
            sections.append({
                "kind": "inline-video",
                "src": local_mp4 or mp4,
                "webm": local_webm or webm,
                "fixed": bool(s.get("fixed")),
                "height": s.get("height"),
                "marginTop": s.get("marginTop"),
                "videoPosition": s.get("videoPosition"),
            })
        elif comp == "OnlineExhibitionVideo":
            mp4 = (s.get("videoMp4") or s.get("video") or {}).get("filename")
            webm = (s.get("videoWebm") or {}).get("filename")
            local_mp4 = copy_asset(slug, mp4, "video")
            local_webm = copy_asset(slug, webm, "video")
            poster = copy_asset(slug, (s.get("poster") or {}).get("filename"), "image")
            sections.append({
                "kind": "video",
                "src": local_mp4 or mp4,
                "webm": local_webm or webm,
                "poster": poster,
            })
        elif comp == "OnlineExhibitionPodcast":
            # `src` is a Storyblok URL string in most cases; sometimes an
            # asset object on `audio`/`track`.
            raw = s.get("src") or (s.get("audio") or {}).get("filename") or (s.get("track") or {}).get("filename")
            local = copy_asset(slug, raw, "audio")
            title = s.get("title")
            title_text = first_text(title) if isinstance(title, dict) else (title or "")
            sections.append({
                "kind": "podcast",
                "src": local or raw,
                "title": title_text,
                "duration": s.get("duration") or "",
                "background": (s.get("background") or {}).get("hex") or (s.get("background_color") or {}).get("color") or "",
            })
        elif comp == "OnlineExhibitionViewer":
            sections.append({"kind": "viewer", "html": "<p>360° viewer placeholder.</p>"})
        elif comp == "OnlineExhibitionCustomEmbed":
            sections.append({"kind": "embed", "html": s.get("embed", "")})
        else:
            sections.append({"kind": "unknown", "comp": comp})
    
    artists.append({
        "slug": slug,
        "name": name,
        "exhibition": exhibition,
        "accent": accent,
        "accentText": accentText,
        "tags": tags,
        "hero": hero_local,
        "isPrimary": bool(o.get("isPrimary")),
        "pos3": {"x": o["position"]["x"], "y": o["position"]["y"], "z": o["position"]["z"]},
        "descHtml": desc_html,
        "sections": sections,
    })

# Emit JS
def js_lit(o):
    return json.dumps(o, ensure_ascii=False, indent=2)

# Persist intermediate JSON for inspection
(ROOT / "tmp_talent_artists.json").write_text(json.dumps({
    "filters": filters_unique,
    "artists": artists,
}, ensure_ascii=False, indent=2))

LIB_OUT.parent.mkdir(parents=True, exist_ok=True)
LIB_OUT.write_text(f"""/**
 * Foam Talent 2024 — real artist + section data.
 *
 * Generated by scripts/build-talent-data.py from the foam-deep scrape
 * (foam-deep/site/meta/<slug>.next_data.json). Re-run that script to
 * regenerate after updating the scrape.
 *
 * Asset URLs point at /public/images/talent/<slug>/ and
 * /public/media/talent/<slug>/, copied from foam-deep/site/assets.
 *
 * Each artist's `pos3` is the floating-point (x, y, z) authored on the
 * real foam.org gallery and consumed verbatim by the R3F scene.
 */

export const FILTERS = {js_lit(filters_unique)};

export const ARTISTS = {js_lit(artists)};

export function findArtist(slug) {{
  return ARTISTS.find((a) => a.slug === slug);
}}

export function nextArtist(slug) {{
  const i = ARTISTS.findIndex((a) => a.slug === slug);
  if (i === -1) return ARTISTS[0];
  return ARTISTS[(i + 1) % ARTISTS.length];
}}
""", encoding="utf-8")

print(f"wrote {LIB_OUT}")
print(f"  {len(artists)} artists, {len(filters_unique)} filters")
print(f"  images dir: {IMG_OUT_ROOT}")
print(f"  media  dir: {MEDIA_OUT_ROOT}")
