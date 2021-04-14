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
    // SVG cell width and height.
    const c = 1;

    const tw = c * columns;
    const th = c * rows;

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tw} ${th}" style="shape-rendering: crispEdges">`,
    ];
    let firstStyleIndex = 0;
    const styles = [
      'fill="#dda15e"', //  e6c185 e1b46c
      'fill="#bc6c25"', // b58863
      // 'fill="rgba(250, 200, 150, 0.5)"',
      // 'fill="rgba(200, 150, 100, 0.5)"',
    ];
    let styleIndex;
    for (let row = 0; row < rows; ++row) {
      styleIndex = firstStyleIndex;
      firstStyleIndex = (firstStyleIndex + 1) % styles.length;
      const y = c * row;
      for (let col = 0; col < columns; ++col) {
        const s = styles[styleIndex];
        styleIndex = (styleIndex + 1) % styles.length;
        const x = c * col;
        svg.push(`<rect x="${x}" y="${y}" width="${c}" height="${c}" ${s}/>`);
      }
    }
    svg.push('</svg>');
    return svg.join('');
  }
}

export { DefaultBackground };
