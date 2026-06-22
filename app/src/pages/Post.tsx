import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { Link, useRoute } from 'wouter'
import { api } from '@convex/_generated/api'
import { renderMarkdown } from '@app/markdown/renderMarkdown'

const formatDate = (ms: number): string =>
	new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

export const Post = () => {
	const [, params] = useRoute('/post/:slug')
	const slug = params?.slug ?? ''
	const post = useQuery(api.posts.getBySlug, slug ? { slug } : 'skip')

	const [html, setHtml] = useState('')
	useEffect(() => {
		if (!post) return
		let active = true
		renderMarkdown(post.content).then((rendered) => {
			if (active) setHtml(rendered)
		})
		return () => {
			active = false
		}
	}, [post])

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
			<header className="BlogPostHeader">
				<z-heading size="xl">{post.title}</z-heading>
				<z-text color="muted" size="sm">{formatDate(post.publishedAt ?? post.createdAt)}</z-text>
			</header>
			<div className="Prose" dangerouslySetInnerHTML={{ __html: html }} />
		</article>
	)
}
