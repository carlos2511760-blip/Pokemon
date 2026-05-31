import IBattleCommand from '../IBattleCommand.js';
import { getEffectiveness } from '../../data/typechart.js';

export default class AttackCommand extends IBattleCommand {
  /**
   * @param {Pokemon} source
   * @param {Pokemon} target
   * @param {object} move - The move data from MOVES
   */
  constructor(source, target, move) {
    super('attack', source, target, 0); // most attacks are priority 0
    this.move = move;
    
    // Quick attack has priority 1
    if (move.id === 'quickAttack') {
      this.priority = 1;
    }
  }

  execute(engine) {
    const events = [];

    // Check if source can attack (alive, not sleeping, etc)
    if (!this.source.isAlive()) return events;

    // Emit use move event
    events.push({
      type: 'text',
      text: `${this.source.name} used ${this.move.name}!`
    });

    events.push({
      type: 'animation',
      anim: 'attack',
      source: this.source === engine.playerPokemon ? 'player' : 'enemy',
      target: this.target === engine.playerPokemon ? 'player' : 'enemy'
    });

    // Accuracy check
    const accuracy = this.move.accuracy || 100;
    if (Math.random() * 100 > accuracy) {
      events.push({ type: 'text', text: `${this.source.name}'s attack missed!` });
      return events;
    }

    // Damage Calculation (Gen 3 formula simplified)
    const level = this.source.level;
    const power = this.move.power || 0;
    
    if (power > 0) {
      let attackStat = this.move.category === 'special' 
        ? this.source.attack // Simplified: we don't have Sp.Atk in this codebase yet
        : this.source.attack;
      
      let defenseStat = this.move.category === 'special'
        ? this.target.defense
        : this.target.defense;

      // Base damage
      let damage = Math.floor(Math.floor(Math.floor(2 * level / 5 + 2) * power * attackStat / defenseStat) / 50) + 2;

      // STAB (Same Type Attack Bonus)
      if (this.source.types.includes(this.move.type)) {
        damage = Math.floor(damage * 1.5);
      }

      // Type Effectiveness
      const effectiveness = getEffectiveness(this.move.type, this.target.types);
      damage = Math.floor(damage * effectiveness);

      // Random factor (0.85 to 1.0)
      const randomFactor = (Math.floor(Math.random() * 16) + 85) / 100;
      damage = Math.floor(damage * randomFactor);

      // Critical Hit (approx 6.25%)
      let isCrit = false;
      if (Math.random() < 0.0625) {
        isCrit = true;
        damage = Math.floor(damage * 1.5);
      }

      // Ensure at least 1 damage if effectiveness is > 0
      if (effectiveness > 0 && damage === 0) damage = 1;

      // Apply damage
      if (damage > 0) {
        this.target.takeDamage(damage);
        events.push({
          type: 'damage',
          target: this.target === engine.playerPokemon ? 'player' : 'enemy',
          amount: damage,
          newHp: this.target.currentHp,
          maxHp: this.target.maxHp
        });

        if (isCrit) {
          events.push({ type: 'text', text: 'A critical hit!' });
        }

        if (effectiveness > 1) {
          events.push({ type: 'text', text: "It's super effective!" });
        } else if (effectiveness < 1 && effectiveness > 0) {
          events.push({ type: 'text', text: "It's not very effective..." });
        } else if (effectiveness === 0) {
          events.push({ type: 'text', text: `It doesn't affect ${this.target.name}...` });
        }
      }
    }

    return events;
  }
}
