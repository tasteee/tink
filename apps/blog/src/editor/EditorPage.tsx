import './editor.css'
import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useLocation, useRoute } from 'wouter'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { renderMarkdown } from '@app/markdown/renderMarkdown'
import { downloadPostHtml } from '@app/markdown/exportHtml'
import { MarkdownEditor } from '@app/editor/MarkdownEditor'
import { AUTHOR_NAME, AUTHOR_AVATAR_SRC } from '@app/site/author'
import { ZBadge } from '@app/zest/controls'
import { DownloadSimpleIcon } from '@phosphor-icons/react'

const formatDate = (ms: number): string =>
	new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

type SaveState = 'saved' | 'saving' | 'unsaved'

const AUTOSAVE_DELAY_MS = 1000
const PREVIEW_DEBOUNCE_MS = 750

export const EditorPage = () => {
	const [, params] = useRoute('/edit/:id')
	const postId = (params?.id ?? '') as Id<'posts'>
	const [, navigate] = useLocation()

	const post = useQuery(api.posts.getById, postId ? { id: postId } : 'skip')
	const updatePost = useMutation(api.posts.update)
	const removePost = useMutation(api.posts.remove)
	const publishPost = useMutation(api.posts.publish)
	const unpublishPost = useMutation(api.posts.unpublish)
	const generateUploadUrl = useMutation(api.images.generateUploadUrl)
	const getImageUrl = useMutation(api.images.getImageUrl)

	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [tags, setTags] = useState<string[]>([])
	const [tagDraft, setTagDraft] = useState('')
	const [previewHtml, setPreviewHtml] = useState('')
	const [saveState, setSaveState] = useState<SaveState>('saved')
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
	const [splitPercent, setSplitPercent] = useState(50)
	const [mobilePaneView, setMobilePaneView] = useState<'editor' | 'preview'>('editor')

	const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isHydratedRef = useRef(false)
	const layoutRef = useRef<HTMLDivElement | null>(null)
	const isDraggingRef = useRef(false)

	// Hydrate local state from Convex once.
	useEffect(() => {
		if (!post || isHydratedRef.current) return
		isHydratedRef.current = true
		setTitle(post.title)
		setContent(post.content)
		setTags(post.tags)
	}, [post])

	// Debounced preview render (client-side markdown).
	useEffect(() => {
		const timer = setTimeout(() => {
			if (!post) return
			void renderMarkdown(content, {
				authorName: AUTHOR_NAME,
				avatarSrc: AUTHOR_AVATAR_SRC,
				date: formatDate(post.publishedAt ?? post.createdAt),
				tags
			}).then(setPreviewHtml)
		}, PREVIEW_DEBOUNCE_MS)
		return () => clearTimeout(timer)
	}, [content, tags, post])

	const scheduleSave = useCallback(
		(nextTitle: string, nextContent: string): void => {
			if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current)
			setSaveState('unsaved')
			saveTimerRef.current = setTimeout(() => {
				setSaveState('saving')
				void updatePost({ id: postId, title: nextTitle, content: nextContent }).then(() => setSaveState('saved'))
			}, AUTOSAVE_DELAY_MS)
		},
		[postId, updatePost]
	)

	const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setTitle(event.target.value)
		scheduleSave(event.target.value, content)
	}

	const handleContentChange = (nextContent: string): void => {
		setContent(nextContent)
		scheduleSave(title, nextContent)
	}

	const handleAddTag = (): void => {
		const tag = tagDraft.trim()
		setTagDraft('')
		if (!tag || tags.includes(tag)) return
		const nextTags = [...tags, tag]
		setTags(nextTags)
		void updatePost({ id: postId, tags: nextTags })
	}

	const handleTagDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
		if (event.key !== 'Enter') return
		event.preventDefault()
		handleAddTag()
	}

	const handleRemoveTag = (tag?: string): void => {
		if (!tag) return
		const nextTags = tags.filter((t) => t !== tag)
		setTags(nextTags)
		void updatePost({ id: postId, tags: nextTags })
	}

	const handleImageUpload = async (blob: Blob): Promise<string | null> => {
		const uploadUrl = await generateUploadUrl()
		const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob })
		if (!res.ok) return null
		const { storageId } = (await res.json()) as { storageId: Id<'_storage'> }
		return await getImageUrl({ storageId })
	}

	const handleResizeDown = (e: React.PointerEvent<HTMLDivElement>): void => {
		isDraggingRef.current = true
		e.currentTarget.setPointerCapture(e.pointerId)
	}
	const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>): void => {
		if (!isDraggingRef.current || layoutRef.current === null) return
		const rect = layoutRef.current.getBoundingClientRect()
		const pct = ((e.clientX - rect.left) / rect.width) * 100
		setSplitPercent(Math.min(80, Math.max(20, pct)))
	}
	const handleResizeUp = (e: React.PointerEvent<HTMLDivElement>): void => {
		isDraggingRef.current = false
		e.currentTarget.releasePointerCapture(e.pointerId)
	}

	const handleExportClick = (): void => {
		downloadPostHtml(title || 'Untitled', previewHtml)
	}

	const handleDeleteClick = (): void => {
		if (!isConfirmingDelete) {
			setIsConfirmingDelete(true)
			return
		}
		void removePost({ id: postId }).then(() => navigate('/'))
	}

	if (post === undefined) {
		return <div className='EditorEmpty'>Loading…</div>
	}
	if (post === null) {
		return (
			<div className='EditorEmpty'>
				<p>Post not found.</p>
				<z-button kind='ghost' onClick={() => navigate('/')}>
					Back to blog
				</z-button>
			</div>
		)
	}

	const isPublished = post.status === 'published'
	const saveLabel = saveState === 'saving' ? 'Saving…' : saveState === 'unsaved' ? 'Unsaved' : 'Saved'
	const gridTemplateColumns = `${splitPercent}% auto 1fr`

	return (
		<div className='EditorShell'>
			<div className='EditorTopbar'>
				<button className='EditorBackButton' onClick={() => navigate('/')} title='All posts'>
					←
				</button>
				<input
					className='EditorTitle'
					type='text'
					value={title}
					onChange={handleTitleChange}
					placeholder='Untitled'
					spellCheck={false}
				/>
				<span className='EditorSaveState' data-saving={saveState === 'saving'}>
					{saveLabel}
				</span>
				<div className='EditorActions'>
					<z-badge tone={isPublished ? 'success' : 'neutral'}>{isPublished ? 'Published' : 'Draft'}</z-badge>
					{isPublished ? (
						<z-button size='small' kind='ghost' onClick={() => void unpublishPost({ id: postId })}>
							Unpublish
						</z-button>
					) : (
						<z-button size='small' kind='soft' tone='primary' onClick={() => void publishPost({ id: postId })}>
							Publish
						</z-button>
					)}
					{isPublished && (
						<z-button size='small' kind='ghost' onClick={() => window.open(`/blog/post/${post.slug}`, '_blank')}>
							View
						</z-button>
					)}
					<z-button
						size='small'
						kind='ghost'
						tone='danger'
						onClick={handleDeleteClick}
						onBlur={() => setIsConfirmingDelete(false)}
					>
						{isConfirmingDelete ? 'Sure?' : 'Delete'}
					</z-button>
				</div>
			</div>

			<div className='EditorTagsBar'>
				{tags.map((tag) => (
					<ZBadge key={tag} label={tag} value={tag} isRemovable onRemove={handleRemoveTag} />
				))}
				<input
					className='EditorTagInput'
					type='text'
					value={tagDraft}
					onChange={(event) => setTagDraft(event.target.value)}
					onKeyDown={handleTagDraftKeyDown}
					onBlur={handleAddTag}
					placeholder='Add tag…'
					spellCheck={false}
				/>
			</div>

			<div
				ref={layoutRef}
				className='EditorLayout'
				data-mobile-view={mobilePaneView}
				style={{ gridTemplateColumns } as CSSProperties}
			>
				<div className='EditorPane'>
					<MarkdownEditor
						key={postId}
						defaultValue={post.content}
						onChange={handleContentChange}
						onImageUpload={handleImageUpload}
					/>
				</div>

				<div
					className='EditorResizeHandle'
					onPointerDown={handleResizeDown}
					onPointerMove={handleResizeMove}
					onPointerUp={handleResizeUp}
				/>

				<div className='PreviewPane'>
					<div className='PreviewPaneLabel'>
						<span>Preview</span>
						<z-button size='small' kind='ghost' title='Export as HTML' onClick={handleExportClick}>
							<DownloadSimpleIcon size={14} weight='bold' />
							Export
						</z-button>
					</div>
					<div className='PreviewPaneContent'>
						<div className='Prose' dangerouslySetInnerHTML={{ __html: previewHtml }} />
					</div>
				</div>
			</div>

			<div className='EditorMobileToggle' role='group' aria-label='Switch pane'>
				<z-button
					className='EditorMobileToggleButton'
					data-active={mobilePaneView === 'editor'}
					onClick={() => setMobilePaneView('editor')}
				>
					Editor
				</z-button>
				<z-button
					className='EditorMobileToggleButton'
					data-active={mobilePaneView === 'preview'}
					onClick={() => setMobilePaneView('preview')}
				>
					Preview
				</z-button>
			</div>
		</div>
	)
}
