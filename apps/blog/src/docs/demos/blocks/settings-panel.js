import { toaster } from '@tasteee/zest'

const tabs = document.querySelector('#settings-tabs')
const panels = document.querySelectorAll('[data-panel]')

tabs.addEventListener('change', (event) => {
  panels.forEach((panel) => (panel.hidden = panel.dataset.panel !== event.detail.value))
})

document.querySelector('#save').addEventListener('click', () => toaster.show('Settings saved'))
