const sidebar = document.querySelector('#sidebar')
const toggle = document.querySelector('#toggle')

const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`

// with icons, the collapsed rail keeps them; without, it falls back to initials
sidebar.items = [
  { value: 'inbox', label: 'Inbox', icon: icon('<path d="M4 13h4l2 3h4l2-3h4"/><path d="M4 13 7 5h10l3 8v6H4z"/>') },
  { value: 'calendar', label: 'Calendar', icon: icon('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>') },
  { value: 'files', label: 'Files', icon: icon('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>') },
  { value: 'settings', label: 'Settings', icon: icon('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>') }
]

sidebar.addEventListener('select', (event) => (sidebar.value = event.detail.value))

toggle.addEventListener('click', () => {
  sidebar.isCollapsed = !sidebar.isCollapsed
  toggle.textContent = sidebar.isCollapsed ? 'Expand' : 'Collapse'
})
