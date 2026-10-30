const IMG = 'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'>
      <defs>
        <linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stop-color='hsl(255 55% 62%)'/>
          <stop offset='100%' stop-color='hsl(310 60% 68%)'/>
        </linearGradient>
      </defs>
      <rect width='640' height='420' fill='url(#sky)'/>
      <polygon points='0,420 140,220 260,340 420,180 640,420' fill='hsl(230 40% 30%)'/>
      <polygon points='0,420 220,300 380,420' fill='hsl(230 45% 22%)'/>
      <circle cx='500' cy='90' r='46' fill='hsl(45 90% 78%)'/>
    </svg>`
  )

const img = document.querySelector('#img')
img.src = IMG
const img2 = document.querySelector('#img-2')
img2.src = IMG
