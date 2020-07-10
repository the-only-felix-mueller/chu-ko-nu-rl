import { UI } from './ui/UI'

window.onload = function (): void {
  const ui = new UI()

  document.body.appendChild(ui.display.getContainer())

  let locked = false

  document.onkeydown = async (evt) => {
    await ui.keydownHandler(evt)
  }

  ui.mainLoop()
}
