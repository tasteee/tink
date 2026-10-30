import { useLayoutEffect, useRef, useState } from 'react'
import { getDemo, runDemoScript, type DemoT } from '@app/docs/demos/registry'

type DocExamplePropsT = {
	/** demo id: `demos/<id>.html` (+ `.js` / `.css`) */
	demo: string
	title: string
	description?: string
	/**
	 * Contain `position: fixed` inside the preview (floating docks, toaster
	 * regions) so the demo can show viewport-anchored behavior in place.
	 */
	isContained?: boolean
	/** align the demo to the top-left instead of centering it */
	isStart?: boolean
}

// Renders the demo's own files into the preview and runs its script against
// it. Re-runs whenever `runKey` changes (the replay button).
const DemoCanvas = ({ demo, runKey }: { demo: DemoT; runKey: number }) => {
	const stageRef = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		const stage = stageRef.current
		if (!stage) return
		stage.innerHTML = (demo.css ? `<style>${demo.css}</style>` : '') + demo.html
		if (demo.js) runDemoScript(demo.js, stage)
		return () => {
			stage.innerHTML = ''
		}
	}, [demo, runKey])

	return <div ref={stageRef} className="Example-stage" />
}

const CopyIcon = ({ isDone }: { isDone: boolean }) =>
	isDone ? (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<polyline points="4 12 10 18 20 6" />
		</svg>
	) : (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect x="9" y="9" width="11" height="11" rx="2" />
			<path d="M5 15V5a2 2 0 0 1 2-2h10" />
		</svg>
	)

const ReplayIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M3 12a9 9 0 1 0 3-6.7" />
		<polyline points="3 3 3 9 9 9" />
	</svg>
)

/**
 * A live example: one card with a Preview / Code switch. Preview renders the
 * demo on a faint dot-grid canvas, the visual cue that this area is a live
 * sketch of the element rather than part of the page. Code shows the very same
 * files, one tab per file, with a copy button for the active one.
 */
export const DocExample = ({ demo: id, title, description, isContained, isStart }: DocExamplePropsT) => {
	const demo = getDemo(id)
	const [view, setView] = useState<'preview' | 'code'>('preview')
	const [fileIndex, setFileIndex] = useState(0)
	const [runKey, setRunKey] = useState(0)
	const [isCopied, setIsCopied] = useState(false)

	if (!demo) {
		return (
			<section className="Example">
				<z-alert tone="danger" heading="Missing demo">
					demos/{id}.html was not found.
				</z-alert>
			</section>
		)
	}

	const file = demo.files[Math.min(fileIndex, demo.files.length - 1)]

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(file.code)
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 1400)
		} catch {
			/* clipboard unavailable */
		}
	}

	const canvasClass = ['Example-canvas', isContained ? 'is-contained' : '', isStart ? 'is-start' : ''].join(' ')

	return (
		<section className="Example" id={id.split('/').pop()}>
			<header className="Example-head">
				<h3 className="Example-title">{title}</h3>
				{description && <p className="Example-description">{description}</p>}
			</header>

			<div className="Example-card">
				<div className="Example-toolbar">
					<div className="Example-switch" role="tablist" aria-label={`${title} view`}>
						<button type="button" role="tab" aria-selected={view === 'preview'} onClick={() => setView('preview')}>
							Preview
						</button>
						<button type="button" role="tab" aria-selected={view === 'code'} onClick={() => setView('code')}>
							Code
						</button>
					</div>

					<div className="Example-actions">
						{view === 'code' ? (
							<>
								{demo.files.length > 1 && (
									<div className="Example-files" role="tablist" aria-label="Files">
										{demo.files.map((f, index) => (
											<button
												key={f.name}
												type="button"
												role="tab"
												aria-selected={f === file}
												onClick={() => setFileIndex(index)}
											>
												{f.name}
											</button>
										))}
									</div>
								)}
								{demo.files.length === 1 && <span className="Example-filename">{file.name}</span>}
								<button
									type="button"
									className={isCopied ? 'Example-icon is-done' : 'Example-icon'}
									aria-label={isCopied ? 'Copied' : `Copy ${file.name}`}
									onClick={copy}
								>
									<CopyIcon isDone={isCopied} />
								</button>
							</>
						) : (
							<button
								type="button"
								className="Example-icon"
								aria-label="Replay demo"
								onClick={() => setRunKey((k) => k + 1)}
							>
								<ReplayIcon />
							</button>
						)}
					</div>
				</div>

				{/* the preview stays mounted under the code view so its state survives a peek at the code */}
				<div className={canvasClass} hidden={view !== 'preview'}>
					<DemoCanvas demo={demo} runKey={runKey} />
				</div>
				{view === 'code' && (
					<div className="Example-code">
						<z-code-block code={file.code} language={file.language} hasLineNumbers hideHeader isFlush />
					</div>
				)}
			</div>
		</section>
	)
}
