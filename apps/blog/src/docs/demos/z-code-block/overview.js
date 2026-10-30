const DEMO_CODE = `const resolveToneClass = (props: any): string => {
  if (props.tone === 'primary') return 'is-primary'
  if (props.tone === 'secondary') return 'is-secondary'
  return 'is-neutral'
}`

const codeBlock = document.querySelector('#code-block')
codeBlock.code = DEMO_CODE
