const sidebar = document.querySelector('#sidebar')

sidebar.items = [
  { value: 'projects', label: 'Projects' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'reports', label: 'Reports' }
]

sidebar.addEventListener('select', (event) => (sidebar.value = event.detail.value))
