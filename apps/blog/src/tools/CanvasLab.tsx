import { useEffect, useRef, useState } from 'react'
import './canvas-lab.css'

/*
 * Canvas & panels lab — an editor-style demo of the two foundational primitives:
 *   • z-resizable-panels (+ z-panel / z-panel-handle) as the shell chrome
 *   • z-editor-canvas (+ z-canvas-item) as the pannable / zoomable stage
 *
 * The toolbar drives the canvas purely through its imperative DOM API
 * (zoomBy / fit / reset), and a live readout reflects the `viewportchange` event —
 * i.e. everything is controlled by talking to the element as a DOM node.
 */

type Shape = { x: number; y: number; w: number; h: number; label: string; tone?: string }

const SHAPES: Shape[] = [
	{ x: 40, y: 60, w: 180, h: 110, label: 'hero', tone: 'primary' },
	{ x: 300, y: 40, w: 140, h: 140, label: 'avatar' },
	{ x: 520, y: 120, w: 220, h: 90, label: 'callout', tone: 'secondary' },
	{ x: 120, y: 260, w: 160, h: 160, label: 'card' },
	{ x: 380, y: 300, w: 260, h: 120, label: 'table', tone: 'primary' },
	{ x: 720, y: 320, w: 130, h: 130, label: 'chart', tone: 'secondary' }
]

// The Layers panel is a z-tree (groups + leaves). Stable module identity so the
// element isn't handed a fresh array on every React render.
const LAYER_TREE = [
	{
		id: 'frame',
		label: 'Frame',
		isExpanded: true,
		children: [
			{ id: 'hero', label: 'hero', icon: '◆' },
			{ id: 'avatar', label: 'avatar', icon: '●' }
		]
	},
	{
		id: 'content',
		label: 'Content',
		isExpanded: true,
		children: [
			{ id: 'callout', label: 'callout', icon: '◆' },
			{ id: 'card', label: 'card', icon: '▧' },
			{ id: 'table', label: 'table', icon: '▦' }
		]
	},
	{ id: 'chart', label: 'chart', icon: '◔' }
]

const INITIAL_HISTORY = ['Add chart', 'Resize table', 'Move card', 'Recolor hero']

