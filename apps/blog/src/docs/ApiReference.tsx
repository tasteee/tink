import type { ReactNode } from 'react'
import customElementsManifest from '../../../../packages/zest/custom-elements.json'
import apiNotes from '@app/docs/api-notes.json'

// One API section per component. The manifest says what exists (names, types,
// events), so the list can never drift from the shipped element. The notes file
// says what each item is for: description, values, default, min, max, example.
// Every property, event, and usage note renders as its own small block.

type ManifestAttributeT = { name?: string; fieldName?: string; type?: { text?: string }; default?: string }
type ManifestEventT = { name?: string; detail?: string }
type ManifestDeclarationT = { tagName?: string; attributes?: ManifestAttributeT[]; events?: ManifestEventT[] }

type PropNoteT = {
	description?: string
	type?: string
	values?: string[]
	default?: string
	min?: string
	max?: string
	example?: string
}

type EventNoteT = { description?: string; detail?: string; example?: string }
type GuidanceNoteT = { title: string; text: string }
type TagNotesT = { props?: Record<string, PropNoteT>; events?: Record<string, EventNoteT>; guidance?: GuidanceNoteT[] }

type MetaEntryT = { label: string; values: string[] }

type ApiItemPropsT = {
	name: string
	nameClassName?: string
	badge?: string
	alias?: string
	description?: string
	meta: MetaEntryT[]
	example?: string
	exampleLanguage?: string
}

const API_NOTES: Record<string, TagNotesT> = apiNotes
const EMPTY_NOTES: TagNotesT = {}

const readDeclarations = (): ManifestDeclarationT[] => {
	const modules = customElementsManifest.modules ?? []
	const declarations = modules.flatMap((module) => module.declarations ?? [])
	return declarations as ManifestDeclarationT[]
}

const DECLARATIONS = readDeclarations()

// Notes may wrap identifiers in backticks; render those as inline code.
const renderInlineCode = (text: string): ReactNode[] => {
	const segments = text.split('`')
	return segments.map((segment: string, index: number) => {
		const isCode = index % 2 === 1
		if (isCode) return <code key={index}>{segment}</code>
		return segment
	})
}

const buildPropMeta = (attribute: ManifestAttributeT, note: PropNoteT): MetaEntryT[] => {
	const meta: MetaEntryT[] = []
	const typeText = note.type ?? attribute.type?.text ?? 'unknown'
	meta.push({ label: 'Type', values: [typeText] })

	const hasValues = Boolean(note.values) && note.values?.length !== 0
	if (hasValues) meta.push({ label: 'Values', values: note.values ?? [] })

	const defaultText = note.default ?? attribute.default
	if (defaultText) meta.push({ label: 'Default', values: [defaultText] })

	if (note.min) meta.push({ label: 'Min', values: [note.min] })
	if (note.max) meta.push({ label: 'Max', values: [note.max] })
	return meta
}

const buildEventSignature = (detail: string): string => {
	return `(event: CustomEvent<${detail}>) => void`
}

const ApiMeta = (props: { meta: MetaEntryT[] }) => {
	return (
		<dl className="apiMeta">
			{props.meta.map((entry: MetaEntryT) => (
				<div className="apiMetaRow" key={entry.label}>
					<dt>{entry.label}</dt>
					<dd>
						{entry.values.map((value: string) => (
							<code key={value}>{value}</code>
						))}
					</dd>
				</div>
			))}
		</dl>
	)
}

const ApiItem = (props: ApiItemPropsT) => {
	const hasDescription = Boolean(props.description)
	const descriptionContent = hasDescription ? renderInlineCode(props.description ?? '') : 'No description yet.'
	const descriptionClassName = hasDescription ? 'apiDescription' : 'apiDescription isMissing'
	const language = props.exampleLanguage ?? 'html'

	return (
		<article className="apiItem">
			<header className="apiItemHead">
				<code className={props.nameClassName ?? 'apiName'}>{props.name}</code>
				{props.badge && <span className="apiBadge">{props.badge}</span>}
				{props.alias && <span className="apiAlias">{props.alias}</span>}
			</header>
			<div className="apiItemBody">
				<p className={descriptionClassName}>{descriptionContent}</p>
				{props.meta.length > 0 && <ApiMeta meta={props.meta} />}
				{props.example && <z-code-block language={language} code={props.example} />}
			</div>
		</article>
	)
}

