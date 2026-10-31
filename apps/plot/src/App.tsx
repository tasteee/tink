import { GameScene } from './scene/GameScene'
import { Hud } from './hud/Hud'

export const App = () => {
	return (
		<main className="app">
			<GameScene />
			<Hud />
		</main>
	)
}
