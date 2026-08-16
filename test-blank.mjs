import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', { url: "http://localhost/", pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.getComputedStyle = dom.window.getComputedStyle;
global.localStorage = dom.window.localStorage;

const { createRequire } = await import('module');
const require = createRequire(import.meta.url);
const esbuild = await import('esbuild');
let result;
try {
  result = esbuild.buildSync({
    entryPoints: ['src/App.jsx'], bundle: true, write: false, loader: { '.jsx': 'jsx' },
    format: 'cjs', platform: 'node', jsx: 'automatic', logLevel: 'silent',
    external: ['react', 'react-dom', 'react/jsx-runtime'], alias: { '@': './src' },
    define: { 'import.meta.env.VITE_API_BASE_URL': '""', 'import.meta.env.VITE_MIDTRANS_CLIENT_KEY': '""', 'import.meta.env.VITE_MIDTRANS_ENV': '"sandbox"' },
  });
  console.log('BUNDLE BUILD: OK');
} catch (e) {
  console.log('BUNDLE BUILD ERROR:', e.message);
  process.exit(1);
}
const Module = require('module');
const m = new Module('App.js', null);
m.filename = process.cwd() + '/App-compiled.js';
m.paths = Module._nodeModulePaths(process.cwd());
try {
  m._compile(result.outputFiles[0].text, m.filename);
} catch (e) {
  console.log('MODULE COMPILE/EXEC ERROR:', e.stack);
  process.exit(1);
}
const App = m.exports.default;
const React = (await import('react')).default;
const { render, screen } = await import('@testing-library/react');
try {
  render(React.createElement(App));
  await new Promise(r => setTimeout(r, 400));
  console.log('RENDER OK, body length:', document.body.textContent.length);
  console.log('Body snippet:', document.body.textContent.slice(0, 200));
} catch (err) {
  console.log('RENDER ERROR:', err.stack || err.message);
}
process.exit(0);
