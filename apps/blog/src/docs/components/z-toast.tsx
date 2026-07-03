import { useRef } from 'react'
import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZToastDoc = () => {
	const toasterRef = useRef<HTMLElement & { push?: (o: unknown) => void }>(null)
	const fireToast = (opts: unknown): void => toasterRef.current?.push?.(opts)

	return (
		<ComponentDoc tag="z-toast" category="Overlays" description="Transient notifications — call push() on the imperative ref.">
			<div className="block">
				<div className="panel">
					<div className='row' style={{ gap: '1.5rem' }}>
						<z-button kind='outline' onClick={() => fireToast({ tone: 'success', title: 'Changes saved', description: 'Your project is up to date.' })}>
							Success toast
						</z-button>
						<z-button kind='outline' onClick={() => fireToast({ tone: 'info', title: 'New message', description: 'Ada sent you a comment.' })}>
							Info toast
						</z-button>
						<z-button kind='outline' tone='danger' onClick={() => fireToast({ tone: 'danger', title: 'Upload failed', description: 'The file was too large.', duration: 6000 })}>
							Danger toast
						</z-button>
					</div>
				</div>
			</div>
			<z-toast position='bottom-end' ref={toasterRef as never} />
		</ComponentDoc>
	)
}
