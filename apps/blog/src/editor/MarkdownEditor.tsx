import './editor.css'
import { useRef, useState, useEffect, type JSX } from 'react'
import { Editor } from '@monaco-editor/react'
import type { OnMount, OnChange, BeforeMount, Monaco } from '@monaco-editor/react'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import {
	CopyIcon,
	ClipboardIcon,
	TextBolderIcon,
	TextItalicIcon,
	TextUnderlineIcon,
	TextStrikethroughIcon,
	CodeIcon,
	LinkSimpleIcon,
	ImageIcon,
	TextHOneIcon,
	QuotesIcon,
	ListBulletsIcon,
	ListNumbersIcon,
	CodeBlockIcon
} from '@phosphor-icons/react'

type MarkdownEditorPropsT = {
	// Seeds the editor's initial content. The editor is uncontrolled after mount:
	// passing `value` instead would let @monaco-editor/react re-apply it on every
	// parent re-render (a full-document executeEdits), which yanks the cursor to
	// the end of the file mid-typing. Changes propagate out via onChange.
	defaultValue: string
	onChange: (nextValue: string) => void
	onImageUpload?: (blob: Blob) => Promise<string | null>
}

type ToolbarButtonT = { kind: 'button'; id: string; title: string; icon: JSX.Element; onClick: () => void }
type ToolbarDividerT = { kind: 'divider'; id: string }
type ToolbarItemT = ToolbarButtonT | ToolbarDividerT

const ZEST_THEME_NAME = 'zest-markdown'

const editorOptions: MonacoEditorNS.IStandaloneEditorConstructionOptions = {
	fontFamily: 'var(--font-mono), DM Mono, monospace',
	fontSize: 14,
	lineHeight: 24,
	wordWrap: 'on',
	lineNumbers: 'off',
	minimap: { enabled: false },
	folding: false,
	glyphMargin: false,
	renderLineHighlight: 'all',
	scrollBeyondLastLine: false,
	automaticLayout: true,
	padding: { top: 20, bottom: 20 },
	lineDecorationsWidth: 12,
	lineNumbersMinChars: 0,
	overviewRulerLanes: 0,
	overviewRulerBorder: false,
	scrollbar: { vertical: 'auto', horizontal: 'hidden', verticalScrollbarSize: 10 },
	smoothScrolling: true,
	cursorBlinking: 'smooth',
	cursorSmoothCaretAnimation: 'on',
	roundedSelection: false,
	occurrencesHighlight: 'off',
	selectionHighlight: false,
	matchBrackets: 'never',
	guides: { indentation: false },
	contextmenu: true,
	tabSize: 2
}

const defineZestTheme = (monaco: Monaco): void => {
	monaco.editor.defineTheme(ZEST_THEME_NAME, {
		base: 'vs-dark',
		inherit: true,
		rules: [
			{ token: '', foreground: 'a0a0a0' },
			{ token: 'keyword', foreground: 'c8b0e0', fontStyle: 'bold' },
			{ token: 'keyword.md', foreground: 'c8b0e0', fontStyle: 'bold' },
			{ token: 'strong', foreground: 'fafafa', fontStyle: 'bold' },
			{ token: 'emphasis', foreground: 'fafafa', fontStyle: 'italic' },
			{ token: 'string.link', foreground: 'f472b6' },
			{ token: 'string.link.md', foreground: 'f472b6' },
			{ token: 'variable', foreground: 'b0edb8' },
			{ token: 'variable.md', foreground: 'b0edb8' },
			{ token: 'variable.source', foreground: 'b0edb8' },
			{ token: 'tag', foreground: 'a898c8' },
			{ token: 'comment', foreground: '707070', fontStyle: 'italic' },
			{ token: 'string', foreground: 'a0a0a0' }
		],
		colors: {
			'editor.background': '#0a0f0a',
			'editor.foreground': '#a0a0a0',
			'editorCursor.foreground': '#b794f6',
			'editorLineNumber.foreground': '#3a3c3b',
			'editor.lineHighlightBackground': '#14181466',
			'editor.lineHighlightBorder': '#00000000',
			'editor.selectionBackground': '#6b46c155',
			'editor.selectionHighlightBackground': '#f472b626',
			'editorWidget.background': '#141814',
			'editorWidget.border': '#2a2f2a',
			'input.background': '#0a0f0a',
			'input.border': '#2a2f2a',
			focusBorder: '#00000000',
			'scrollbarSlider.background': '#2a2f2a80',
			'scrollbarSlider.hoverBackground': '#2a2f2acc',
			'scrollbarSlider.activeBackground': '#3a3c3bcc'
		}
	})
}

