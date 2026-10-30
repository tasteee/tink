// slow steps hold longer before the next line starts
document.querySelector('#boot').lines = [
  { text: '$ pnpm dev', typeSpeed: 55 },
  { text: 'zesty v0.1.0', delay: 500 },
  { text: 'starting dev server…', delay: 250 },
  { text: 'compiling modules', delay: 900 },
  { text: '✓ ready in 842ms', delay: 700 },
  { text: '➜  Local:   http://localhost:3000', delay: 300 }
]
