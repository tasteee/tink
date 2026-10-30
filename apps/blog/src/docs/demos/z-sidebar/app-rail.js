const sidebar = document.querySelector('#sidebar')

sidebar.items = [
  { value: 'home', label: 'Home' },
  {
    label: 'Workspace',
    items: [
      { value: 'projects', label: 'Projects', badge: '4' },
      { value: 'tasks', label: 'Tasks' },
      { label: 'Archived', items: [{ value: 'q1', label: 'Q1 launch' }, { value: 'q2', label: 'Q2 launch' }] }
    ]
  },
  { value: 'settings', label: 'Settings' }
]

sidebar.addEventListener('select', (event) => (sidebar.value = event.detail.value))
