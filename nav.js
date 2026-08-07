/* ============================================================
   一起學閩南語（臺語）漢字 —— 全站側邊目錄
   nav.js  v1.0

   用法：在每個頁面 </body> 前加這一行就好，其他都不用改
       <script src="/phonics/nav.js" defer><\/script>

   它會自動做四件事：
   1. 產生左側常駐目錄（上：全站目錄／下：本頁目錄）
   2. 本頁目錄從內文的 h1（章）、h2（節）自動抓，不必手動維護
   3. 捲動時高亮當前章節（scrollspy）
   4. 手機自動收合成漢堡鈕；底部自動加「上一篇／下一篇」

   不會動到您任何既有內容，也不需要編譯或安裝任何東西。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- ① 全站目錄：日後新增文件，只改這一份清單 ---------- */
  var SITE = [
    { group: '總目', items: [
      { href: '/',                          label: '一起學閩南語（臺語）漢字' },
      { href: '/phonics/',                  label: '閩南語拼音法 · 總目' }
    ]},
    { group: '注音版', items: [
      { href: '/phonics/zhuyin.html',       label: '135拼音法 · 注音版', note: 'v1.2' }
    ]},
    { group: '美拼版', items: [
      { href: '/phonics/complete.html',     label: '完整版', note: 'v6' },
      { href: '/phonics/standard.html',     label: '一般版', note: 'v5' },
      { href: '/phonics/quick.html',        label: '精簡版 · 速查卡', note: 'v4.2' }
    ]},
    { group: 'English', items: [
      { href: '/phonics/en-complete.html',  label: 'Complete Edition', note: 'V6' },
      { href: '/phonics/en-standard.html',  label: 'Standard Edition' },
      { href: '/phonics/en-quick.html',     label: 'Quick Reference' }
    ]},
    { group: '甲骨釋文', items: [
      { href: '/oracle/',                   label: '用字這一案', note: '籌備中', soon: true }
    ]}
  ];

  /* 上一篇／下一篇的閱讀順序 */
  var ORDER = [
    '/phonics/zhuyin.html',
    '/phonics/complete.html',
    '/phonics/standard.html',
    '/phonics/quick.html',
    '/phonics/en-complete.html',
    '/phonics/en-standard.html',
    '/phonics/en-quick.html'
  ];

  /* 這些標題不放進本頁目錄（頁內既有的目錄區塊自己的標題） */
  var SKIP_TITLES = /^(目錄|總目|contents?|索引|index)$/i;

  /* ---------- ② 樣式（沿用您既有的 CSS 變數，沒有就用預設值） ---------- */
  var CSS = `
:root{
  --nav-w:274px;
  --nav-ink:var(--ink,#101C2B);
  --nav-bone:var(--bone,#F4EDDE);
  --nav-gold:var(--gold,#C9972B);
  --nav-cinnabar:var(--cinnabar,#C43A26);
  --nav-line:var(--line,#D8CCB4);
}
#sidenav{
  position:fixed;top:0;left:0;bottom:0;width:var(--nav-w);z-index:900;
  background:var(--nav-ink);color:#C8D6E4;overflow-y:auto;overscroll-behavior:contain;
  font:15px/1.6 "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;
  -webkit-overflow-scrolling:touch;
}
#sidenav::-webkit-scrollbar{width:8px}
#sidenav::-webkit-scrollbar-thumb{background:#2a3b4f;border-radius:4px}
#sidenav a{color:inherit;text-decoration:none;display:block}

/* 站名 */
.nav-brand{
  padding:1.05rem 1.15rem .9rem;border-bottom:1px solid #23344a;position:relative;overflow:hidden;
}
.nav-brand::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(300px 120px at 85% -30%,rgba(201,151,43,.20),transparent 65%)}
.nav-brand b{
  font-family:"Noto Serif TC",serif;font-weight:900;font-size:1.02rem;letter-spacing:.06em;
  color:var(--nav-bone);display:block;line-height:1.4;position:relative}
.nav-brand span{display:block;margin-top:.3rem;font-size:.75rem;color:#8FA5BD;letter-spacing:.05em;position:relative}

/* 區塊標題 */
.nav-sect{
  padding:1.05rem 1.15rem .3rem;font-family:"Roboto Mono","Consolas",monospace;
  font-size:.68rem;font-weight:700;letter-spacing:.22em;color:var(--nav-gold);text-transform:uppercase}
.nav-group{
  padding:.75rem 1.15rem .18rem;font-size:.74rem;letter-spacing:.14em;color:#7d90a6}

/* 全站目錄項目 */
.nav-doc{
  padding:.42rem 1.15rem .42rem 1.5rem;font-size:.9rem;color:#C8D6E4;
  border-left:3px solid transparent;transition:background .15s,color .15s,border-color .15s}
.nav-doc:hover{background:#1a2a3d;color:#fff}
.nav-doc .n{font-family:"Roboto Mono",monospace;font-size:.68rem;color:#6f8299;margin-left:.4rem}
.nav-doc.here{background:#1a2a3d;color:#fff;border-left-color:var(--nav-gold);font-weight:700}
.nav-doc.soon{opacity:.45;cursor:default}

/* 本頁目錄 */
.nav-toc{padding-bottom:2.5rem}
.nav-h1{
  padding:.5rem 1.15rem .5rem 1.5rem;font-family:"Noto Serif TC",serif;font-weight:700;
  font-size:.93rem;color:#E6EDF4;border-left:3px solid transparent;line-height:1.45;
  transition:background .15s,border-color .15s}
.nav-h2{
  padding:.32rem 1.15rem .32rem 2.35rem;font-size:.84rem;color:#9FB2C6;
  border-left:3px solid transparent;line-height:1.5;
  transition:background .15s,color .15s,border-color .15s}
.nav-h1:hover,.nav-h2:hover{background:#1a2a3d;color:#fff}
.nav-h1.active,.nav-h2.active{
  background:#22364c;color:#fff;border-left-color:var(--nav-cinnabar);font-weight:700}
.nav-empty{padding:.5rem 1.5rem;font-size:.82rem;color:#6f8299}

/* 版面：寬螢幕時把內容往右推 */
@media (min-width:1180px){
  body.has-sidenav{padding-left:var(--nav-w)}
  #navToggle,#navMask{display:none}
}

/* 窄螢幕：抽屜 */
@media (max-width:1179px){
  #sidenav{transform:translateX(-100%);transition:transform .25s ease;box-shadow:0 0 40px rgba(0,0,0,.4)}
  #sidenav.open{transform:none}
  #navToggle{
    position:fixed;left:.7rem;bottom:.7rem;z-index:902;
    width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;
    background:var(--nav-ink);color:var(--nav-bone);font-size:1.35rem;line-height:1;
    box-shadow:0 6px 18px rgba(16,28,43,.34);display:flex;align-items:center;justify-content:center}
  #navToggle:active{transform:scale(.94)}
  #navMask{
    position:fixed;inset:0;z-index:899;background:rgba(16,28,43,.5);
    opacity:0;pointer-events:none;transition:opacity .25s}
  #navMask.on{opacity:1;pointer-events:auto}
}

/* 底部：上一篇／下一篇 */
.nav-updown{
  max-width:920px;margin:0 auto;padding:1.6rem 1.2rem 3rem;
  display:flex;gap:.8rem;flex-wrap:wrap;justify-content:space-between;
  border-top:1px solid var(--nav-line)}
.nav-updown a{
  flex:1 1 220px;text-decoration:none;color:var(--nav-ink);background:#fff;
  border:1px solid var(--nav-line);border-radius:12px;padding:.85rem 1.1rem;
  box-shadow:0 5px 14px rgba(16,28,43,.06);transition:box-shadow .2s,transform .2s,border-color .2s}
.nav-updown a:hover{box-shadow:0 12px 28px rgba(16,28,43,.13);transform:translateY(-2px);border-color:var(--nav-gold)}
.nav-updown .k{
  display:block;font-family:"Roboto Mono",monospace;font-size:.68rem;letter-spacing:.18em;
  color:var(--nav-cinnabar);margin-bottom:.25rem}
.nav-updown .t{font-family:"Noto Serif TC",serif;font-weight:700;font-size:.98rem}
.nav-updown .next{text-align:right}
:focus-visible{outline:3px solid var(--nav-gold);outline-offset:2px}
`;

  /* ---------- ③ 小工具 ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  /* 目前頁面路徑，正規化成 /phonics/xxx.html 或 /phonics/ */
  function here() {
    var p = location.pathname;
    if (p.endsWith('/index.html')) p = p.slice(0, -10);
    return p;
  }

  /* ---------- ④ 抓本頁標題，組出本頁目錄 ---------- */
  function collectHeadings() {
    var root = document.querySelector('main') || document.body;
    var nodes = root.querySelectorAll('h1, h2');
    var out = [], n = 0;

    Array.prototype.forEach.call(nodes, function (h) {
      /* 排除頁內既有目錄區塊裡的標題 */
      if (h.closest('#toc, .nav-toc, #sidenav')) return;

      var text = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || SKIP_TITLES.test(text)) return;

      var level = h.tagName === 'H1' ? 1 : 2;

      /* h1 只有帶錨點的才算「章」；沒有錨點的通常是書名，跳過 */
      if (level === 1) {
        var hasAnchor = h.id || h.querySelector('[id]');
        if (!hasAnchor) return;
      }

      /* 沒有 id 就補一個，這樣才跳得過去 */
      var id = h.id || (h.querySelector('[id]') && h.querySelector('[id]').id);
      if (!id) { id = 'sec-' + (++n); h.id = id; }

      out.push({ id: id, text: text, level: level, node: h });
    });
    return out;
  }

  /* ---------- ⑤ 組出側邊欄 ---------- */
  function build() {
    var cur = here();

    document.head.appendChild(el('style', null, CSS));

    var nav = el('nav');
    nav.id = 'sidenav';
    nav.setAttribute('aria-label', '網站目錄');

    /* 站名 */
    var brand = el('a', 'nav-brand',
      '<b>一起學閩南語（臺語）漢字</b><span>怪的從來不是台語，是音標</span>');
    brand.href = '/';
    nav.appendChild(brand);

    /* 全站目錄 */
    nav.appendChild(el('div', 'nav-sect', '全站目錄'));
    SITE.forEach(function (sec) {
      nav.appendChild(el('div', 'nav-group', esc(sec.group)));
      sec.items.forEach(function (it) {
        var cls = 'nav-doc' + (it.soon ? ' soon' : '') + (it.href === cur ? ' here' : '');
        var html = esc(it.label) + (it.note ? '<span class="n">' + esc(it.note) + '</span>' : '');
        if (it.soon) {
          nav.appendChild(el('div', cls, html));
        } else {
          var a = el('a', cls, html);
          a.href = it.href;
          if (it.href === cur) a.setAttribute('aria-current', 'page');
          nav.appendChild(a);
        }
      });
    });

    /* 本頁目錄 */
    var heads = collectHeadings();
    var toc = el('div', 'nav-toc');
    /* 只有真的有分章才顯示「本頁目錄」，沒有就整段不出現 */
    if (heads.length) {
      nav.appendChild(el('div', 'nav-sect', '本頁目錄'));
      heads.forEach(function (h) {
        var a = el('a', h.level === 1 ? 'nav-h1' : 'nav-h2', esc(h.text));
        a.href = '#' + h.id;
        a.dataset.target = h.id;
        toc.appendChild(a);
      });
    }
    nav.appendChild(toc);
    document.body.appendChild(nav);
    document.body.classList.add('has-sidenav');

    /* 手機抽屜 */
    var mask = el('div'); mask.id = 'navMask';
    var btn = el('button', null, '☰');
    btn.id = 'navToggle';
    btn.setAttribute('aria-label', '開啟目錄');
    function toggle(on) {
      nav.classList.toggle('open', on);
      mask.classList.toggle('on', on);
      btn.innerHTML = on ? '✕' : '☰';
      btn.setAttribute('aria-label', on ? '關閉目錄' : '開啟目錄');
    }
    btn.addEventListener('click', function () { toggle(!nav.classList.contains('open')); });
    mask.addEventListener('click', function () { toggle(false); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.innerWidth < 1180) toggle(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggle(false);
    });
    document.body.appendChild(mask);
    document.body.appendChild(btn);

    /* 捲動高亮 */
    if (heads.length && 'IntersectionObserver' in window) {
      var links = {};
      toc.querySelectorAll('a').forEach(function (a) { links[a.dataset.target] = a; });
      var seen = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) seen.add(en.target.id); else seen.delete(en.target.id);
        });
        /* 取文件順序中最靠前、目前可見的那個 */
        var active = null;
        for (var i = 0; i < heads.length; i++) {
          if (seen.has(heads[i].id)) { active = heads[i].id; break; }
        }
        if (!active) return;
        for (var k in links) links[k].classList.toggle('active', k === active);
        var a = links[active];
        if (a && a.offsetTop < nav.scrollTop) nav.scrollTop = a.offsetTop - 120;
        else if (a && a.offsetTop > nav.scrollTop + nav.clientHeight - 80)
          nav.scrollTop = a.offsetTop - nav.clientHeight + 160;
      }, { rootMargin: '-70px 0px -65% 0px', threshold: 0 });
      heads.forEach(function (h) { io.observe(h.node); });
    }

    /* 底部 上一篇／下一篇 */
    var i = ORDER.indexOf(cur);
    if (i !== -1) {
      var find = function (href) {
        var r = null;
        SITE.forEach(function (s) { s.items.forEach(function (it) { if (it.href === href) r = it; }); });
        return r;
      };
      var box = el('div', 'nav-updown');
      var prev = i > 0 ? find(ORDER[i - 1]) : null;
      var next = i < ORDER.length - 1 ? find(ORDER[i + 1]) : null;
      if (prev) {
        var pa = el('a', 'prev', '<span class="k">← 上一篇</span><span class="t">' + esc(prev.label) + '</span>');
        pa.href = prev.href; box.appendChild(pa);
      }
      if (next) {
        var na = el('a', 'next', '<span class="k">下一篇 →</span><span class="t">' + esc(next.label) + '</span>');
        na.href = next.href; box.appendChild(na);
      }
      if (box.children.length) {
        var main = document.querySelector('main');
        (main && main.parentNode ? main.parentNode : document.body)
          .insertBefore(box, main ? main.nextSibling : null);
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
