const rateLimit = new Map();

export function rateLimiter(options = {}) {
  const {
    interval = 60 * 1000,
    uniqueTokenPerInterval = 500,
  } = options;

  return {
    check: (limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = rateLimit.get(token) || [0];
        if (tokenCount[0] === 0) {
          rateLimit.set(token, [1, Date.now()]);
          resolve();
        } else if (tokenCount[0] < limit) {
          tokenCount[0]++;
          resolve();
        } else {
          const diff = Date.now() - tokenCount[1];
          if (diff > interval) {
            rateLimit.set(token, [1, Date.now()]);
            resolve();
          } else {
            reject(new Error('Rate limit exceeded'));
          }
        }

        if (rateLimit.size >= uniqueTokenPerInterval) {
          rateLimit.clear();
        }
      }),
  };
}
