import { createSignal, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { signInWithPassword, getAuthError, type PasswordFlowT } from './authStore'

const MIN_PASSWORD_LENGTH = 8

export const AuthPage = () => {
	const navigate = useNavigate()
	const [flow, setFlow] = createSignal<PasswordFlowT>('signIn')
	const [email, setEmail] = createSignal('')
	const [password, setPassword] = createSignal('')
	const [isSubmitting, setIsSubmitting] = createSignal(false)
	const [localError, setLocalError] = createSignal<string | null>(null)

	const isSignUp = () => flow() === 'signUp'
	const displayedError = () => localError() ?? getAuthError()

	// z-input wraps a native <input>; that native `input` event is composed by
	// default, so it also bubbles out of the shadow root alongside Atomico's own
	// custom `input` event (the one carrying `.detail`). The listener below sees
	// both — ignore the native one (no `.detail`) and act only on the custom one.
	//
	// Below, the fields are intentionally UNCONTROLLED — do not add
	// value={signal()} back onto <z-input>. Confirmed via instrumented testing
	// that doing so races Atomico's own internal `useProp` state: Solid's effect
	// re-writes the host's `value` property with the pre-keystroke signal value
	// a tick after Atomico already updated it from the keystroke, stomping every
	// typed character back to empty (selectionStart resets to 0 too). z-input's
	// own shadow-DOM state is the single source of truth for what's displayed;
	// these signals just mirror it for reading at submit time.
	const handleInput = (event: CustomEvent<{ value: string }>, setter: (value: string) => void) => {
		if (event.detail === undefined) return
		// @ts-ignore
		setter(event.target.value)
	}

	const submitAuth = async () => {
		setLocalError(null)

		if (isSignUp() && password().length < MIN_PASSWORD_LENGTH) {
			setLocalError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
			return
		}

		setIsSubmitting(true)
		const succeeded = await signInWithPassword(email(), password(), flow())
		setIsSubmitting(false)
		if (succeeded) navigate('/')
	}

	// z-button renders its native <button> inside its OWN shadow root, so even
	// with type="submit" a click doesn't reliably cross that shadow boundary to
	// trigger this <form>'s submit event (z-button isn't a form-associated
	// custom element via ElementInternals). Handle the click directly instead;
	// keep onSubmit too so pressing Enter in a field still works.
	const handleFormSubmit = (event: Event) => {
		event.preventDefault()
		void submitAuth()
	}

	const toggleFlow = () => {
		setLocalError(null)
		setFlow(isSignUp() ? 'signIn' : 'signUp')
	}

	return (
		<div class='authPage'>
			<div class='authCard'>
				<div class='authBrand'>
					<z-text size='xxl' weight='700'>
						amore
					</z-text>
					<z-text color='muted' size='sm' tag='p'>
						Draw a rhythm once. Let the chords decide the notes.
					</z-text>
				</div>

				<form class='authForm' onSubmit={handleFormSubmit}>
					<div class='authFields'>
						<label class='authField'>
							<z-label size='sm'>Email</z-label>
							<z-input
								type='email'
								name='email'
								autocomplete='email'
								placeholder='you@example.com'
								isRequired
								on:input={(event: any) => handleInput(event, setEmail)}
							/>
						</label>

						<label class='authField'>
							<z-label size='sm'>Password</z-label>
							<z-input
								type='password'
								name='password'
								autocomplete={isSignUp() ? 'new-password' : 'current-password'}
								placeholder='At least 8 characters'
								isRequired
								on:input={(event: any) => handleInput(event, setPassword)}
							/>
						</label>
					</div>

					<Show when={displayedError()}>
						<p class='authError'>{displayedError()}</p>
					</Show>

					<z-button type='button' isFullWidth isLoading={isSubmitting()} onClick={submitAuth}>
						{isSignUp() ? 'Create account' : 'Sign in'}
					</z-button>
				</form>

				<button type='button' class='authSwitch' onClick={toggleFlow}>
					{isSignUp() ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
				</button>
			</div>
		</div>
	)
}
