var context = require.context('./e2e/auth.e2e.js', true, /\.(jsx|js)?$/);
context.keys().forEach(context);