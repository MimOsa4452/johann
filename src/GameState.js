export const INITIAL_STATE = {
  score:      0,
  timeLeft:   90,
  phase:      'idle',
  roundCount: 0,
};

export function createGameState(scene) {
  let state = { ...INITIAL_STATE };

  return {
    get()          { return { ...state }; },
    setState(patch) {
      state = { ...state, ...patch };
      scene.events.emit('stateChange', { ...state });
    },
    reset() {
      state = { ...INITIAL_STATE };
      scene.events.emit('stateChange', { ...state });
    },
  };
}
