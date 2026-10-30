const ago = (ms) => new Date(Date.now() - ms).toISOString()

document.querySelector('#seconds').datetime = ago(20 * 1000)
document.querySelector('#minutes').datetime = ago(4 * 60 * 1000)
document.querySelector('#hours').datetime = ago(3 * 60 * 60 * 1000)
document.querySelector('#days').datetime = ago(40 * 24 * 60 * 60 * 1000)
