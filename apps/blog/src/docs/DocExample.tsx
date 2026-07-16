import { useState, type ReactNode } from 'react'

type DocExampleProps = {
	title: string
	description?: string
	code: string
	language?: string
	children: ReactNode
}

/** A deliberately quiet live-example/code pair used by the component reference. */
export const DocExample = ({ title, description, code, language, children }: DocExampleProps) => {
	const [view, setView] = useState<'preview' | 'code'>('preview')
	const detectedLanguage = language ?? (code.trimStart().startsWith('<') ? 'html' : 'ts')

	return (
		<section className="doc-example">
			<z-row alignsY="center" className="doc-example-head">
				<z-column gap="1">
					<z-heading size="xs" tag="h2">{title}</z-heading>
					{description && <z-text size="sm" color="muted">{description}</z-text>}
				</z-column>
				<z-row gap="1" className="doc-example-tabs" role="tablist" aria-label={`${title} view`}>
					<z-button kind={view === 'preview' ? 'soft' : 'plain'} size="small" onClick={() => setView('preview')}>
						Preview
					</z-button>
					<z-button kind={view === 'code' ? 'soft' : 'plain'} size="small" onClick={() => setView('code')}>
						Code
					</z-button>
				</z-row>
			</z-row>
			<div className={view === 'preview' ? 'doc-example-stage' : 'doc-example-code'}>
				{view === 'preview' ? children : <z-code-block language={detectedLanguage} hasLineNumbers code={code.trim()} />}
			</div>
		</section>
	)
}
