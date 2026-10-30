const palette = document.querySelector('#palette')

document.querySelector('#open').addEventListener('click', () => (palette.isOpen = true))

// pick a shortcut the browser and OS don't already own
window.addEventListener('keydown', (event) => {
  if (event.altKey && event.code === 'KeyP') {
    event.preventDefault()
    palette.isOpen = true
  }
})
