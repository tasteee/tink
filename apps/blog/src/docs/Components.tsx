import { useEffect, useRef } from 'react'
import { DocsLink } from '@app/docs/DocsLink'

// Ported from pages/components.html. The old page set array-valued props and
// fired toasts from an inline <script>. Here those become: a `withProps` ref
// helper (assigns array/object props onto the custom element on mount) and
// React refs + handlers for the toaster and ⌘K command palette.

// Assign array/object-valued properties onto a zest element once it mounts.
const withProps =
	(props: Record<string, unknown>) =>
	(el: HTMLElement | null): void => {
		if (el) Object.assign(el, props)
	}

export const Components = () => {
	const toasterRef = useRef<HTMLElement & { push?: (o: unknown) => void }>(null)
	const commandRef = useRef<HTMLElement & { isOpen?: boolean }>(null)

	const fireToast = (opts: unknown): void => toasterRef.current?.push?.(opts)

	// ⌘K / Ctrl+K opens the command palette.
	useEffect(() => {
		const onKey = (e: KeyboardEvent): void => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault()
				if (commandRef.current) commandRef.current.isOpen = true
			}
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [])

	return (
		<div className="DocsPage">
			<header className="hero">
				<z-box className="eyebrow">
					<span>DESIGN SYSTEM</span>
					<span className="line" />
				</z-box>
				<z-heading size="xxl">Components</z-heading>
				<p className="lede">
					No shade. Accessible borders. <span className="muted">Ultra premium, zero filler.</span>
				</p>
				<nav className="DocsSubnav">
					<a href="#foundations">Foundations</a>
					<a href="#actions">Actions</a>
					<a href="#forms">Forms</a>
					<a href="#data">Data</a>
					<a href="#navigation">Navigation</a>
					<a href="#overlays">Overlays</a>
					<a href="#specialized">Specialized</a>
				</nav>
			</header>

			{/* ── FOUNDATIONS ── */}
			<section className="section" id="foundations">
				<div className="section-head">
					<span className="dot purple" />
					<h2>Foundations</h2>
				</div>
				<p className="section-sub">The primitives every other component composes from — type, surfaces, and dividers.</p>

				<z-box isColumn className="block">
					<div className="block-title">
						<h3>&lt;z-heading&gt; · &lt;z-text&gt;</h3>
						<span className="desc">DM Sans, one family, all weights</span>
					</div>
					<div className="panel">
						<z-box isFlex isColumn gap="4">
							<z-heading size="xxl">The quick brown fox</z-heading>
							<z-heading size="lg" tag="h2">
								Jumps over the lazy dog
							</z-heading>
							<z-subheading size="sm" color="muted">
								Subheading · uppercase · tracked
							</z-subheading>
							<z-text size="lg">
								Body copy stays calm and legible. White is reserved for hierarchy — headlines and CTAs — while supporting
								text rests in a softer gray.
							</z-text>
							<z-text size="md" color="muted">
								Muted supporting copy for secondary detail and captions.
							</z-text>
							<z-box isFlex isRow gap="3" doesWrap>
								<z-text color="primary" weight="lg">
									Purple accent
								</z-text>
								<z-text color="secondary" weight="lg">
									Pink accent
								</z-text>
								<z-text isItalic>Italic</z-text>
								<z-text isUnderlined>Underlined</z-text>
								<z-text isStrikethrough color="muted">
									Strikethrough
								</z-text>
							</z-box>
						</z-box>
					</div>
				</z-box>

				<z-box isColumn className="block">
					<div className="block-title">
						<h3>&lt;z-card&gt;</h3>
						<span className="desc">borders only — no shadows, ever</span>
					</div>
					<div className="panel-grid">
						<z-card doesLightUpOnHover isFlex isColumn gap="3">
							<z-box isFlex isRow yCenter marginBottom="1rem" xBetween>
								<z-text color="primary" weight="700" size="sm">
									Active
								</z-text>
								<z-text color="muted" size="xs">
									2 min ago
								</z-text>
							</z-box>
							<z-heading size="xs" tag="h3">
								Project Alpha
							</z-heading>
							<z-text size="sm" color="muted">
								Breaking conventions since day one. No rules, just results.
							</z-text>
							<z-box isFlex isRow yCenter gap="2" marginTop="1.5rem">
								<span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '999px', background: 'var(--pink)' }} />
								<z-text size="sm" color="muted">
									@creator
								</z-text>
							</z-box>
						</z-card>
						<z-card doesLightUpOnHover isFlex isColumn gap="3">
							<z-box isFlex isRow yCenter xBetween marginBottom="1rem">
								<z-text color="secondary" weight="lg" size="sm">
									Draft
								</z-text>
								<z-text color="muted" size="xs">
									Yesterday
								</z-text>
							</z-box>
							<z-heading size="xs" tag="h3">
								Campaign Beta
							</z-heading>
							<z-text size="sm" color="muted">
								Still cooking. The best things take time to burn bright.
							</z-text>
							<z-box isFlex isRow yCenter gap="2" marginTop="1.5rem">
								<span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '999px', background: 'var(--purple)' }} />
								<z-text size="sm" color="muted">
									@team
								</z-text>
							</z-box>
						</z-card>
					</div>
				</z-box>

				<z-box isColumn className="block">
					<div className="block-title">
						<h3>&lt;z-separator&gt; · &lt;z-line&gt;</h3>
						<span className="desc">hairline dividers, with or without a label</span>
					</div>
					<div className="panel">
						<z-text size="sm">Section one</z-text>
						<z-separator label="Or continue with" style={{ margin: '1.5rem 0' }} />
						<z-box isFlex isRow gap="3" yCenter>
							<z-text size="sm">Section two</z-text>
							<z-text size="sm" color="muted">
								Inline
							</z-text>
							<z-line isVertical style={{ height: '1.25rem' }} />
							<z-text size="sm" color="muted">
								vertical
							</z-text>
							<z-line isVertical style={{ height: '1.25rem' }} />
							<z-text size="sm" color="muted">
								dividers
							</z-text>
						</z-box>
						<z-line style={{ margin: '1.5rem 0' }} />
						<z-text size="sm">Section three</z-text>
					</div>
				</z-box>
			</section>

			{/* ── ACTIONS ── */}
			<section className="section" id="actions">
				<div className="section-head">
					<span className="dot pink" />
					<h2>Buttons &amp; Actions</h2>
				</div>
				<p className="section-sub">Solid for the one thing that matters. Outline and ghost for everything else.</p>

				<z-box isColumn className="block">
					<div className="panel-grid">
						<div className="panel">
							<div className="micro">Primary actions</div>
							<div className="row">
								<z-button tone="neutral" kind="solid">
									Get Started
								</z-button>
								<z-button tone="primary" kind="solid">
									Let's Go
								</z-button>
								<z-button tone="secondary" kind="solid">
									Go Off
								</z-button>
							</div>
						</div>
						<div className="panel">
							<div className="micro">Secondary actions</div>
							<div className="row">
								<z-button kind="outline" tone="neutral">
									Learn More
								</z-button>
								<z-button kind="outline" tone="primary">
									Explore
								</z-button>
								<z-link tone="secondary" style={{ marginLeft: '0.5rem' }}>
									Skip →
								</z-link>
							</div>
						</div>
					</div>
				</z-box>

				<z-box isColumn className="block">
					<div className="block-title">
						<h3>&lt;z-button&gt;</h3>
						<span className="desc">5 kinds × 6 tones × 3 sizes</span>
					</div>
					<div className="panel">
						<div className="micro">Kinds — neutral tone</div>
						<div className="row">
							<z-button kind="solid">Solid</z-button>
							<z-button kind="soft">Soft</z-button>
							<z-button kind="outline">Outline</z-button>
							<z-button kind="ghost">Ghost</z-button>
							<z-button kind="plain">Plain</z-button>
						</div>
						<div className="micro" style={{ marginTop: '2rem' }}>
							Kinds — purple tone
						</div>
						<div className="row">
							<z-button tone="primary" kind="solid">
								Solid
							</z-button>
							<z-button tone="primary" kind="soft">
								Soft
							</z-button>
							<z-button tone="primary" kind="outline">
								Outline
							</z-button>
							<z-button tone="primary" kind="ghost">
								Ghost
							</z-button>
							<z-button tone="primary" kind="plain">
								Plain
							</z-button>
						</div>
						<div className="micro" style={{ marginTop: '2rem' }}>
							Kinds — pink tone
						</div>
						<div className="row">
							<z-button tone="secondary" kind="solid">
								Solid
							</z-button>
							<z-button tone="secondary" kind="soft">
								Soft
							</z-button>
							<z-button tone="secondary" kind="outline">
								Outline
							</z-button>
							<z-button tone="secondary" kind="ghost">
								Ghost
							</z-button>
							<z-button tone="secondary" kind="plain">
								Plain
							</z-button>
						</div>

						<div className="micro" style={{ marginTop: '2rem' }}>
							Sizes &amp; states
						</div>
						<div className="row">
							<z-button size="small">Small</z-button>
							<z-button size="medium">Medium</z-button>
							<z-button size="large">Large</z-button>
						</div>
						<div className="row" style={{ marginTop: '1.5rem' }}>
							<z-button isLoading>Loading</z-button>
							<z-button isDisabled>Disabled</z-button>
						</div>
					</div>
				</z-box>

				<z-box isColumn className="block">
					<div className="block-title">
						<h3>&lt;z-button-group&gt;</h3>
						<span className="desc">seamless segmented actions</span>
					</div>
					<div className="panel">
						<div className="row">
							<z-button-group>
								<z-button kind="outline">Left</z-button>
								<z-button kind="outline">Mid</z-button>
								<z-button kind="outline">Right</z-button>
							</z-button-group>
							<z-button-group isVertical style={{ marginLeft: '2rem' }}>
								<z-button kind="outline">Top</z-button>
								<z-button kind="outline">Mid</z-button>
								<z-button kind="outline">Bottom</z-button>
							</z-button-group>
						</div>
					</div>
				</z-box>

				<z-box isColumn className="block">
					<div className="block-title">
						<h3>&lt;z-toggle&gt; · &lt;z-toggle-group&gt;</h3>
						<span className="desc">pressable state, single or multiple</span>
					</div>
					<div className="panel">
						<div className="micro">Standalone toggles</div>
						<div className="row">
							<z-toggle>Default</z-toggle>
							<z-toggle tone="primary">Primary</z-toggle>
							<z-toggle tone="secondary">Secondary</z-toggle>
							<z-toggle kind="ghost">Ghost</z-toggle>
							<z-toggle isDisabled>Disabled</z-toggle>
						</div>
						<div className="micro" style={{ marginTop: '2rem' }}>
							Group — single select
						</div>
						<div className="row">
							<z-toggle-group type="single" isOutlined isPurple>
								<z-toggle-group-item value="left">Left</z-toggle-group-item>
								<z-toggle-group-item value="center" isPressed>
									Center
								</z-toggle-group-item>
								<z-toggle-group-item value="right">Right</z-toggle-group-item>
							</z-toggle-group>
						</div>
						<div className="micro" style={{ marginTop: '2rem' }}>
							Group — multiple select
						</div>
						<div className="row">
							<z-toggle-group type="multiple" isOutlined>
								<z-toggle-group-item value="bold" isPressed>
									Bold
								</z-toggle-group-item>
								<z-toggle-group-item value="italic">Italic</z-toggle-group-item>
								<z-toggle-group-item value="underline">Underline</z-toggle-group-item>
							</z-toggle-group>
						</div>
					</div>
				</z-box>

				<z-box isColumn className="block">
					<div className="block-title">
						<h3>&lt;z-link&gt;</h3>
						<span className="desc">animated underline, accent tones</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '2rem' }}>
							<z-link href="#" tone="primary">
								Purple link
							</z-link>
							<z-link href="#" tone="secondary">
								Pink link
							</z-link>
							<z-link href="#" tone="neutral">
								Neutral link
							</z-link>
							<z-link href="#" tone="primary" underline="always">
								Always underlined
							</z-link>
							<z-link href="#" tone="primary" isExternal>
								External ↗
							</z-link>
							<z-link tone="primary" isDisabled>
								Disabled
							</z-link>
						</div>
					</div>
				</z-box>
			</section>

			{/* ── FORMS ── */}
			<section className="section" id="forms">
				<div className="section-head">
					<span className="dot purple" />
					<h2>Form Controls</h2>
				</div>
				<p className="section-sub">
					Transparent fills, hairline borders that lift to the accent on focus. Red is reserved for errors only.
				</p>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-input&gt; · &lt;z-textarea&gt;</h3>
						<span className="desc">text fields with focus accent</span>
					</div>
					<div className="panel-grid">
						<div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
							<div className="field">
								<label>Email</label>
								<z-input type="email" placeholder="you@example.com" />
							</div>
							<div className="field">
								<label>Message</label>
								<z-textarea placeholder="Say something bold…" rows={3} />
							</div>
							<div className="field">
								<label>Invalid state</label>
								<z-input isInvalid value="not-an-email" />
							</div>
						</div>
						<div className="panel">
							<div className="micro">Input states</div>
							<ul className="state-list">
								<li>
									<span className="sd" style={{ background: 'var(--muted-foreground)' }} /> Default
								</li>
								<li>
									<span className="sd" style={{ background: 'var(--primary)' }} /> Focused / Active (neutral)
								</li>
								<li>
									<span className="sd" style={{ background: 'var(--purple)' }} /> Purple tone
								</li>
								<li>
									<span className="sd" style={{ background: 'var(--pink)' }} /> Pink tone
								</li>
								<li>
									<span className="sd" style={{ background: 'var(--destructive)' }} /> Error
								</li>
							</ul>
							<div className="field" style={{ marginTop: '1.5rem' }}>
								<z-input tone="primary" placeholder="Purple focus tone" />
							</div>
							<div className="field" style={{ marginTop: '1rem' }}>
								<z-input tone="secondary" placeholder="Pink focus tone" />
							</div>
							<div className="field" style={{ marginTop: '1rem' }}>
								<z-input isDisabled value="Disabled field" />
							</div>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>checkbox · radio · switch</h3>
						<span className="desc">selection controls</span>
					</div>
					<div className="panel">
						<div className="panel-grid" style={{ border: 0, padding: 0 }}>
							<div className="col">
								<div className="micro" style={{ margin: 0 }}>
									Checkbox
								</div>
								<z-checkbox isChecked>Accept terms</z-checkbox>
								<z-checkbox>Subscribe to updates</z-checkbox>
								<z-checkbox isIndeterminate>Partial selection</z-checkbox>
								<z-checkbox tone="secondary" isChecked>
									Pink tone
								</z-checkbox>
								<z-checkbox isDisabled>Disabled</z-checkbox>
							</div>
							<div className="col">
								<div className="micro" style={{ margin: 0 }}>
									Radio group
								</div>
								<z-radio-group value="monthly" label="Billing">
									<z-radio value="monthly">Monthly</z-radio>
									<z-radio value="yearly">Yearly</z-radio>
									<z-radio value="lifetime" isDisabled>
										Lifetime (soon)
									</z-radio>
								</z-radio-group>
								<div className="micro" style={{ margin: '1rem 0 0' }}>
									Switch
								</div>
								<z-switch isChecked>Notifications</z-switch>
								<z-switch tone="secondary">Pink switch</z-switch>
								<z-switch isDisabled>Disabled</z-switch>
							</div>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-slider&gt;</h3>
						<span className="desc">accent-filled range</span>
					</div>
					<div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '480px' }}>
						<z-slider value={60} />
						<z-slider label="Opacity" value={80} showValue valueSuffix="%" />
						<z-slider label="Budget" min={0} max={5000} value={2500} tone="secondary" showValue valuePrefix="$" />
						<z-slider value={50} isDisabled />
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-range&gt;</h3>
						<span className="desc">single bar, two handles — bounds clamp travel, handles never cross</span>
					</div>
					<div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '480px' }}>
						<div className="field">
							<label>Unbounded — bounds inherit the domain, plain two-tone track</label>
							<z-range min={20} max={90}>
								<z-range-handle value={30} />
								<z-range-handle value={85} tone="secondary" />
							</z-range>
						</div>
						<div className="field">
							<label>Bounded handles — off-limits ends are painted</label>
							<z-range min={25} max={75}>
								<z-range-handle min={30} max={60} value={50} />
								<z-range-handle min={40} max={70} value={60} tone="secondary" />
							</z-range>
						</div>
						<z-range min={0} max={1000} label="Price range" showValue valuePrefix="$">
							<z-range-handle value={200} />
							<z-range-handle value={750} tone="secondary" />
						</z-range>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-select&gt; · &lt;z-combobox&gt;</h3>
						<span className="desc">dropdown &amp; type-ahead</span>
					</div>
					<div className="panel-grid">
						<div className="field">
							<label>Select</label>
							<z-select placeholder="Pick a vibe" ref={withProps({ options: SELECT_OPTIONS })} />
						</div>
						<div className="field">
							<label>Combobox</label>
							<z-combobox placeholder="Search frameworks…" ref={withProps({ options: COMBOBOX_OPTIONS })} />
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-color-picker&gt; · &lt;z-input-otp&gt;</h3>
						<span className="desc">specialized inputs</span>
					</div>
					<div className="panel-grid">
						<div className="field">
							<label>Brand color</label>
							<z-color-picker value="#BF40BF" />
						</div>
						<div className="field">
							<label>Verification code</label>
							<z-input-otp length={6} isNumeric />
						</div>
					</div>
				</div>
			</section>

			{/* ── DATA DISPLAY ── */}
			<section className="section" id="data">
				<div className="section-head">
					<span className="dot pink" />
					<h2>Data Display</h2>
				</div>
				<p className="section-sub">
					Read-only surfaces — badges, identities, tables, and progress. Status reads through color, never noise.
				</p>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-badge&gt;</h3>
						<span className="desc">pills &amp; inline status</span>
					</div>
					<div className="panel">
						<div className="micro">Soft tints</div>
						<div className="row">
							<z-badge tone="primary">Active</z-badge>
							<z-badge tone="secondary">Featured</z-badge>
							<z-badge tone="primary">New</z-badge>
							<z-badge kind="outline">Default</z-badge>
						</div>
						<div className="micro" style={{ marginTop: '2rem' }}>
							Solid &amp; outline
						</div>
						<div className="row">
							<z-badge kind="solid" tone="primary">
								Solid
							</z-badge>
							<z-badge kind="solid" tone="secondary">
								Solid
							</z-badge>
						</div>
						<div className="micro" style={{ marginTop: '2rem' }}>
							Inline status
						</div>
						<div className="row" style={{ gap: '1.5rem' }}>
							<z-badge isDot tone="primary">
								Online
							</z-badge>
							<z-badge isDot tone="secondary">
								Limited
							</z-badge>
							<z-badge isDot tone="neutral">
								Premium
							</z-badge>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-badge&gt; — interactive</h3>
						<span className="desc">selectable &amp; removable tags</span>
					</div>
					<div className="panel">
						<div className="row">
							<z-badge kind="outline">Design</z-badge>
							<z-badge isSelectable isSelected>
								Selected
							</z-badge>
							<z-badge isSelectable>Selectable</z-badge>
							<z-badge kind="outline" isRemovable>
								Removable
							</z-badge>
							<z-badge tone="secondary" isSelectable isSelected>
								Pink
							</z-badge>
							<z-badge isSelectable isDisabled>
								Disabled
							</z-badge>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-avatar&gt;</h3>
						<span className="desc">image with initials fallback</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '1.25rem' }}>
							<z-avatar name="Ada Lovelace" size="xs" />
							<z-avatar name="Grace Hopper" size="small" />
							<z-avatar name="Alan Turing" status="online" />
							<z-avatar name="Katherine Johnson" tone="secondary" size="large" status="busy" />
							<z-avatar name="Linus" size="xl" isSquare status="away" />
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-progress&gt; · &lt;z-skeleton&gt;</h3>
						<span className="desc">loading &amp; completion</span>
					</div>
					<div className="panel-grid">
						<div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
							<div className="micro" style={{ margin: 0 }}>
								Progress
							</div>
							<z-progress value={72} />
							<z-progress value={45} tone="secondary" />
							<z-progress value={90} tone="neutral" size="small" />
							<z-progress isIndeterminate />
						</div>
						<div className="panel">
							<div className="micro">Skeleton</div>
							<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
								<z-skeleton shape="circle" width="3rem" isInline />
								<div style={{ flex: 1 }}>
									<z-skeleton lines={3} />
								</div>
							</div>
							<z-skeleton shape="rect" height="5rem" style={{ marginTop: '1.25rem' }} />
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-table&gt;</h3>
						<span className="desc">data-driven, hairline rows</span>
					</div>
					<z-table isClickable ref={withProps({ columns: TABLE_COLUMNS, rows: TABLE_ROWS })} />
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-pagination&gt;</h3>
						<span className="desc">windowed page nav</span>
					</div>
					<div className="panel">
						<div className="col" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
							<z-pagination page={1} total={5} />
							<z-pagination page={6} total={12} tone="secondary" />
						</div>
					</div>
				</div>
			</section>

			{/* ── NAVIGATION & DISCLOSURE ── */}
			<section className="section" id="navigation">
				<div className="section-head">
					<span className="dot purple" />
					<h2>Navigation &amp; Disclosure</h2>
				</div>
				<p className="section-sub">
					Wayfinding and progressive reveal — trails, tabs, menus, and collapsibles. Borders draw the structure; the accent
					marks where you are.
				</p>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-breadcrumbs&gt;</h3>
						<span className="desc">trail with collapse</span>
					</div>
					<div className="panel">
						<div className="col" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
							<z-breadcrumbs ref={withProps({ items: BREADCRUMBS })} />
							<z-breadcrumbs max={3} tone="secondary" ref={withProps({ items: BREADCRUMBS_COLLAPSED })} />
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-tabs&gt;</h3>
						<span className="desc">panels via named slots</span>
					</div>
					<div className="panel">
						<z-tabs value="overview" ref={withProps({ tabs: TABS })}>
							<div slot="overview">
								<z-text size="sm" color="muted">
									Overview — the calm landing surface. Tabs swap the active panel without a layout shift.
								</z-text>
							</div>
							<div slot="activity">
								<z-text size="sm" color="muted">
									Activity — recent events would stream in here.
								</z-text>
							</div>
							<div slot="settings">
								<z-text size="sm" color="muted">
									Settings — configuration lives behind this tab.
								</z-text>
							</div>
						</z-tabs>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-collapsible&gt; · &lt;z-accordion&gt;</h3>
						<span className="desc">single &amp; coordinated disclosure</span>
					</div>
					<div className="panel-grid">
						<div className="panel">
							<div className="micro">Standalone collapsible</div>
							<z-collapsible label="What is zest?" isOpen>
								A dark-only, border-first component language. No shadows, OKLCH color, DM Sans throughout.
							</z-collapsible>
							<z-collapsible label="Is it accessible?">
								Focus rings, ARIA roles, and full keyboard support ship on every interactive component.
							</z-collapsible>
						</div>
						<div className="panel">
							<div className="micro">Accordion — single open</div>
							<z-accordion type="single">
								<z-collapsible value="ship" label="Shipping" isOpen>
									Orders leave the warehouse within two business days.
								</z-collapsible>
								<z-collapsible value="returns" label="Returns">
									{' '}
									Thirty-day window, no questions asked.{' '}
								</z-collapsible>
								<z-collapsible value="warranty" label="Warranty">
									One year of coverage against manufacturing defects.
								</z-collapsible>
							</z-accordion>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-menu&gt; · &lt;z-nav-menu&gt;</h3>
						<span className="desc">dropdown actions &amp; top nav</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '2rem', alignItems: 'flex-start' }}>
							<z-menu ref={withProps({ items: MENU_ITEMS })}>
								<z-button slot="trigger" kind="outline">
									Actions ▾
								</z-button>
							</z-menu>
							<z-nav-menu value="products" ref={withProps({ items: NAV_MENU_ITEMS })} />
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-sidebar&gt;</h3>
						<span className="desc">grouped vertical rail</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '1.5rem', alignItems: 'stretch', height: '22rem' }}>
							<z-sidebar
								value="dashboard"
								style={{ '--z-sidebar-width': '15rem' } as React.CSSProperties}
								ref={withProps({ items: SIDEBAR_ITEMS })}
							>
								<div slot="header">
									<z-text weight="lg">Acme Inc.</z-text>
								</div>
								<div slot="footer">
									<z-text size="xs" color="muted">
										v0.1.0 · WIP
									</z-text>
								</div>
							</z-sidebar>
							<z-sidebar value="dashboard" tone="secondary" isCollapsed ref={withProps({ items: SIDEBAR_COLLAPSED })} />
						</div>
					</div>
				</div>
			</section>

			{/* ── OVERLAYS ── */}
			<section className="section" id="overlays">
				<div className="section-head">
					<span className="dot pink" />
					<h2>Overlays</h2>
				</div>
				<p className="section-sub">
					Floating surfaces that escape the layout — tooltips, popovers, and modals. All share one anchoring core: top layer
					via the platform, JS positioning that flips near edges, borders over shadows.
				</p>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-tooltip&gt;</h3>
						<span className="desc">hover / focus label</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '1.5rem' }}>
							<z-tooltip content="Saves your changes" placement="top">
								<z-button kind="outline">Top</z-button>
							</z-tooltip>
							<z-tooltip content="Shown to the right" placement="right">
								<z-button kind="outline">Right</z-button>
							</z-tooltip>
							<z-tooltip content="Drops below the trigger" placement="bottom" tone="primary">
								<z-button kind="outline" tone="primary">
									Bottom
								</z-button>
							</z-tooltip>
							<z-tooltip content="Anchored to the left" placement="left" tone="secondary">
								<z-button kind="outline" tone="secondary">
									Left
								</z-button>
							</z-tooltip>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-popover&gt; · &lt;z-hover-card&gt;</h3>
						<span className="desc">click panel &amp; hover preview</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '1.5rem' }}>
							<z-popover placement="bottom-start" tone="primary">
								<z-button slot="trigger" kind="outline" tone="primary">
									Open popover
								</z-button>
								<z-box isFlex isColumn gap="2">
									<z-heading size="xs" tag="h3">
										Dimensions
									</z-heading>
									<z-text size="sm" color="muted">
										Click outside or press Esc to dismiss. The panel flips when it nears a viewport edge.
									</z-text>
								</z-box>
							</z-popover>

							<z-hover-card placement="bottom">
								<z-link slot="trigger">@ada</z-link>
								<z-box isFlex isRow gap="3" yCenter>
									<z-avatar name="Ada Lovelace" size="large" />
									<z-box isFlex isColumn gap="1">
										<z-text weight="lg">Ada Lovelace</z-text>
										<z-text size="sm" color="muted">
											First programmer. Hovers welcome.
										</z-text>
									</z-box>
								</z-box>
							</z-hover-card>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-dialog&gt;</h3>
						<span className="desc">native modal — focus-trapped</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '1.5rem' }}>
							<z-dialog
								heading="Edit profile"
								description="Make changes to your profile here. Click save when you're done."
							>
								<z-button slot="trigger" kind="solid">
									Open dialog
								</z-button>
								<z-box isFlex isColumn gap="3" style={{ marginTop: '0.5rem' }}>
									<div className="field">
										<label>Display name</label>
										<z-input value="Ada Lovelace" />
									</div>
								</z-box>
								<z-button slot="footer" kind="solid">
									Save changes
								</z-button>
							</z-dialog>

							<z-dialog size="large" heading="Large dialog" description="The same modal at a wider size.">
								<z-button slot="trigger" kind="outline">
									Large
								</z-button>
								<z-text size="sm" color="muted">
									{' '}
									Esc, the close button, and a backdrop click all dismiss this one.{' '}
								</z-text>
							</z-dialog>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-alert-dialog&gt;</h3>
						<span className="desc">explicit confirm / cancel</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '1.5rem' }}>
							<z-alert-dialog
								tone="danger"
								heading="Delete project?"
								description="This permanently removes the project and all of its data. This action cannot be undone."
								confirmLabel="Delete"
							>
								<z-button slot="trigger" kind="outline" tone="danger">
									Delete…
								</z-button>
							</z-alert-dialog>

							<z-alert-dialog
								heading="Publish now?"
								description="Your changes will go live immediately for everyone."
								confirmLabel="Publish"
							>
								<z-button slot="trigger" kind="outline" tone="primary">
									Publish…
								</z-button>
							</z-alert-dialog>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-alert&gt;</h3>
						<span className="desc">inline status banner</span>
					</div>
					<div className="panel">
						<div className="col" style={{ gap: '1rem', alignItems: 'stretch' }}>
							<z-alert tone="info" heading="Heads up">
								A new version is available — refresh when convenient.
							</z-alert>
							<z-alert tone="success" heading="Saved">
								Your changes have been published.
							</z-alert>
							<z-alert tone="warning" heading="Approaching limit">
								You've used 90% of your monthly quota.
							</z-alert>
							<z-alert tone="danger" heading="Payment failed" isDismissable>
								We couldn't process your card. Update your billing details.
							</z-alert>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-sheet&gt; · &lt;z-drawer&gt;</h3>
						<span className="desc">edge panel &amp; bottom drawer</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '1.5rem' }}>
							<z-sheet side="right" heading="Filters" description="Narrow the results below.">
								<z-button slot="trigger" kind="outline">
									Right sheet
								</z-button>
								<z-box isFlex isColumn gap="3" style={{ marginTop: '0.5rem' }}>
									<z-checkbox isChecked>In stock</z-checkbox>
									<z-checkbox>On sale</z-checkbox>
									<z-checkbox>Free shipping</z-checkbox>
								</z-box>
								<z-button slot="footer" kind="solid" tone="primary">
									Apply
								</z-button>
							</z-sheet>

							<z-sheet side="left" heading="Navigation">
								<z-button slot="trigger" kind="outline">
									Left sheet
								</z-button>
								<z-text size="sm" color="muted">
									A left-anchored panel — good for navigation.
								</z-text>
							</z-sheet>

							<z-drawer heading="Quick actions" description="Drag the handle down to dismiss.">
								<z-button slot="trigger" kind="outline">
									Open drawer
								</z-button>
								<z-box isFlex isColumn gap="2" style={{ marginTop: '0.5rem' }}>
									<z-text size="sm" color="muted">
										A bottom drawer with a grab handle and drag-to-close.
									</z-text>
								</z-box>
								<z-button slot="footer" kind="solid">
									Confirm
								</z-button>
							</z-drawer>
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-context-menu&gt;</h3>
						<span className="desc">right-click target</span>
					</div>
					<div className="panel">
						<z-context-menu ref={withProps({ items: CONTEXT_MENU_ITEMS })}>
							<div
								style={{
									display: 'grid',
									placeItems: 'center',
									height: '8rem',
									border: '1px dashed var(--border)',
									borderRadius: 'var(--radius-md)',
									color: 'var(--muted-foreground)',
									fontSize: '0.875rem'
								}}
							>
								Right-click anywhere in this area
							</div>
						</z-context-menu>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-command&gt;</h3>
						<span className="desc">command palette</span>
					</div>
					<div className="panel">
						<z-command
							placeholder="Type a command or search…"
							ref={(el: HTMLElement | null) => {
								commandRef.current = el as never
								if (el) Object.assign(el, { items: COMMAND_ITEMS })
							}}
						>
							<z-button slot="trigger" kind="outline">
								Open command palette
							</z-button>
						</z-command>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-toast&gt;</h3>
						<span className="desc">transient notifications</span>
					</div>
					<div className="panel">
						<div className="row" style={{ gap: '1.5rem' }}>
							<z-button
								kind="outline"
								onClick={() =>
									fireToast({ tone: 'success', title: 'Changes saved', description: 'Your project is up to date.' })
								}
							>
								Success toast
							</z-button>
							<z-button
								kind="outline"
								onClick={() => fireToast({ tone: 'info', title: 'New message', description: 'Ada sent you a comment.' })}
							>
								Info toast
							</z-button>
							<z-button
								kind="outline"
								tone="danger"
								onClick={() =>
									fireToast({
										tone: 'danger',
										title: 'Upload failed',
										description: 'The file was too large.',
										duration: 6000
									})
								}
							>
								Danger toast
							</z-button>
						</div>
					</div>
				</div>
			</section>

			{/* ── SPECIALIZED ── */}
			<section className="section" id="specialized">
				<div className="section-head">
					<span className="dot purple" />
					<h2>Specialized</h2>
				</div>
				<p className="section-sub">
					Purpose-built surfaces — code, charts, carousels, scroll regions, and the empty state. Dependency-free, same
					border-first language.
				</p>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-chart&gt;</h3>
						<span className="desc">bar · line · area, single series</span>
					</div>
					<div className="panel-grid">
						<div className="panel">
							<div className="micro">Bar — with grid</div>
							<z-chart type="bar" showGrid ref={withProps({ data: CHART_BAR })} />
						</div>
						<div className="panel">
							<div className="micro">Area — pink tone</div>
							<z-chart type="area" tone="secondary" ref={withProps({ data: CHART_AREA })} />
						</div>
					</div>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-code-block&gt;</h3>
						<span className="desc">copy button &amp; line numbers</span>
					</div>
					<z-code-block filename="overlay.tsx" language="tsx" isLineNumbers ref={withProps({ code: DEMO_CODE })} />
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-carousel&gt;</h3>
						<span className="desc">slides, dots &amp; autoplay</span>
					</div>
					<z-carousel loop autoplay={5000}>
						<z-card
							isFlex
							isColumn
							gap="2"
							style={{
								height: '12rem',
								justifyContent: 'center',
								alignItems: 'center',
								border: 0,
								background: 'color-mix(in oklch, var(--purple) 14%, transparent)'
							}}
						>
							<z-heading size="xs" tag="h3">
								Ship inward
							</z-heading>
							<z-text size="sm" color="muted">
								Slide one
							</z-text>
						</z-card>
						<z-card
							isFlex
							isColumn
							gap="2"
							style={{
								height: '12rem',
								justifyContent: 'center',
								alignItems: 'center',
								border: 0,
								background: 'color-mix(in oklch, var(--pink) 14%, transparent)'
							}}
						>
							<z-heading size="xs" tag="h3">
								Name it well
							</z-heading>
							<z-text size="sm" color="muted">
								Slide two
							</z-text>
						</z-card>
						<z-card
							isFlex
							isColumn
							gap="2"
							style={{
								height: '12rem',
								justifyContent: 'center',
								alignItems: 'center',
								border: 0,
								background: 'color-mix(in oklch, var(--foreground) 8%, transparent)'
							}}
						>
							<z-heading size="xs" tag="h3">
								Document it
							</z-heading>
							<z-text size="sm" color="muted">
								Slide three
							</z-text>
						</z-card>
					</z-carousel>
				</div>

				<div className="block">
					<div className="block-title">
						<h3>&lt;z-scroll-area&gt; · &lt;z-empty-state&gt;</h3>
						<span className="desc">themed scroll &amp; the blank slate</span>
					</div>
					<div className="panel-grid">
						<div className="panel">
							<div className="micro">Scroll area — max-height</div>
							<z-scroll-area maxHeight="11rem" orientation="vertical">
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.75rem' }}>
									<z-text size="sm">Internal platforms accrete usage the way products do.</z-text>
									<z-text size="sm" color="muted">
										Scroll to see the themed scrollbar.
									</z-text>
									<z-text size="sm">A brand is a compression algorithm for trust.</z-text>
									<z-text size="sm" color="muted">
										Documentation is the product surface.
									</z-text>
									<z-text size="sm">Treat engineers as users.</z-text>
									<z-text size="sm" color="muted">
										Measure adoption like a funnel.
									</z-text>
									<z-text size="sm">Name the thing or you haven't scoped it.</z-text>
									<z-text size="sm" color="muted">
										The default beats the mandate.
									</z-text>
								</div>
							</z-scroll-area>
						</div>
						<div className="panel">
							<z-empty-state heading="No projects yet" description="Create your first project to see it here." isBordered>
								<svg
									slot="icon"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
								</svg>
								<z-button kind="solid" tone="primary" size="small">
									New project
								</z-button>
							</z-empty-state>
						</div>
					</div>
				</div>
			</section>

			<footer className="docs-footer">
				<span>zest · dark only · borders over shadows</span>
				<span>
					<DocsLink href="/layout">Layout</DocsLink> · <DocsLink href="/typography">Typography</DocsLink> ·{' '}
					<DocsLink href="~/">Home</DocsLink>
				</span>
			</footer>

			<z-toast position="bottom-end" ref={toasterRef as never} />
		</div>
	)
}

