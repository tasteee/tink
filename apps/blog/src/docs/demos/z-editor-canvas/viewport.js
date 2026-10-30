const canvas = document.querySelector('#canvas')
const log = document.querySelector('#log')

canvas.addEventListener('viewportchange', (event) => {
  const { x, y, zoom } = event.detail
  log.textContent = `x ${Math.round(x)} · y ${Math.round(y)} · zoom ${zoom.toFixed(2)}`
})

document.querySelector('#zoom').addEventListener('click', () => canvas.zoomTo(1.5))
