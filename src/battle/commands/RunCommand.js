import IBattleCommand from './IBattleCommand.js';

export default class RunCommand extends IBattleCommand {
  constructor(source, target) {
    super('run', source, target, 6); // Priority 6 (very high)
  }

  execute(engine) {
    const events = [];
    
    // Simplistic run check based on speed
    const playerSpeed = this.source.speed;
    const enemySpeed = this.target.speed;
    
    // In a real game there are attempts counters, but we'll do simple check
    let success = false;
    if (playerSpeed >= enemySpeed) {
      success = true;
    } else {
      const chance = (playerSpeed * 32) / Math.floor((enemySpeed / 4) % 256) + 30;
      success = (Math.random() * 256) < chance;
    }

    if (success) {
      events.push({ type: 'text', text: 'Got away safely!' });
      events.push({ type: 'run_success' });
      engine.battleOver = true;
      engine.result = 'run';
    } else {
      events.push({ type: 'text', text: "Couldn't escape!" });
    }

    return events;
  }
}
