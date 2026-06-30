import { createSignal, For, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { api } from '@convex/_generated/api'
import { createQuery, QUERY_SKIP } from '@amore/convex/createQuery'
import { convexClient } from '@amore/convex/client'
import { getIsAuthenticated, signOut } from '@amore/auth/authStore'

const CHORD_PALETTE = [
	'oklch(0.52 0.22 270)',
	'oklch(0.52 0.22 300)',
	'oklch(0.52 0.22 200)',
	'oklch(0.52 0.22 160)',
	'oklch(0.52 0.22 60)',
	'oklch(0.52 0.22 30)',
	'oklch(0.52 0.22 340)'
]

const formatDate = (timestamp: number): string =>
	new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

const AvatarDropdown = () => {
	const [isOpen, setIsOpen] = createSignal(false)
	const meQuery = createQuery(api.users.me, () => (getIsAuthenticated() ? {} : QUERY_SKIP))
	const me = meQuery

	const handleSignOut = async () => {
		setIsOpen(false)
		await signOut()
	}

	const initials = () => {
		const user = me()
		const emailValue = user?.email ?? ''
		return emailValue.charAt(0).toUpperCase() || 'U'
	}

	return (
		<div class='avatarDropdown'>
			<button type='button' class='avatarTrigger' onClick={() => setIsOpen((v) => !v)} aria-label='Account menu'>
				<z-avatar initials={initials()} size='small' />
			</button>

			<Show when={isOpen()}>
				<div class='avatarDropdownMenu'>
					<div class='avatarDropdownEmail'>{me()?.email ?? ''}</div>
					<button type='button' class='avatarDropdownItem' onClick={handleSignOut}>
						Sign out
					</button>
				</div>
			</Show>
		</div>
	)
}

export const HomePage = () => {
	const navigate = useNavigate()
	const [isCreating, setIsCreating] = createSignal(false)

	const projectsQuery = createQuery(api.amoreProjects.list, () => (getIsAuthenticated() ? {} : QUERY_SKIP))
	const projects = projectsQuery

	const handleCreateProject = async () => {
		setIsCreating(true)
		const projectId = await convexClient.mutation(api.amoreProjects.create, { name: 'New project' })
		setIsCreating(false)
		navigate(`/project/${projectId}`)
	}

	const handleDeleteProject = async (projectId: string, event: Event) => {
		event.stopPropagation()
		await convexClient.mutation(api.amoreProjects.remove, { id: projectId as any })
	}

	return (
		<div class='homePage'>
			<header class='homeHeader'>
				<span class='homeLogo'>amore</span>
				<AvatarDropdown />
			</header>

			<div class='homeBody'>
				<z-stack is-row aligns-y='center' aligns-x='between'>
					<z-text size='lg' weight='700'>
						Projects
					</z-text>
					<z-button size='small' onClick={handleCreateProject} isLoading={isCreating()}>
						New project
					</z-button>
					<z-button size='medium' onClick={handleCreateProject} isLoading={isCreating()}>
						New project
					</z-button>
					<z-button size='large' onClick={handleCreateProject} isLoading={isCreating()}>
						New project
					</z-button>
				</z-stack>

				<Show when={projects() !== undefined}>
					<Show
						when={projects()!.length > 0}
						fallback={
							<div class='emptyProjects'>
								<z-text size='lg' color='muted'>
									No projects yet
								</z-text>
								<z-text size='sm' color='muted'>
									Create your first project to start building patterns.
								</z-text>
							</div>
						}
					>
						<div class='projectGrid'>
							<For each={projects()}>
								{(project, index) => (
									<div class='projectCard' onClick={() => navigate(`/project/${project._id}`)}>
										<div
											style={{
												width: '100%',
												height: '8px',
												'border-radius': 'var(--radius-sm)',
												background: CHORD_PALETTE[index() % CHORD_PALETTE.length]
											}}
										/>
										<div class='projectCardTitle'>{project.name}</div>
										<div class='projectCardMeta'>
											<span>
												{project.key} {project.scale}
											</span>
											<span>·</span>
											<span>{project.bpm} BPM</span>
											<span>·</span>
											<span>{formatDate(project.createdAt)}</span>
										</div>
										<div class='projectCardActions'>
											<z-button
												size='small'
												kind='ghost'
												tone='danger'
												onClick={(event: Event) => handleDeleteProject(project._id, event)}
											>
												Delete
											</z-button>
										</div>
									</div>
								)}
							</For>
						</div>
					</Show>
				</Show>
			</div>
		</div>
	)
}
