import { useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import { useLocation } from 'wouter'
import { api } from '@convex/_generated/api'

// Creates a fresh draft and redirects into the editor for it.
export const New = () => {
	const createDraft = useMutation(api.posts.createDraft)
	const [, navigate] = useLocation()
	const startedRef = useRef(false)

	useEffect(() => {
		if (startedRef.current) return
		startedRef.current = true
		void createDraft({}).then((id) => navigate(`/edit/${id}`, { replace: true }))
	}, [createDraft, navigate])

	return <div className="EditorEmpty">Creating draft…</div>
}
