// src/background/default.js

const defaults = {};

class DefaultBackground {
  constructor(options) {
    this.settings = { ...defaults, ...options };
  }

  render(renderer) {
    const {
      config: { columns, rows },
    } = renderer;
    // SVG cell width.
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
    return svg.join('');
  }
}

export { DefaultBackground };
