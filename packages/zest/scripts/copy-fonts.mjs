// dist/fonts.css is src/fonts.css verbatim: nothing imports it from the
// bundle on purpose (loading fonts is the app's decision), so Vite would not
// emit it, and it is copied here instead.
import { copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
copyFileSync(join(root, 'src', 'fonts.css'), join(root, 'dist', 'fonts.css'))
console.log('dist/fonts.css: copied')
