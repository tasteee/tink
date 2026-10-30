const LONG_TRAIL = [
  { label: 'Home', href: '/' },
  { label: 'Workspace', href: '/workspace' },
  { label: 'Projects', href: '/projects' },
  { label: 'Aurora', href: '/projects/aurora' },
  { label: 'Settings', isCurrent: true }
]

const breadcrumbs = document.querySelector('#breadcrumbs')
breadcrumbs.items = LONG_TRAIL
