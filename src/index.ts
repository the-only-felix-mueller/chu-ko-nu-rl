import { UI } from './ui/UI'

window.onload = function (): void {
  const ui = new UI()

  document.body.appendChild(ui.display.getContainer())

  let locked = false

  document.onkeydown = async (evt) => {
    if (!locked) {
      locked = true
      await ui.keydownHandler(evt)
      locked = false
    }
  }

  ui.mainLoop()
}
