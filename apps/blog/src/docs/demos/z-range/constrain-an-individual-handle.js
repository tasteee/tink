const range = document.querySelector('#travel')

range.value = [10, 60]
// the upper handle can only travel between 40 and 80
range.handles = [{}, { min: 40, max: 80, tone: 'secondary' }]
