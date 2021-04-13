// src/background/default.js

const defaults = {};

class DefaultBackground {
  constructor(options) {
    this.settings = { ...defaults, ...options };
  }

  render(renderer) {
    const {
      target,
      config: { columns, rows },
    } = renderer;
    // Cell width.
    const w = Math.floor(600 / columns);

    const tw = w * columns;
    const th = w * rows;
    const left = 0;
    const top = 0;

    const svg = [
      `<svg viewBox="0 0 ${tw} ${th}" xmlns="http://www.w3.org/2000/svg">`,
    ];
    let firstStyleIndex = 0;
    const styles = [
      'fill="rgba(250, 200, 150, 0.5)"',
      'fill="rgba(200, 150, 100, 0.5)"',
    ];
    let styleIndex;
    for (let row = 0; row < rows; ++row) {
      styleIndex = firstStyleIndex;
      firstStyleIndex = (firstStyleIndex + 1) % styles.length;
      const y = top + w * row;
      for (let col = 0; col < columns; ++col) {
        const s = styles[styleIndex];
        styleIndex = (styleIndex + 1) % styles.length;
        const x = left + w * col;
        svg.push(`<rect x="${x}" y="${y}" width="${w}" height="${w}" ${s}/>`);
      }
    }
    svg.push('</svg>');

    // @TODO refactor all of this into the renderer.
    // Create an absolutely positioned container to hold everything.
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = 0;
    container.style.left = 0;
    // Put the background inside the container;
    container.innerHTML = svg.join('');
    // This is where the renderer will put everthing.
    renderer.container = container;

    // Create a relatively positioned wrapper inside the target.
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    // The width and padding-top settings make the height responsive.
    wrapper.style.width = '100%';
    // Adjust this to get the correct aspect ratio.
    wrapper.style['padding-top'] = '100%';
    // Put the container inside the wrapper.
    wrapper.append(container);

    // Finally put the wrapper inside the target.
    target.append(wrapper);
  }
}

export { DefaultBackground };
