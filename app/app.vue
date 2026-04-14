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

:root {
  --accent: #6366f1;
}

* {
    font-family: 'IbmPlexSans';
}

.md-content *:not(h1, h2, h3, h4, h5, h6) {
  margin: -0.5rem 0 !important;
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
  background: #f4f4f4;
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
  color: #6b7280;
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
  border: 1px solid #e5e7eb;
  text-align: left;
}
.md-content th { background: #f9fafb; font-weight: 600; }
.md-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
</style>