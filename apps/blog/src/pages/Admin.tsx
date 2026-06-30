import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useLocation } from 'wouter'
import { api } from '@convex/_generated/api'
import type { Doc, Id } from '@convex/_generated/dataModel'
import { useAuth } from '@app/useAuth'
import { DropdownMenu, type MenuItem } from '@app/components/DropdownMenu'
import { ConfirmDialog } from '@app/components/ConfirmDialog'

type Filter = 'all' | 'published' | 'draft'

const FILTERS: { key: Filter; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'published', label: 'Published' },
	{ key: 'draft', label: 'Drafts' }
]

const formatDate = (ms: number): string =>
	new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

export const Admin = () => {
	const { isLoading, isAuthor } = useAuth()
	const [, navigate] = useLocation()

	// Only query (author-gated) once we know the user is the author.
	const posts = useQuery(api.posts.listAll, isAuthor ? {} : 'skip')
	const publishPost = useMutation(api.posts.publish)
	const unpublishPost = useMutation(api.posts.unpublish)
	const removePost = useMutation(api.posts.remove)

	const [filter, setFilter] = useState<Filter>('all')
	const [pendingDelete, setPendingDelete] = useState<Doc<'posts'> | null>(null)

	const visible = useMemo(() => {
		if (!posts) return []
		if (filter === 'all') return posts
		return posts.filter((p) => p.status === filter)
	}, [posts, filter])

	const counts = useMemo(() => {
		const all = posts?.length ?? 0
		const published = posts?.filter((p) => p.status === 'published').length ?? 0
		return { all, published, draft: all - published }
	}, [posts])

	if (isLoading) {
		return (
			<section className='BlogContainer'>
				<z-text color='muted'>Loading…</z-text>
			</section>
		)
	}

	if (!isAuthor) {
		return (
			<section className='BlogContainer'>
				<z-heading size='lg'>Not authorized</z-heading>
				<z-text color='muted'>Sign in as the blog author to manage posts.</z-text>
			</section>
		)
	}

	const menuItemsFor = (post: Doc<'posts'>): MenuItem[] => {
		const items: MenuItem[] = [{ label: 'Edit', onSelect: () => navigate(`/edit/${post._id}`) }]
		if (post.status === 'published') {
			items.push({ label: 'View', onSelect: () => window.open(`/blog/post/${post.slug}`, '_blank') })
			items.push({ label: 'Unpublish', onSelect: () => void unpublishPost({ id: post._id as Id<'posts'> }) })
		} else {
			items.push({ label: 'Publish', onSelect: () => void publishPost({ id: post._id as Id<'posts'> }) })
		}
		items.push({ label: 'Delete', danger: true, onSelect: () => setPendingDelete(post) })
		return items
	}

	return (
		<section className='BlogContainer AdminContainer'>
			<div className='AdminHeader'>
				<z-heading size='xl'>Posts</z-heading>
				<z-button size='small' kind='solid' onClick={() => navigate('/new')}>
					New post
				</z-button>
			</div>

			<div className='AdminTabs'>
				{FILTERS.map((f) => (
					<button
						key={f.key}
						type='button'
						className='AdminTab'
						data-active={filter === f.key ? 'true' : 'false'}
						onClick={() => setFilter(f.key)}
					>
						{f.label}
						<span className='AdminTabCount'>{counts[f.key]}</span>
					</button>
				))}
			</div>

			{posts === undefined ? (
				<z-text color='muted'>Loading posts…</z-text>
			) : visible.length === 0 ? (
				<z-text color='muted'>No {filter === 'all' ? '' : filter} posts yet.</z-text>
			) : (
				<ul className='AdminList'>
					{visible.map((post) => (
						<li key={post._id} className='AdminRow'>
							<button className='AdminRowMain' onClick={() => navigate(`/edit/${post._id}`)}>
								<span className='AdminRowTitle'>{post.title || 'Untitled'}</span>
								<span className='AdminRowMeta'>
									<span className='AdminStatus' data-status={post.status}>
										{post.status === 'published' ? 'Published' : 'Draft'}
									</span>
									<span className='AdminDot'>·</span>
									<span>Created {formatDate(post.createdAt)}</span>
									<span className='AdminDot'>·</span>
									<span>Edited {formatDate(post.updatedAt)}</span>
								</span>
							</button>
							<DropdownMenu items={menuItemsFor(post)} label={`Actions for ${post.title || 'Untitled'}`} />
						</li>
					))}
				</ul>
			)}

			{pendingDelete && (
				<ConfirmDialog
					title={`Delete "${pendingDelete.title || 'Untitled'}"?`}
					body="This permanently removes the post and can't be undone."
					onCancel={() => setPendingDelete(null)}
					onConfirm={() => {
						void removePost({ id: pendingDelete._id as Id<'posts'> })
						setPendingDelete(null)
					}}
				/>
			)}
		</section>
	)
}