export const CanvasLab = () => {
	const canvasRef = useRef<HTMLElement>(null)
	const panelsRef = useRef<HTMLElement>(null)
	const layersRef = useRef<HTMLElement>(null)
	const treeRef = useRef<HTMLElement>(null)
	const sortRef = useRef<HTMLElement>(null)

	const [zoomPct, setZoomPct] = useState(100)
	const [layersCollapsed, setLayersCollapsed] = useState(false)
	const [selected, setSelected] = useState('—')
	const [history, setHistory] = useState<string[]>(INITIAL_HISTORY)

	// Reflect the canvas viewport into the readout via its `viewportchange` event.
	useEffect(() => {
		const el = canvasRef.current
		if (!el) return
		const onViewport = (e: Event) => {
			const d = (e as CustomEvent).detail
			if (d?.zoom) setZoomPct(Math.round(d.zoom * 100))
		}
		el.addEventListener('viewportchange', onViewport)
		return () => el.removeEventListener('viewportchange', onViewport)
	}, [])

	// Track the layers panel's collapsed state (the group emits `collapsechange`).
	useEffect(() => {
		const el = layersRef.current
		if (!el) return
		const onCollapseChange = (e: Event) =>
			setLayersCollapsed(Boolean((e as CustomEvent).detail?.collapsed))
		el.addEventListener('collapsechange', onCollapseChange)
		return () => el.removeEventListener('collapsechange', onCollapseChange)
	}, [])

	// z-tree emits `select` with the chosen node → drive the inspector.
	useEffect(() => {
		const el = treeRef.current
		if (!el) return
		const onSelect = (e: Event) => {
			const node = (e as CustomEvent).detail?.node
			if (node) setSelected(node.label ?? node.id)
		}
		el.addEventListener('select', onSelect)
		return () => el.removeEventListener('select', onSelect)
	}, [])

	// z-sortable emits `sort` {oldIndex,newIndex} → mirror the reorder into state
	// so React's model stays in sync with the DOM the element just rearranged.
	useEffect(() => {
		const el = sortRef.current
		if (!el) return
		const onSort = (e: Event) => {
			const { oldIndex, newIndex } = (e as CustomEvent).detail
			setHistory((prev) => {
				const next = [...prev]
				const [moved] = next.splice(oldIndex, 1)
				next.splice(newIndex, 0, moved)
				return next
			})
		}
		el.addEventListener('sort', onSort)
		return () => el.removeEventListener('sort', onSort)
	}, [])

	const canvas = () => canvasRef.current as any
	const zoomIn = () => canvas()?.zoomBy?.(1.2)
	const zoomOut = () => canvas()?.zoomBy?.(0.8)
	const fit = () => canvas()?.fit?.(48)
	const reset = () => canvas()?.reset?.()
	const toggleLayers = () => {
		const p = layersRef.current as any
		layersCollapsed ? p?.expand?.() : p?.collapse?.()
	}
	const resetLayout = () => (panelsRef.current as any)?.reset?.()

	return (
		<div className='SitePage CanvasLab'>
			<header className='hero'>
				<z-box isColumn gap='3' xStart>
					<span className='eyebrow'>
						<span className='line' /> Foundational primitives
					</span>
					<z-display size='sm'>Canvas &amp; panels lab</z-display>
					<z-text size='lg' color='muted' style={{ maxWidth: '52ch' }}>
						An editor shell built from <code>z-resizable-panels</code> wrapping a{' '}
						<code>z-editor-canvas</code>. Drag the separators, collapse the sidebar, and pan / scroll
						/ pinch the stage. The toolbar drives the canvas through its DOM methods.
					</z-text>
				</z-box>
			</header>

			<section className='section'>
				<div className='editor-frame'>
					{/* ── toolbar ── */}
					<div className='lab-toolbar'>
						<z-cluster gap='sm' aligns-y='center'>
							<z-button kind='outline' size='small' onClick={zoomOut}>
								−
							</z-button>
							<z-button kind='outline' size='small' onClick={zoomIn}>
								+
							</z-button>
							<span className='zoom-readout mono'>{zoomPct}%</span>
							<z-separator orientation='vertical' style={{ height: '1.25rem' }} />
							<z-button kind='ghost' size='small' onClick={fit}>
								Fit
							</z-button>
							<z-button kind='ghost' size='small' onClick={reset}>
								Reset view
							</z-button>
						</z-cluster>

						<z-cluster gap='sm' aligns-y='center'>
							<z-button kind='ghost' size='small' onClick={toggleLayers}>
								{layersCollapsed ? 'Show layers' : 'Hide layers'}
							</z-button>
							<z-button kind='ghost' size='small' onClick={resetLayout}>
								Reset layout
							</z-button>
						</z-cluster>
					</div>

					{/* ── the resizable editor body ── */}
					<z-resizable-panels ref={panelsRef} direction='row' auto-save-id='canvas-lab' class='editor-body'>
						{/* left: layers (collapsible) */}
						<z-panel ref={layersRef} default-size='20%' min-size='150px' collapsible={true} collapsed-size='0'>
							<div className='pane'>
								<div className='pane-head mono'>Layers</div>
								<div className='pane-body'>
									<z-tree ref={treeRef} items={LAYER_TREE} selection='single' style={{ width: '100%' }} />
								</div>
							</div>
						</z-panel>

						<z-panel-handle />

						{/* center: the infinite canvas */}
						<z-panel min-size='30%'>
							<z-editor-canvas
								ref={canvasRef}
								grid='dots'
								grid-size='28'
								min-zoom='0.3'
								max-zoom='5'
								style={{ width: '100%', height: '100%' }}
							>
								{SHAPES.map((s) => (
									<z-canvas-item key={s.label} x={s.x} y={s.y} width={s.w} height={s.h}>
										<z-surface
											tone={s.tone ?? 'neutral'}
											variant={s.tone ? 'soft' : 'plain'}
											border={true}
											radius='md'
											class='shape'
										>
											{s.label}
										</z-surface>
									</z-canvas-item>
								))}

								{/* screen-space HUD that does NOT pan/zoom with the canvas */}
								<div slot='overlay' className='hud mono'>
									scroll / pinch to zoom · drag to pan · space + drag
								</div>
							</z-editor-canvas>
						</z-panel>

						<z-panel-handle />

						{/* right: inspector — a nested column split shows vertical + nesting */}
						<z-panel default-size='24%' min-size='200px' max-size='420px'>
							<z-resizable-panels direction='column' style={{ height: '100%' }}>
								<z-panel default-size='55%' min-size='80px'>
									<div className='pane'>
										<div className='pane-head mono'>Inspector</div>
										<div className='pane-body'>
											<div className='field'>
												<label className='mono'>Layer</label>
												<z-text size='sm' style={{ fontWeight: 600 }}>
													{selected}
												</z-text>
											</div>
											<div className='field'>
												<label className='mono'>X</label>
												<z-input value='120' size='small' />
											</div>
											<div className='field'>
												<label className='mono'>Y</label>
												<z-input value='260' size='small' />
											</div>
											<div className='field'>
												<label className='mono'>Opacity</label>
												<z-slider value={80} min={0} max={100} />
											</div>
										</div>
									</div>
								</z-panel>

								<z-panel-handle />

								<z-panel min-size='80px'>
									<div className='pane'>
										<div className='pane-head mono'>History · drag to reorder</div>
										<div className='pane-body'>
											<z-sortable ref={sortRef} axis='y' handle='.grip' style={{ display: 'block' }}>
												{history.map((h) => (
													<div className='layer-row sortable-row' key={h}>
														<span className='grip' aria-hidden='true'>
															⠿
														</span>
														<span>{h}</span>
													</div>
												))}
											</z-sortable>
										</div>
									</div>
								</z-panel>
							</z-resizable-panels>
						</z-panel>
					</z-resizable-panels>
				</div>
			</section>
		</div>
	)
}
