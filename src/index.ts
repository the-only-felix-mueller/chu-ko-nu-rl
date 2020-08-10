import { UI } from './ui/UI'

window.onload = async function (): Promise<void> {
  const ui = new UI()
  document.body.appendChild(ui.display.getContainer())
  ui.mainLoop()
}