export const MarkdownEditor = (props: MarkdownEditorPropsT): JSX.Element => {
	const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null)
	const monacoRef = useRef<Monaco | null>(null)
	const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const surfaceRef = useRef<HTMLDivElement | null>(null)
	const onImageUploadRef = useRef(props.onImageUpload)

	const [isCopied, setIsCopied] = useState(false)
	const [isUploadingImage, setIsUploadingImage] = useState(false)

	useEffect(() => {
		onImageUploadRef.current = props.onImageUpload
	})

	// Paste an image -> upload -> insert markdown at the selection.
	useEffect(() => {
		const surface = surfaceRef.current
		if (surface === null) return

		const handleImagePaste = (event: ClipboardEvent): void => {
			const upload = onImageUploadRef.current
			if (upload === undefined) return

			const items = Array.from(event.clipboardData?.items ?? [])
			const imageItem = items.find((item) => item.type.startsWith('image/'))
			if (imageItem === undefined) return

			const blob = imageItem.getAsFile()
			if (blob === null) return

			event.preventDefault()

			void (async () => {
				setIsUploadingImage(true)
				const url = await upload(blob)
				setIsUploadingImage(false)
				if (url === null) return

				const editor = editorRef.current
				const monaco = monacoRef.current
				if (editor === null || monaco === null) return

				const selection = editor.getSelection()
				if (selection === null) return

				const selectedText = editor.getModel()?.getValueInRange(selection) ?? ''
				const labelText = selectedText || 'image'
				const markdown = `![${labelText}](${url})`

				editor.executeEdits('paste-image', [{ range: selection, text: markdown, forceMoveMarkers: true }])
				editor.focus()
			})()
		}

		surface.addEventListener('paste', handleImagePaste, true)
		return () => surface.removeEventListener('paste', handleImagePaste, true)
	}, [])

	const focusEditor = (): void => {
		editorRef.current?.focus()
	}

	const wrapSelection = (before: string, after: string, placeholder: string): void => {
		const editor = editorRef.current
		const monaco = monacoRef.current
		if (editor === null || monaco === null) return

		const selection = editor.getSelection()
		const model = editor.getModel()
		if (selection === null || model === null) return

		const selectedText = model.getValueInRange(selection)
		const innerText = selectedText.length === 0 ? placeholder : selectedText
		const replacementText = `${before}${innerText}${after}`

		editor.executeEdits('markdown-toolbar', [{ range: selection, text: replacementText, forceMoveMarkers: true }])

		const startLine = selection.startLineNumber
		const innerStartColumn = selection.startColumn + before.length
		const innerEndColumn = innerStartColumn + innerText.length
		editor.setSelection(new monaco.Selection(startLine, innerStartColumn, startLine, innerEndColumn))
		focusEditor()
	}

	// Wrap selection in a markdown link; if the clipboard holds a URL, use it.
	const insertLink = async (): Promise<void> => {
		const editor = editorRef.current
		const monaco = monacoRef.current
		if (editor === null || monaco === null) return

		const selection = editor.getSelection()
		const model = editor.getModel()
		if (selection === null || model === null) return

		const clipboard = await navigator.clipboard.readText().catch(() => '')
		const looksLikeUrl = /^https?:\/\/\S+$/.test(clipboard.trim())
		const urlPlaceholder = looksLikeUrl ? clipboard.trim() : 'https://'

		const selectedText = model.getValueInRange(selection)
		const labelText = selectedText.length === 0 ? 'link text' : selectedText
		const replacementText = `[${labelText}](${urlPlaceholder})`

		editor.executeEdits('markdown-toolbar', [{ range: selection, text: replacementText, forceMoveMarkers: true }])

		const startLine = selection.startLineNumber
		const urlStartColumn = selection.startColumn + 1 + labelText.length + 2
		const urlEndColumn = urlStartColumn + urlPlaceholder.length
		editor.setSelection(new monaco.Selection(startLine, urlStartColumn, startLine, urlEndColumn))
		focusEditor()
	}

	const insertImageSyntax = (): void => {
		const editor = editorRef.current
		const monaco = monacoRef.current
		if (editor === null || monaco === null) return
		const selection = editor.getSelection()
		const model = editor.getModel()
		if (selection === null || model === null) return

		const selectedText = model.getValueInRange(selection)
		const labelText = selectedText.length === 0 ? 'alt text' : selectedText
		editor.executeEdits('markdown-toolbar', [
			{ range: selection, text: `![${labelText}](https://)`, forceMoveMarkers: true }
		])
		focusEditor()
	}

	const applyLinePrefix = (prefix: string): void => {
		const editor = editorRef.current
		const monaco = monacoRef.current
		if (editor === null || monaco === null) return

		const selection = editor.getSelection()
		if (selection === null) return

		const lineCount = selection.endLineNumber - selection.startLineNumber + 1
		const edits = Array.from({ length: lineCount }, (_unused, offset): MonacoEditorNS.IIdentifiedSingleEditOperation => {
			const lineNumber = selection.startLineNumber + offset
			return { range: new monaco.Range(lineNumber, 1, lineNumber, 1), text: prefix, forceMoveMarkers: true }
		})

		editor.executeEdits('markdown-toolbar', edits)
		focusEditor()
	}

	const insertCodeBlock = (): void => {
		const editor = editorRef.current
		const monaco = monacoRef.current
		if (editor === null || monaco === null) return
		const selection = editor.getSelection()
		const model = editor.getModel()
		if (selection === null || model === null) return

		const selectedText = model.getValueInRange(selection)
		const innerText = selectedText.length === 0 ? 'code' : selectedText
		editor.executeEdits('markdown-toolbar', [
			{ range: selection, text: `\`\`\`\n${innerText}\n\`\`\``, forceMoveMarkers: true }
		])
		focusEditor()
	}

	const handleCopy = async (): Promise<void> => {
		const model = editorRef.current?.getModel()
		if (!model) return
		const copyError = await navigator.clipboard.writeText(model.getValue()).then(() => null, (e: unknown) => e)
		if (copyError !== null) return
		if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current)
		setIsCopied(true)
		copyTimerRef.current = setTimeout(() => setIsCopied(false), 1500)
	}

	const handlePaste = async (): Promise<void> => {
		const editor = editorRef.current
		if (editor === null) return
		const clipboardText = await navigator.clipboard.readText().catch(() => null)
		if (clipboardText === null) return
		const selection = editor.getSelection()
		if (selection === null) return
		editor.executeEdits('paste', [{ range: selection, text: clipboardText, forceMoveMarkers: true }])
		focusEditor()
	}

	const handleBold = (): void => wrapSelection('**', '**', 'bold text')
	const handleItalic = (): void => wrapSelection('*', '*', 'italic text')
	const handleUnderline = (): void => wrapSelection('<span class="isUnderlined">', '</span>', 'underlined text')
	const handleStrikethrough = (): void => wrapSelection('~~', '~~', 'struck text')
	const handleInlineCode = (): void => wrapSelection('`', '`', 'code')

	const handleBeforeMount: BeforeMount = (monaco): void => {
		defineZestTheme(monaco)
	}

	const handleEditorMount: OnMount = (editor, monaco): void => {
		editorRef.current = editor
		monacoRef.current = monaco
		const ctrl = monaco.KeyMod.CtrlCmd
		const shift = monaco.KeyMod.Shift
		editor.addAction({ id: 'zest.bold', label: 'Bold', keybindings: [ctrl | monaco.KeyCode.KeyB], run: handleBold })
		editor.addAction({ id: 'zest.italic', label: 'Italic', keybindings: [ctrl | monaco.KeyCode.KeyI], run: handleItalic })
		editor.addAction({ id: 'zest.underline', label: 'Underline', keybindings: [ctrl | monaco.KeyCode.KeyU], run: handleUnderline })
		editor.addAction({ id: 'zest.strike', label: 'Strikethrough', keybindings: [ctrl | shift | monaco.KeyCode.KeyX], run: handleStrikethrough })
		editor.addAction({ id: 'zest.code', label: 'Inline code', keybindings: [ctrl | monaco.KeyCode.KeyE], run: handleInlineCode })
		editor.addAction({ id: 'zest.link', label: 'Insert link', keybindings: [ctrl | monaco.KeyCode.KeyK], run: () => void insertLink() })
	}

	const handleEditorChange: OnChange = (nextValue): void => {
		props.onChange(nextValue ?? '')
	}

	const iconSize = 16
	const iconWeight = 'bold' as const

	const toolbarItems: ToolbarItemT[] = [
		{ kind: 'button', id: 'copy', title: 'Copy contents', icon: <CopyIcon size={iconSize} weight={iconWeight} />, onClick: () => void handleCopy() },
		{ kind: 'button', id: 'paste', title: 'Paste from clipboard', icon: <ClipboardIcon size={iconSize} weight={iconWeight} />, onClick: () => void handlePaste() },
		{ kind: 'divider', id: 'd0' },
		{ kind: 'button', id: 'bold', title: 'Bold (Ctrl+B)', icon: <TextBolderIcon size={iconSize} weight={iconWeight} />, onClick: handleBold },
		{ kind: 'button', id: 'italic', title: 'Italic (Ctrl+I)', icon: <TextItalicIcon size={iconSize} weight={iconWeight} />, onClick: handleItalic },
		{ kind: 'button', id: 'underline', title: 'Underline (Ctrl+U)', icon: <TextUnderlineIcon size={iconSize} weight={iconWeight} />, onClick: handleUnderline },
		{ kind: 'button', id: 'strike', title: 'Strikethrough (Ctrl+Shift+X)', icon: <TextStrikethroughIcon size={iconSize} weight={iconWeight} />, onClick: handleStrikethrough },
		{ kind: 'button', id: 'inlineCode', title: 'Inline code (Ctrl+E)', icon: <CodeIcon size={iconSize} weight={iconWeight} />, onClick: handleInlineCode },
		{ kind: 'divider', id: 'd1' },
		{ kind: 'button', id: 'link', title: 'Link (Ctrl+K)', icon: <LinkSimpleIcon size={iconSize} weight={iconWeight} />, onClick: () => void insertLink() },
		{ kind: 'button', id: 'image', title: 'Image', icon: <ImageIcon size={iconSize} weight={iconWeight} />, onClick: insertImageSyntax },
		{ kind: 'divider', id: 'd2' },
		{ kind: 'button', id: 'heading', title: 'Heading', icon: <TextHOneIcon size={iconSize} weight={iconWeight} />, onClick: () => applyLinePrefix('# ') },
		{ kind: 'button', id: 'quote', title: 'Blockquote', icon: <QuotesIcon size={iconSize} weight={iconWeight} />, onClick: () => applyLinePrefix('> ') },
		{ kind: 'button', id: 'bullet', title: 'Bullet list', icon: <ListBulletsIcon size={iconSize} weight={iconWeight} />, onClick: () => applyLinePrefix('- ') },
		{ kind: 'button', id: 'number', title: 'Numbered list', icon: <ListNumbersIcon size={iconSize} weight={iconWeight} />, onClick: () => applyLinePrefix('1. ') },
		{ kind: 'button', id: 'codeblock', title: 'Code block', icon: <CodeBlockIcon size={iconSize} weight={iconWeight} />, onClick: insertCodeBlock }
	]

	return (
		<div className="MarkdownEditor">
			<div className="MarkdownCopyToast" data-visible={isCopied ? 'true' : 'false'} aria-live="polite">Copied!</div>
			<div className="MarkdownUploadToast" data-visible={isUploadingImage ? 'true' : 'false'} aria-live="polite">Uploading image…</div>

			<div className="MarkdownToolbar">
				{toolbarItems.map((item) =>
					item.kind === 'divider' ? (
						<span key={item.id} className="MarkdownToolbarDivider" aria-hidden="true" />
					) : (
						<button key={item.id} type="button" className="MarkdownToolbarButton" title={item.title} aria-label={item.title} onClick={item.onClick}>
							{item.icon}
						</button>
					)
				)}
			</div>

			<div ref={surfaceRef} className="MarkdownEditorSurface">
				<Editor
					height="100%"
					defaultLanguage="markdown"
					theme={ZEST_THEME_NAME}
					defaultValue={props.defaultValue}
					onChange={handleEditorChange}
					beforeMount={handleBeforeMount}
					onMount={handleEditorMount}
					options={editorOptions}
				/>
			</div>
		</div>
	)
}
