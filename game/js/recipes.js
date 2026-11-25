// WARUNG RUSH — recipes.js
// Every dish, ingredient and station rule for the warung.
// A dish is a set of cooked components; each raw ingredient is
// processed at exactly one station, then flows to the order board.

export const INGREDIENTS = {
  rice:    { id: 'rice',    name: 'Rice',    key: '1', station: 'wok',   cookTime: 3.0, color: '#f5e6c4', dark: '#c9a86a', emoji: '🍚' },
  noodle:  { id: 'noodle',  name: 'Noodles', key: '2', station: 'wok',   cookTime: 3.0, color: '#f7c948', dark: '#c98f1b', emoji: '🍜' },
  chicken: { id: 'chicken', name: 'Chicken', key: '3', station: 'grill', cookTime: 4.0, color: '#e07840', dark: '#9c4a1e', emoji: '🍗' },
  egg:     { id: 'egg',     name: 'Egg',     key: '4', station: 'wok',   cookTime: 2.0, color: '#fdf3d0', dark: '#e0b64f', emoji: '🥚' },
  chili:   { id: 'chili',   name: 'Chili',   key: '5', station: 'chop',  cookTime: 1.5, color: '#e23b2e', dark: '#8f1d12', emoji: '🌶️' },
  greens:  { id: 'greens',  name: 'Greens',  key: '6', station: 'chop',  cookTime: 1.5, color: '#4da34d', dark: '#2c6b2c', emoji: '🥬' },
  tea:     { id: 'tea',     name: 'Tea',     key: '7', station: 'pot',   cookTime: 2.0, color: '#a8642a', dark: '#6e3f16', emoji: '🍵' },
  ice:     { id: 'ice',     name: 'Ice',     key: '8', station: null,    cookTime: 0,   color: '#bfe8f5', dark: '#5fa8c4', emoji: '🧊' },
};

export const INGREDIENT_ORDER = ['rice', 'noodle', 'chicken', 'egg', 'chili', 'greens', 'tea', 'ice'];

export const STATIONS = {
  wok:   { id: 'wok',   name: 'WOK',       verb: 'Stir-fry', color: '#e07840' },
  grill: { id: 'grill', name: 'GRILL',     verb: 'Grill',    color: '#c0392b' },
  chop:  { id: 'chop',  name: 'CHOP',      verb: 'Chop',     color: '#8a6d3b' },
  pot:   { id: 'pot',   name: 'TEAPOT',    verb: 'Brew',     color: '#7a5c9e' },
};

export const RECIPES = [
  {
    id: 'nasi-goreng', name: 'Fried Rice', short: 'FRIED RICE', price: 35,
    needs: ['rice', 'egg', 'chili'], color: '#e07840',
    blurb: 'Fried rice + egg + chili',
  },
  {
    id: 'mie-ayam', name: 'Chicken Noodles', short: 'NOODLES', price: 40,
    needs: ['noodle', 'chicken', 'greens'], color: '#f7c948',
    blurb: 'Noodles + grilled chicken + greens',
  },
  {
    id: 'sate-ayam', name: 'Chicken Satay', short: 'SATAY', price: 38,
    needs: ['chicken', 'chili', 'greens'], color: '#c0392b',
    blurb: 'Grilled satay + chili + greens',
  },
  {
    id: 'es-teh', name: 'Iced Tea', short: 'ICED TEA', price: 12,
    needs: ['tea', 'ice'], color: '#7fb3d5',
    blurb: 'Hot tea + ice',
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

export function stationForIngredient(ingId) {
  return INGREDIENTS[ingId] ? INGREDIENTS[ingId].station : null;
}

// Weighted pick: cheap drinks appear less often at dinner rush.
export function pickRecipe(shift, rand) {
  const pool = shift >= 3
    ? ['nasi-goreng', 'nasi-goreng', 'mie-ayam', 'mie-ayam', 'sate-ayam', 'sate-ayam', 'es-teh']
    : ['nasi-goreng', 'nasi-goreng', 'mie-ayam', 'sate-ayam', 'es-teh', 'es-teh'];
  return recipeById(pool[Math.floor(rand() * pool.length)]);
}
