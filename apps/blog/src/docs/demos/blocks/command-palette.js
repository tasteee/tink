const palette = document.querySelector('#palette')
const picked = document.querySelector('#picked')

palette.addEventListener('select', (event) => {
  picked.textContent = `Selected: ${event.detail.value}`
})
