import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { Link } from 'wouter'
import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { $search, $sort, $activeTags, type SortKey } from '@app/stores'
import { ZInput, ZSelect, ZChip } from '@app/zest/controls'

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
			const matchesTags =
				activeTags.length === 0 || activeTags.every((t: string) => post.tags.includes(t))
			return matchesSearch && matchesTags
		})
		return sortPosts(filtered, sort)
	}, [posts, search, sort, activeTags])

	const toggleTag = (tag: string, selected: boolean) => {
		if (selected) $activeTags.set.append(tag)
		else $activeTags.set(activeTags.filter((t: string) => t !== tag))
	}

	return (
		<section className="BlogContainer">
			<z-heading size="xxl">The blog</z-heading>

			<div className="BlogControls">
				<ZInput value={search} onValue={(v) => $search.set(v)} placeholder="Search posts…" />
				<ZSelect value={sort} options={SORT_OPTIONS} onValue={(v) => $sort.set(v)} />
			</div>

			{allTags.length > 0 && (
				<div className="BlogTags">
					{allTags.map((tag) => (
						<ZChip
							key={tag}
							label={tag}
							value={tag}
							isSelected={activeTags.includes(tag)}
							onSelect={(selected) => toggleTag(tag, selected)}
						/>
					))}
				</div>
			)}

			{posts === undefined ? (
				<z-text color="muted">Loading posts…</z-text>
			) : visible.length === 0 ? (
				<z-text color="muted">No posts match.</z-text>
			) : (
				<div className="BlogGrid">
					{visible.map((post) => (
						<Link key={post._id} href={`/post/${post.slug}`} className="BlogCardLink">
							<z-card isColumn gap="0.5rem" doesLightUpOnHover>
								<z-heading size="sm" tag="h2">{post.title}</z-heading>
								{post.excerpt && <z-text color="muted" size="sm">{post.excerpt}</z-text>}
								<z-text color="muted" size="xs">
									{formatDate(post.publishedAt ?? post.createdAt)}
								</z-text>
							</z-card>
						</Link>
					))}
				</div>
			)}
		</section>
	)
}
