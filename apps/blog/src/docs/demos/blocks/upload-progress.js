import { toaster } from '@tasteee/zest'

const upload = (willFail) => {
  const id = 'upload'
  toaster.show({ id, title: 'Uploading report.pdf…', description: '0%', duration: Infinity })

  let percent = 0
  const tick = setInterval(() => {
    percent += 20
    if (willFail && percent >= 60) {
      clearInterval(tick)
      toaster.show({ id, title: 'Upload failed', description: 'The file is over the 25 MB limit.', tone: 'danger', duration: 6000 })
      return
    }
    if (percent >= 100) {
      clearInterval(tick)
      toaster.show({ id, title: 'Upload complete', description: 'report.pdf is ready to share.', tone: 'success' })
      return
    }
    toaster.show({ id, title: 'Uploading report.pdf…', description: `${percent}%`, duration: Infinity })
  }, 500)
}

document.querySelector('#upload').addEventListener('click', () => upload(false))
document.querySelector('#fail').addEventListener('click', () => upload(true))
