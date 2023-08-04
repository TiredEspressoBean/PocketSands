import * as exports from '/scripts/game.js';
Object.entries(exports).forEach(([name, exported]) => window[name] = exported);