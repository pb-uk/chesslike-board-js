# chesslike-board

Presentation layer for chess-like games.

## Getting Started: in a web page

Current major browsers are supported but not Internet Explorer (edit `targets`
in `rollup.config.js` and run `npm run build` to change this).

Load the script from the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/chesslike-board@0.1"></script>
```

The module is exported as `ChesslikeBoard`:

```html
<script>
  document.write(ChesslikeBoard.version);
</script>
```

## Getting Started: in Node.js

Node >= 10 is currently supported in the distributed modules.

Install from `npm`:

```console
$ npm i chesslike-board
```

Require CommonJS module:

```js
// Default should work...
const ChesslikeBoard = require('chesslike-board');
// ...or specify CommonJS module.
const ChesslikeBoard = require('chesslike-board/dist/cjs');
```

or import as an ES6 module:

```js
// Default should work...
import ChesslikeBoard from 'chesslike-board';
// ...or specify ES6 module.
import ChesslikeBoard from 'chesslike-board/dist/esm';
```

## Using

## Documentation

## Contributing

## Important information

Copyright 2021 [pbuk](https://github.com/pbuk-uk/chesslike-board-js)
and distributed under the MIT License. See [LICENSE] for more information.

Icons included from:

- [Font Awesome](https://fontawesome.com/license/free) license:
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Contact

Please contact by raising an issue on
[GitHub](https://github.com/pbuk-uk/chesslike-board-js/issues);
all comments and suggestions are welcome.
