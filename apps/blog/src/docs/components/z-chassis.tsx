import type { CSSProperties, ReactNode } from 'react'
import { ComponentDoc } from '@app/docs/ComponentDoc'

// Inline chrome for the examples — the rail's logo/buttons/avatar and the
// screen's placeholder tiles. The frame itself comes from z-chassis.
const logo: CSSProperties = { width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--foreground)', flex: 'none' }
const avatar: CSSProperties = { width: '2.25rem', height: '2.25rem', borderRadius: '999px', background: 'linear-gradient(140deg, var(--purple), var(--pink))', border: '1px solid var(--border)', flex: 'none' }

const Icon = ({ d }: { d: string }) => (
	<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' style={{ flex: 'none' }}>
		{d.split('|').map((p, i) => (
			<path key={i} d={p} />
		))}
	</svg>
)

const ICONS = {
	home: 'M3 10.5 12 3l9 7.5|M5 9.5V21h14V9.5',
	people: 'M12 4.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4|M5.5 19a6.5 6.5 0 0 1 13 0',
	gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6|M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4'
}

const iconBtn: CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '2.5rem',
	height: '2.5rem',
	borderRadius: 'var(--radius-md)',
	color: 'var(--muted-foreground)',
	flex: 'none'
}

// a rail row that reveals its label as the rail widens (rail has overflow:hidden)
const NavRow = ({ children, label }: { children: ReactNode; label: string }) => (
	<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '2.5rem', padding: '0 0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
		{children}
		<span style={{ fontSize: 'var(--font-size-small)' }}>{label}</span>
	</div>
)

const Screen = () => (
	<div style={{ padding: '1rem', height: '100%', boxSizing: 'border-box' }}>
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', height: '100%' }}>
			{[0, 1, 2, 3].map((i) => (
				<div key={i} style={tile} />
			))}
			<div style={{ ...tile, gridColumn: 'span 2', gridRow: 'span 2' }} />
			<div style={{ ...tile, gridColumn: 'span 2', gridRow: 'span 2' }} />
		</div>
	</div>
)
const tile: CSSProperties = { border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--foreground) 3%, transparent)', minHeight: '5rem' }

export const ZChassisDoc = () => (
	<ComponentDoc
		tag='z-chassis'
		category='Layout'
		description='A device-like application chassis: a lighter body + rail wrapping a darker, inset “screen” for the main content.'
	>
		<div className='block'>
			<div className='micro'>Device chassis — lighter body &amp; rail, darker inset screen</div>
			<div className='panel'>
				<div style={{ height: '24rem' }}>
					<z-chassis rail-width='4.25rem'>
						<div slot='sidebar' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
							<div style={{ ...logo, marginBottom: '0.5rem' }} />
							<span style={iconBtn}><Icon d={ICONS.home} /></span>
							<span style={iconBtn}><Icon d={ICONS.people} /></span>
							<span style={iconBtn}><Icon d={ICONS.gear} /></span>
						</div>
						<div slot='sidebar-footer' style={{ display: 'flex', justifyContent: 'center' }}>
							<div style={avatar} />
						</div>
						<Screen />
					</z-chassis>
				</div>
			</div>
		</div>

		<div className='block'>
			<div className='micro'>expand-on-hover — hover the rail; it opens/closes with a fluid easing</div>
			<div className='panel'>
				<div style={{ height: '24rem' }}>
					<z-chassis expand-on-hover='' rail-width='13rem' rail-collapsed-width='3.75rem'>
						<div slot='sidebar' style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
							<div style={{ ...logo, marginBottom: '0.5rem', marginInline: '0.375rem' }} />
							<NavRow label='Dashboard'><Icon d={ICONS.home} /></NavRow>
							<NavRow label='Team'><Icon d={ICONS.people} /></NavRow>
							<NavRow label='Settings'><Icon d={ICONS.gear} /></NavRow>
						</div>
						<div slot='sidebar-footer'>
							<NavRow label='Manu Arora'>
								<div style={{ ...avatar, width: '1.6rem', height: '1.6rem' }} />
							</NavRow>
						</div>
						<Screen />
					</z-chassis>
				</div>
			</div>
			<div className='micro' style={{ marginTop: '1rem' }}>
				attrs · <b>rail-width</b> · <b>rail-collapsed-width</b> · <b>expand-on-hover</b> · <b>rail-side</b> ·{' '}
				<b>bezel</b> — retheme with <code>--chassis-body</code> / <code>--chassis-screen</code> /{' '}
				<code>--chassis-border</code>, tune motion with <code>--chassis-duration</code> /{' '}
				<code>--chassis-ease</code>.
			</div>
		</div>
	</ComponentDoc>
)
