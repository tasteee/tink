import { Route, Router, type RouteSectionProps } from '@solidjs/router'
import { Show } from 'solid-js'

import { AuthPage } from '@amore/auth/AuthPage'
import { HomePage } from '@amore/home/HomePage'
import { ProjectView } from '@amore/project/ProjectView'

import { getIsAuthenticated, getIsAuthLoading } from '@amore/auth/authStore'

export const App = () => {
	return (
		<Router root={AuthGate}>
			<Route path='/' component={HomePage} />
			<Route path='/project/:id' component={ProjectView} />
			<Route path='*' component={HomePage} />
		</Router>
	)
}

const AuthGate = (props: RouteSectionProps) => {
	const isLoading = () => !!getIsAuthLoading()
	const isAuthenticated = () => !!getIsAuthenticated()

	return (
		<Show when={!isLoading()} fallback={<LoadingOverlay />}>
			<Show when={isAuthenticated()} fallback={<AuthPage />}>
				{props.children}
			</Show>
		</Show>
	)
}

const LoadingOverlay = () => {
	return (
		<div
			style={{
				background: 'var(--background)',
				height: '100dvh',
				padding: '64px'
			}}
		>
			<div
				style={{
					'font-size': '36px',
					color: 'white',
					'font-weight': 700,
					'text-align': 'center'
				}}
			>
				Loading...
			</div>
		</div>
	)
}
