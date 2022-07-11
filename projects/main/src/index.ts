import container from './container.xml';
import './head';
import { render as renderPrivilege } from './render-privilege';
import { render as renderScript } from './render-script';

container();

let isRender = false;
function render() {
  if (!renderPrivilege()) {
    if (!isRender) {
      renderScript();

      isRender = true;
    }
  }
}

ui.console.click(() => {
  app.startActivity('console');
});

ui.emitter.on('resume', () => {
  render();
});

render();
