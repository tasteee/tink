const TREE_ITEMS = [
  {
    id: 'src',
    label: 'src',
    isExpanded: true,
    children: [
      {
        id: 'components',
        label: 'components',
        isExpanded: true,
        children: [
          { id: 'button', label: 'z-button.tsx' },
          { id: 'input', label: 'z-input.tsx', isSelected: true },
          { id: 'tree', label: 'z-tree.tsx' }
        ]
      },
      { id: 'index', label: 'index.ts' }
    ]
  },
  { id: 'pkg', label: 'package.json' },
  { id: 'readme', label: 'README.md', isDisabled: true }
]

const tree = document.querySelector('#tree')
tree.items = TREE_ITEMS
