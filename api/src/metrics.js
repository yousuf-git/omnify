export const state = {
  reqTotal: 0,
  req5xx: 0,
  reqWindow: [], // timestamps of last 60s of requests
};

export function recordRequest(statusCode) {
  state.reqTotal++;
  const now = Date.now();
  state.reqWindow.push(now);
  state.reqWindow = state.reqWindow.filter((t) => now - t < 60_000);
  if (statusCode >= 500) state.req5xx++;
}

export function getReqPerMinute() {
  const now = Date.now();
  state.reqWindow = state.reqWindow.filter((t) => now - t < 60_000);
  return parseFloat(state.reqWindow.length.toFixed(1));
}

// Event-loop lag sampler (ms)
export let eventLoopLag = 0;
(function sampleLag() {
  const start = Date.now();
  setImmediate(() => {
    eventLoopLag = Date.now() - start;
    setTimeout(sampleLag, 1000);
  });
})();
