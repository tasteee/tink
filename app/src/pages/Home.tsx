import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { Link } from 'wouter'
import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { $search, $sort, $activeTags, type SortKey } from '@app/stores'
import { ZInput, ZSelect } from '@app/zest/controls'
import { AUTHOR_NAME, AUTHOR_AVATAR_SRC } from '@app/site/author'

const SORT_OPTIONS = [
	{ label: 'Newest', value: 'newest' },
	{ label: 'Oldest', value: 'oldest' },
	{ label: 'Title A–Z', value: 'title' }
]

const sortPosts = (posts: Doc<'posts'>[], key: SortKey): Doc<'posts'>[] => {
	const copy = [...posts]
	if (key === 'title') return copy.sort((a, b) => a.title.localeCompare(b.title))
	const dir = key === 'oldest' ? 1 : -1
	return copy.sort((a, b) => dir * ((a.publishedAt ?? a.createdAt) - (b.publishedAt ?? b.createdAt)))
}

const formatDate = (ms: number): string =>
	new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

// Rough reading-time estimate from the markdown source — ~200 wpm, min 1 min.
const readingTime = (content: string): number => Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))

const categoryOf = (post: Doc<'posts'>): string => post.tags[0] ?? 'Writing'

// The cover image, or a tasteful bordered placeholder showing the category.
// Flat surfaces only — borders over shadows, no gradient fill.
const PostThumb = ({ post }: { post: Doc<'posts'> }) => (
	<div className="BlogThumb">
		{post.coverImage ? (
			<img src={post.coverImage} alt="" loading="lazy" />
		) : (
			<span className="BlogThumb-fallback mono">{categoryOf(post)}</span>
		)}
	</div>
)

// Author + date + reading time. Single-author blog, so the byline is constant.
const PostMeta = ({ post }: { post: Doc<'posts'> }) => (
	<div className="BlogMeta">
		<z-avatar name={AUTHOR_NAME} src={AUTHOR_AVATAR_SRC} size="small" />
		<span className="BlogMeta-name">{AUTHOR_NAME}</span>
		<span className="BlogMeta-sep" aria-hidden="true">·</span>
		<span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
		<span className="BlogMeta-sep" aria-hidden="true">·</span>
		<span>{readingTime(post.content)} min read</span>
	</div>
)

const FeaturedPost = ({ post }: { post: Doc<'posts'> }) => (
	<Link href={`/post/${post.slug}`} className="BlogFeatured">
		<PostThumb post={post} />
		<div className="BlogFeatured-body">
			<span className="BlogCategory">{categoryOf(post)}</span>
			<z-heading size="lg" tag="h2" className="BlogFeatured-title">
				{post.title}
			</z-heading>
			{post.excerpt && (
				<z-text color="muted" size="md" className="BlogFeatured-excerpt">
					{post.excerpt}
				</z-text>
			)}
			<PostMeta post={post} />
		</div>
	</Link>
)

const PostCard = ({ post }: { post: Doc<'posts'> }) => (
	<Link href={`/post/${post.slug}`} className="BlogCard">
		<PostThumb post={post} />
		<span className="BlogCategory">{categoryOf(post)}</span>
		<z-heading size="xs" tag="h3" className="BlogCard-title">
			{post.title}
		</z-heading>
		{post.excerpt && (
			<z-text color="muted" size="sm" className="BlogCard-excerpt">
				{post.excerpt}
			</z-text>
		)}
		<PostMeta post={post} />
	</Link>
)

export const Home = () => {
	const posts = useQuery(api.posts.listPublished)
	const search = $search.use()
	const sort = $sort.use() as SortKey
	const activeTags = $activeTags.use()

	const allTags = useMemo(() => {
		const set = new Set<string>()
		for (const post of posts ?? []) for (const tag of post.tags) set.add(tag)
		return [...set].sort()
	}, [posts])

	const visible = useMemo(() => {
		if (!posts) return []
		const needle = search.trim().toLowerCase()
		const filtered = posts.filter((post) => {
			const matchesSearch =
				needle === '' ||
				post.title.toLowerCase().includes(needle) ||
				(post.excerpt ?? '').toLowerCase().includes(needle)
			const matchesTags = activeTags.length === 0 || activeTags.every((t: string) => post.tags.includes(t))
			return matchesSearch && matchesTags
		})
		return sortPosts(filtered, sort)
	}, [posts, search, sort, activeTags])

	const toggleTag = (tag: string) => {
		if (activeTags.includes(tag)) $activeTags.set(activeTags.filter((t: string) => t !== tag))
		else $activeTags.set.append(tag)
	}

	// Spotlight the latest post only in the default, unfiltered view — once the
	// reader is searching or filtering, every result is equal and the grid reads
	// cleaner without a hero.
	const isDefaultView = search.trim() === '' && activeTags.length === 0
	const featured = isDefaultView ? visible[0] : undefined
	const rest = featured ? visible.slice(1) : visible

	return (
		<section className="BlogContainer BlogIndex">
			<header className="BlogHeader">
				<span className="eyebrow">
					<span className="line" /> Writing
				</span>
				<z-heading size="xxl" tag="h1">
					The blog
				</z-heading>
				<z-text size="lg" color="muted" className="BlogHeader-sub">
					Notes on design systems, the web platform, and building in the open.
				</z-text>
			</header>

			<div className="BlogFilterBar">
				<div className="BlogFilterTabs">
					<button
						type="button"
						className={activeTags.length === 0 ? 'BlogFilterTab active' : 'BlogFilterTab'}
						onClick={() => $activeTags.set([])}
					>
						All
					</button>
					{allTags.map((tag) => (
						<button
							key={tag}
							type="button"
							className={activeTags.includes(tag) ? 'BlogFilterTab active' : 'BlogFilterTab'}
							onClick={() => toggleTag(tag)}
						>
							{tag}
						</button>
					))}
				</div>
				<div className="BlogFilterSearch">
					<ZInput value={search} onValue={(v) => $search.set(v)} placeholder="Search posts…" />
					<ZSelect value={sort} options={SORT_OPTIONS} onValue={(v) => $sort.set(v)} />
				</div>
			</div>

			{posts === undefined ? (
				<z-text color="muted">Loading posts…</z-text>
			) : visible.length === 0 ? (
				<z-text color="muted">No posts match.</z-text>
			) : (
				<>
					{featured && <FeaturedPost post={featured} />}
					{rest.length > 0 && (
						<div className="BlogGrid">
							{rest.map((post) => (
								<PostCard key={post._id} post={post} />
							))}
						</div>
					)}
				</>
			)}
		</section>
	)
}
