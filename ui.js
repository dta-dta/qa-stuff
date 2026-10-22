(() => {
  'use strict';
  const key = 'qa-stuff-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem(key); } catch {}
  const localFile = location.protocol === 'file:';
  // Browsers can give each file:// page its own storage. Carry the current
  // preference in local navigation URLs so it survives a change of page.
  if (localFile) {
    const incoming = new URL(location.href).searchParams.get('qa-theme');
    if (incoming === 'light' || incoming === 'dark') {
      preference = incoming;
      try { localStorage.setItem(key, preference); } catch {}
    }
  }
  function syncLocalLinks(theme) {
    if (!localFile) return;
    document.querySelectorAll('a[href]').forEach(link => {
      const target = new URL(link.getAttribute('href'), location.href);
      if (target.protocol !== 'file:' || !/\/(?:index|artikelnummern|artikelnummer_stueckzahl|log-analyzer|stock_product_analyzer|sku_import_analyzer)\.html$/.test(target.pathname)) return;
      target.searchParams.set('qa-theme', theme);
      link.href = target.href;
    });
    const currentUrl = new URL(location.href);
    currentUrl.searchParams.set('qa-theme', theme);
    try { window.history.replaceState(null, '', currentUrl.href); } catch {}
  }
  function apply(theme) {
    root.dataset.theme = theme;
    syncLocalLinks(theme);
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-checked', String(theme === 'dark'));
      toggle.querySelector('.theme-label').textContent = theme === 'dark' ? 'Dunkel' : 'Hell';
    }
  }
  apply(preference === 'light' || preference === 'dark' ? preference : system.matches ? 'dark' : 'light');
  document.addEventListener('DOMContentLoaded', () => {
    const projects = [
      ['artikelnummern.html', 'Artikelnummern'],
      ['artikelnummer_stueckzahl.html', 'Artikel + Stückzahl'],
      ['log-analyzer.html', 'NW Log Analyzer'],
      ['stock_product_analyzer.html', 'Stock & Product'],
      ['sku_import_analyzer.html', 'SKU Import']
    ];
    const current = location.pathname.split('/').pop();
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `<div class="header-inner"><div class="header-top"><a class="brand" href="index.html" aria-label="QA Stuff – Übersicht"><span class="brand-mark" aria-hidden="true">✳</span>QA Stuff</a><div class="header-tools"><span class="workspace-label">Dein Workspace für den Alltag</span><button type="button" class="theme-toggle" role="switch" aria-label="Dunkles Design" aria-checked="false"><span class="theme-label">Hell</span><span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span></button></div></div><nav class="project-nav" aria-label="Projekte">${projects.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav></div>`;
    document.body.prepend(header);
    apply(root.dataset.theme);
    header.querySelector('.theme-toggle').addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { localStorage.setItem(key, preference); } catch {}
    });
  });
  system.addEventListener('change', event => { if (!preference) apply(event.matches ? 'dark' : 'light'); });
  window.addEventListener('storage', event => {
    if (event.key === key) {
      preference = event.newValue;
      apply(preference === 'light' || preference === 'dark' ? preference : system.matches ? 'dark' : 'light');
    }
  });
})();
