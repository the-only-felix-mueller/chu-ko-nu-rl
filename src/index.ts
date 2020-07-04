import { UI } from './ui/UI';

window.onload = function(): void {

    const ui = new UI();

    document.body.appendChild(ui.display.getContainer());

    document.onkeydown = (evt) => {
        ui.handleKeypress(evt);
    };

    ui.mainLoop();
}
