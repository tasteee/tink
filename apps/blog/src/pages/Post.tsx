import { useEffect, useRef, useState } from 'react'
import { useQuery } from 'convex/react'
import { Link, useLocation, useRoute } from 'wouter'
import { api } from '@convex/_generated/api'
import { renderMarkdown } from '@app/markdown/renderMarkdown'
import { AUTHOR_NAME, AUTHOR_AVATAR_SRC } from '@app/site/author'
import { $activeTags } from '@app/stores'

const formatDate = (ms: number): string =>
	new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

export const Post = () => {
	const [, params] = useRoute('/post/:slug')
	const slug = params?.slug ?? ''
	const post = useQuery(api.posts.getBySlug, slug ? { slug } : 'skip')
	const [, navigate] = useLocation()

	const [html, setHtml] = useState('')
	useEffect(() => {
		if (!post) return
		let active = true
		renderMarkdown(post.content, {
			authorName: AUTHOR_NAME,
			avatarSrc: AUTHOR_AVATAR_SRC,
			date: formatDate(post.publishedAt ?? post.createdAt),
			tags: post.tags
		}).then((rendered) => {
			if (active) setHtml(rendered)
		})
		return () => {
			active = false
		}
	}, [post])

	useEffect(() => {
		if (post) document.title = post.title
	}, [post])

	// `!META` renders a <z-post-meta>, whose tag chips fire a bubbling, composed
	// `tagclick` event — catch it here and route to the filtered post list.
	const proseRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		const el = proseRef.current
		if (!el) return
		const onTagClick = (event: Event) => {
			const { tag } = (event as CustomEvent<{ tag: string }>).detail
			$activeTags.set([tag])
			navigate('/')
		}
		el.addEventListener('tagclick', onTagClick)
		return () => el.removeEventListener('tagclick', onTagClick)
	}, [navigate])

	if (post === undefined) {
		return (
			<section className="BlogContainer">
				<z-text color="muted">Loading…</z-text>
			</section>
		)
	}

	if (post === null) {
		return (
			<section className="BlogContainer">
				<z-heading size="lg">Post not found</z-heading>
				<Link href="/">Back home</Link>
			</section>
		)
	}

	return (
		<article className="BlogContainer">
			<div className="Prose" ref={proseRef} dangerouslySetInnerHTML={{ __html: html }} />
		</article>
	)
}
