import { UI } from './ui/UI'

window.onload = async function (): Promise<void> {
  const ui = new UI()
  const uiPlaceholder = document.getElementById('ui-placeholder')
  const mainUI = ui.display.getContainer()
  console.log(`${uiPlaceholder} --- ${mainUI}`);
  // uiPlaceholder.parentNode.replaceChild(mainUI, uiPlaceholder)
  uiPlaceholder.appendChild(mainUI)
  
  ui.mainLoop()
}
