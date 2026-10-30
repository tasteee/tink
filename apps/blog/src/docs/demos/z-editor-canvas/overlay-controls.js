const canvas = document.querySelector('#canvas')

document.querySelector('#fit').addEventListener('click', () => canvas.fit(32))
document.querySelector('#reset').addEventListener('click', () => canvas.reset())
