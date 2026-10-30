const tabs = document.querySelector('#tabs')
const range = document.querySelector('#range')
const total = document.querySelector('#total')
const totals = { day: '$1,920', week: '$12,480', month: '$48,310' }

tabs.addEventListener('change', (event) => {
  range.textContent = event.detail.value
  total.textContent = totals[event.detail.value]
})
