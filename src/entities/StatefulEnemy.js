import Enemy from "./Enemy";

export default class StatefulEnemy extends Enemy {
  constructor(scene, x, y, spriteKey) {
    super(scene, x, y, spriteKey);
    this.state = null;
    this._timers = [];
  }

  // ===== Sistema de estados =====
  setState(newState, onEnter) {
    if (this.state === newState) return;
    this.exitState?.(this.state);
    this.state = newState;
    if (onEnter) onEnter();
  }

  // Método opcional que subclases pueden sobrescribir
  exitState(prevState) {
    // Por ejemplo, cancelar animaciones o timers al salir de un estado
  }

  // ===== Timers centralizados =====
  setTimer(delay, callback) {
    const timer = this.scene.time.delayedCall(delay, callback);
    this._timers.push(timer);
    return timer;
  }

  clearTimers() {
    this._timers.forEach(t => t.remove(false));
    this._timers = [];
  }

  destroy() {
    this.clearTimers();
    super.destroy?.();
  }
}
