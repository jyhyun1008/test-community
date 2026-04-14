<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<style>
@font-face {
    font-family: 'IbmPlexSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/IBMPlexSansKR-ExtraLight.woff') format('woff');
    font-weight: 200;
    font-display: swap;
}

@font-face {
    font-family: 'IbmPlexSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/IBMPlexSansKR-Light.woff') format('woff');
    font-weight: 300;
    font-display: swap;
}

@font-face {
    font-family: 'IbmPlexSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/IBMPlexSansKR-Regular.woff') format('woff');
    font-weight: normal;
    font-display: swap;
}

@font-face {
    font-family: 'IbmPlexSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/IBMPlexSansKR-Text.woff') format('woff');
    font-weight: normal;
    font-display: swap;
}

@font-face {
    font-family: 'IbmPlexSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/IBMPlexSansKR-Medium.woff') format('woff');
    font-weight: 500;
    font-display: swap;
}

@font-face {
    font-family: 'IbmPlexSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/IBMPlexSansKR-SemiBold.woff') format('woff');
    font-weight: 600;
    font-display: swap;
}

/* ── 라이트 모드 변수 ── */
:root {
  --accent: #6366f1;

  --bg:         #ffffff;
  --bg-surface: #ffffff;
  --bg-subtle:  #f9fafb;
  --bg-hover:   #f3f4f6;

  --border:        #e5e7eb;
  --border-subtle: #f3f4f6;

  --text-primary:     #111827;
  --text-secondary:   #374151;
  --text-muted:       #6b7280;
  --text-placeholder: #9ca3af;

  --badge-bg:    #f3f4f6;
  --badge-color: var(--accent);
  --accent-subtle: #f3f4f6;
}

/* ── 다크 모드 변수 ── */
[data-theme="dark"] {
  --bg:         #111111;
  --bg-surface: #1c1c1c;
  --bg-subtle:  #242424;
  --bg-hover:   #2e2e2e;

  --border:        #2e2e2e;
  --border-subtle: #242424;

  --text-primary:     #f0f0f0;
  --text-secondary:   #d0d0d0;
  --text-muted:       #999999;
  --text-placeholder: #666666;

  --badge-bg:    #2e2e2e;
  --badge-color: var(--accent);
  --accent-subtle: #2e2e2e;
}

html, body {
  background: var(--bg);
  color: var(--text-primary);
  transition: background 0.2s, color 0.2s;
  margin: 0;
}

* {
    font-family: 'IbmPlexSans';
}

/* 폼 요소 다크모드 기본값 */
input, textarea, select {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.md-content > *:not(h1, h2, h3, h4, h5, h6){
  margin: -0.5rem 0 !important;
}

.md-content > *:first-child {
  margin-top: 0 !important;
}

.md-content h1, .md-content h2, .md-content h3 {
  font-weight: 700;
  margin: 1rem 0 0.5rem;
  line-height: 1.3;
}
.md-content h1 { font-size: 1.4rem; }
.md-content h2 { font-size: 1.2rem; }
.md-content h3 { font-size: 1rem; }
.md-content p  { margin: 0.5rem 0; line-height: 1.7; }
.md-content ul, .md-content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
.md-content li { margin: 0.25rem 0; }
.md-content code {
  background: var(--bg-hover);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.875em;
  font-family: monospace;
}
.md-content pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.75rem 0;
}
.md-content pre code {
  background: none;
  padding: 0;
  color: inherit;
  font-size: 0.875rem;
}
.md-content blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  color: var(--text-muted);
  margin: 0.75rem 0;
}
.md-content a {
  color: var(--accent);
  text-decoration: underline;
}
.md-content img {
  max-width: 100%;
  border-radius: 8px;
}
.md-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
}
.md-content th, .md-content td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
}
.md-content th { background: var(--bg-subtle); font-weight: 600; }
.md-content hr { border: none; border-top: 1px solid var(--border); margin: 1rem 0; }

/* 커스텀 이모지 */
.custom-emoji { display: inline-block; width: 1.4em; height: 1.4em; vertical-align: middle; object-fit: contain; margin: 0 0.05em; border-radius: 0 !important; transition: transform 0.3s ease; }
.custom-emoji:hover {transform: scale(1.1);}
</style>
