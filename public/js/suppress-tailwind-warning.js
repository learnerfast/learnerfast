// Suppress Tailwind CDN warning in production
(function() {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && message.includes('cdn.tailwindcss.com should not be used in production')) {
      return;
    }
    originalWarn.apply(console, args);
  };
})();