/* ── demo data (was set imperatively in the old page's inline script) ── */

const SELECT_OPTIONS = [
	{ value: 'bold', label: 'Bold' },
	{ value: 'calm', label: 'Calm' },
	{ value: 'electric', label: 'Electric' },
	{ value: 'minimal', label: 'Minimal', isDisabled: true }
]

const COMBOBOX_OPTIONS = [
	{ value: 'react', label: 'React' },
	{ value: 'vue', label: 'Vue' },
	{ value: 'svelte', label: 'Svelte' },
	{ value: 'solid', label: 'Solid' },
	{ value: 'atomico', label: 'Atomico' },
	{ value: 'lit', label: 'Lit' }
]

const TABLE_COLUMNS = [
	{ key: 'project', label: 'Project' },
	{ key: 'owner', label: 'Owner' },
	{ key: 'status', label: 'Status' },
	{ key: 'updated', label: 'Updated', align: 'end', isMono: true }
]
const TABLE_ROWS = [
	{ id: 1, project: 'Project Alpha', owner: '@creator', status: 'Active', updated: '2 min' },
	{ id: 2, project: 'Campaign Beta', owner: '@team', status: 'Draft', updated: '1 day' },
	{ id: 3, project: 'Legacy Drop', owner: '@archive', status: 'Archived', updated: '1 wk' }
]

