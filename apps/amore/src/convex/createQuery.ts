import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import { convexClient } from './client'

const SKIP = 'skip' as const

// Bridges a Convex reactive query into a SolidJS signal. The args accessor is
// read inside createEffect, so changing args (e.g. a project id route param)
// tears down the old subscription and opens a new one automatically. Pass
// "skip" to hold off subscribing (e.g. while waiting on auth).
export const createQuery = <Query extends FunctionReference<'query'>>(
	queryReference: Query,
	argsAccessor: Accessor<FunctionArgs<Query> | typeof SKIP>
): Accessor<FunctionReturnType<Query> | undefined> => {
	const [value, setValue] = createSignal<FunctionReturnType<Query> | undefined>(undefined)

	createEffect(() => {
		const args = argsAccessor()
		if (args === SKIP) {
			setValue(undefined)
			return
		}

		const unsubscribe = convexClient.onUpdate(
			queryReference,
			args,
			(result) => setValue(() => result),
			(error) => console.error('[amore] query failed', error)
		)
		onCleanup(unsubscribe)
	})

	return value
}

export const QUERY_SKIP = SKIP
