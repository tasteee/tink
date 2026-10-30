const TRAIL = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Aurora', isCurrent: true }
]

const breadcrumbs = document.querySelector('#breadcrumbs')
breadcrumbs.items = TRAIL