const ApiGroup = (props: { title: string; count: number; children: ReactNode }) => {
	return (
		<div className="apiGroup">
			<h3 className="apiGroupTitle">
				{props.title} <span className="apiGroupCount">{props.count}</span>
			</h3>
			{props.children}
		</div>
	)
}

const PropItems = (props: { attributes: ManifestAttributeT[]; notes: Record<string, PropNoteT> }) => {
	return (
		<>
			{props.attributes.map((attribute: ManifestAttributeT) => {
				const attributeName = attribute.name ?? ''
				const note = props.notes[attributeName] ?? {}
				const propertyName = attribute.fieldName ?? attributeName
				const hasAlias = propertyName !== attributeName
				const alias = hasAlias ? `property: ${propertyName}` : undefined
				const meta = buildPropMeta(attribute, note)

				return (
					<ApiItem
						key={attributeName}
						name={attributeName}
						alias={alias}
						description={note.description}
						meta={meta}
						example={note.example}
					/>
				)
			})}
		</>
	)
}

const EventItems = (props: { events: ManifestEventT[]; notes: Record<string, EventNoteT> }) => {
	return (
		<>
			{props.events.map((manifestEvent: ManifestEventT) => {
				const eventName = manifestEvent.name ?? ''
				const note = props.notes[eventName] ?? {}
				const detail = note.detail ?? manifestEvent.detail ?? 'unknown'
				const hasDetail = detail !== 'void'
				const meta: MetaEntryT[] = [{ label: 'Signature', values: [buildEventSignature(detail)] }]
				if (hasDetail) meta.push({ label: 'Detail', values: [detail] })

				return (
					<ApiItem
						key={eventName}
						name={eventName}
						badge="event"
						description={note.description}
						meta={meta}
						example={note.example}
						exampleLanguage="ts"
					/>
				)
			})}
		</>
	)
}

const GuidanceItems = (props: { guidance: GuidanceNoteT[] }) => {
	return (
		<>
			{props.guidance.map((entry: GuidanceNoteT) => (
				<ApiItem
					key={entry.title}
					name={entry.title}
					nameClassName="apiName isText"
					badge="guidance"
					description={entry.text}
					meta={[]}
				/>
			))}
		</>
	)
}

// Events that the manifest does not know about (dispatched by hand rather than
// declared as an Atomico event prop) are documented in the notes file only.
const collectEvents = (declaration: ManifestDeclarationT, notes: Record<string, EventNoteT>): ManifestEventT[] => {
	const declaredEvents = declaration.events ?? []
	const declaredNames = declaredEvents.map((declared: ManifestEventT) => declared.name)
	const noteOnlyNames = Object.keys(notes).filter((name: string) => !declaredNames.includes(name))
	const noteOnlyEvents = noteOnlyNames.map((name: string) => ({ name, detail: notes[name].detail }))
	return [...declaredEvents, ...noteOnlyEvents]
}

export const ApiReference = (props: { tag: string }) => {
	const declaration = DECLARATIONS.find((item: ManifestDeclarationT) => item.tagName === props.tag)
	if (!declaration) return null

	const tagNotes = API_NOTES[props.tag] ?? EMPTY_NOTES
	const attributes = declaration.attributes ?? []
	const events = collectEvents(declaration, tagNotes.events ?? {})
	const guidance = tagNotes.guidance ?? []

	const hasAttributes = attributes.length > 0
	const hasEvents = events.length > 0
	const hasGuidance = guidance.length > 0
	const hasContent = hasAttributes || hasEvents || hasGuidance
	if (!hasContent) return null

	return (
		<section className="apiReference" aria-label={`${props.tag} API reference`}>
			<z-heading size="xs" tag="h2">
				API
			</z-heading>
			{hasAttributes && (
				<ApiGroup title="Properties" count={attributes.length}>
					<PropItems attributes={attributes} notes={tagNotes.props ?? {}} />
				</ApiGroup>
			)}
			{hasEvents && (
				<ApiGroup title="Events" count={events.length}>
					<EventItems events={events} notes={tagNotes.events ?? {}} />
				</ApiGroup>
			)}
			{hasGuidance && (
				<ApiGroup title="Guidance" count={guidance.length}>
					<GuidanceItems guidance={guidance} />
				</ApiGroup>
			)}
		</section>
	)
}
