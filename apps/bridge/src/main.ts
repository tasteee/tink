import "./zest"
import "./app.css"
import App from "./App.svelte"
import { mount } from "svelte"

const rootElement = document.getElementById("root")
if (rootElement === null) throw new Error("Missing #root element")

const app = mount(App, { target: rootElement })
export default app