const BREADCRUMBS = [
	{ label: 'Home', href: '#' },
	{ label: 'Components', href: '#' },
	{ label: 'Navigation', href: '#' },
	{ label: 'Breadcrumbs', isCurrent: true }
]
const BREADCRUMBS_COLLAPSED = [
	{ label: 'Home', href: '#' },
	{ label: 'Workspace', href: '#' },
	{ label: 'Projects', href: '#' },
	{ label: 'Alpha', href: '#' },
	{ label: 'Settings', isCurrent: true }
]

const TABS = [
	{ value: 'overview', label: 'Overview' },
	{ value: 'activity', label: 'Activity' },
	{ value: 'settings', label: 'Settings' },
	{ value: 'billing', label: 'Billing', isDisabled: true }
]

const MENU_ITEMS = [
	{ value: 'rename', label: 'Rename', shortcut: '⌘R' },
	{ value: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
	{ value: 'share', label: 'Share…' },
	{ isSeparator: true },
	{ value: 'delete', label: 'Delete', shortcut: '⌫', isDanger: true }
]

const NAV_MENU_ITEMS = [
	{ value: 'home', label: 'Home', href: '#' },
	{
		value: 'products',
		label: 'Products',
		children: [
			{ value: 'analytics', label: 'Analytics', description: 'Track everything that moves' },
			{ value: 'automation', label: 'Automation', description: 'Set it and forget it' },
			{ value: 'reports', label: 'Reports', description: 'Numbers, framed' }
		]
	},
	{ value: 'pricing', label: 'Pricing', href: '#' },
	{ value: 'docs', label: 'Docs', href: '#' }
]

const SIDEBAR_ITEMS = [
	{
		label: 'Main',
		items: [
			{ value: 'dashboard', label: 'Dashboard' },
			{ value: 'projects', label: 'Projects', badge: '4' },
			{ value: 'tasks', label: 'Tasks' }
		]
	},
	{
		label: 'Account',
		items: [
			{ value: 'team', label: 'Team' },
			{ value: 'settings', label: 'Settings' }
		]
	}
]
const SIDEBAR_COLLAPSED = [
	{ value: 'dashboard', label: 'Dashboard' },
	{ value: 'projects', label: 'Projects' },
	{ value: 'tasks', label: 'Tasks' },
	{ value: 'team', label: 'Team' },
	{ value: 'settings', label: 'Settings' }
]

const CONTEXT_MENU_ITEMS = [
	{ value: 'back', label: 'Back', shortcut: '⌘[' },
	{ value: 'forward', label: 'Forward', shortcut: '⌘]' },
	{ isSeparator: true },
	{ value: 'reload', label: 'Reload', shortcut: '⌘R' },
	{ value: 'save', label: 'Save as…', shortcut: '⌘S' },
	{ isSeparator: true },
	{ value: 'delete', label: 'Delete', isDanger: true }
]

const COMMAND_ITEMS = [
	{ group: 'Navigation', value: 'home', label: 'Go to Dashboard', shortcut: 'G D' },
	{ group: 'Navigation', value: 'projects', label: 'Go to Projects', shortcut: 'G P', keywords: 'work' },
	{ group: 'Navigation', value: 'settings', label: 'Go to Settings', shortcut: 'G S' },
	{ group: 'Actions', value: 'new', label: 'New Project', shortcut: '⌘N', keywords: 'create add' },
	{ group: 'Actions', value: 'invite', label: 'Invite teammate', keywords: 'member user' },
	{ group: 'Actions', value: 'theme', label: 'Toggle theme', isDisabled: true }
]

const CHART_BAR = [
	{ label: 'Mon', value: 42 },
	{ label: 'Tue', value: 58 },
	{ label: 'Wed', value: 35 },
	{ label: 'Thu', value: 71 },
	{ label: 'Fri', value: 64 },
	{ label: 'Sat', value: 28 },
	{ label: 'Sun', value: 49 }
]
const CHART_AREA = [
	{ label: 'W1', value: 12 },
	{ label: 'W2', value: 28 },
	{ label: 'W3', value: 22 },
	{ label: 'W4', value: 45 },
	{ label: 'W5', value: 38 },
	{ label: 'W6', value: 60 }
]

const DEMO_CODE = `const resolveToneClass = (props: any): string => {
	if (props.tone === 'primary') return 'is-primary'
	if (props.tone === 'secondary') return 'is-secondary'
	if (props.tone === 'success') return 'is-success'
	if (props.tone === 'warning') return 'is-warning'
	if (props.tone === 'danger') return 'is-danger'
	return 'is-neutral'
}

const resolveKindClass = (props: any): string => {
	if (props.kind === 'solid') return 'is-solid'
	if (props.kind === 'outline') return 'is-outline'
	return 'is-soft'
}`
