const nav = document.querySelector('#nav')
const title = document.querySelector('#title')

nav.items = [
  { value: 'inbox', label: 'Inbox', badge: '3' },
  { value: 'drafts', label: 'Drafts' },
  {
    label: 'Projects',
    items: [
      { value: 'design-system', label: 'Design system' },
      { value: 'website', label: 'Website' }
    ]
  }
]

nav.addEventListener('select', (event) => {
  nav.value = event.detail.value
  title.textContent = event.detail.value.replace('-', ' ').replace(/^./, (c) => c.toUpperCase())
})
