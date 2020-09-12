import { UI } from './ui/UI'

/**
 * This is the entry point of the whole program.
 *
 * An UI object is created, which in turn creates and manages a game world.
 * This display of the UI object is added to the DOM and then the main game
 * loop is started.
 *
 * The UI references the game model (`World`) like a player in a casino interacts
 * with the game through the croupier. The world doesn't reference the UI.
 */
window.onload = async function (): Promise<void> {
  const ui = new UI()
  const uiPlaceholder = document.getElementById('ui-placeholder')
  const mainUI = ui.display.getContainer()
  uiPlaceholder.appendChild(mainUI)

  ui.mainLoop()
}
