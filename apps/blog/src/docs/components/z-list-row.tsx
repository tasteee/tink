import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZListRowDoc = () => (
	<ComponentDoc tag="z-list-row" category="Data Display" description="A flexible row for z-list. The second slotted child grows by default, keeping leading identity and trailing metadata or actions neatly aligned.">
		<DocExample title="Build a compact result row" description="Use the first child for an icon or avatar, the second for the primary content, and the last child for metadata or an action." code={`<z-list>
  <z-list-row is-clickable>
    <z-avatar name="Ada Lovelace" size="small" />
    <z-column gap="0"><strong>Ada Lovelace</strong><z-text size="sm" color="muted">Active now</z-text></z-column>
    <z-status-dot status="online" />
  </z-list-row>
</z-list>`}>
			<z-list style={{ width: 'min(100%, 30rem)' }}>
				<z-list-row isClickable>
					<z-avatar name="Ada Lovelace" size="small" />
					<z-column gap="0"><strong>Ada Lovelace</strong><z-text size="sm" color="muted">Active now</z-text></z-column>
					<z-status-dot status="online" />
				</z-list-row>
			</z-list>
		</DocExample>
		<DocExample title="Wrap secondary content" description="Give a child class is-wrap to place it on a new full-width line; is-grow opts additional content into the flexible column behavior." code={`<z-list-row>
  <z-avatar name="Release bot" />
  <strong>Version 0.3.0</strong>
  <z-text class="is-wrap" size="sm" color="muted">Published 10 minutes ago</z-text>
</z-list-row>`}>
			<z-list-row style={{ width: 'min(100%, 30rem)', border: '1px solid var(--border)' }}>
				<z-avatar name="Release bot" />
				<strong>Version 0.3.0</strong>
				<z-text class="is-wrap" size="sm" color="muted">Published 10 minutes ago</z-text>
			</z-list-row>
		</DocExample>
	</ComponentDoc>
)
