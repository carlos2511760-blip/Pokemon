import Phaser from 'phaser';

/**
 * GBA-style typewriter text box for NPC dialogs and messages.
 * Fixed to camera (scrollFactor 0), positioned at bottom of 240x160 viewport.
 */
export default class TextBox {
  constructor(scene) {
    this.scene = scene;
    this.messages = [];
    this.currentIndex = 0;
    this.currentText = '';
    this.fullText = '';
    this.charIndex = 0;
    this.typing = false;
    this._visible = false;
    this.onComplete = null;
    this.charDelay = 30; // ms per character
    this.typeTimer = 0;

    // --- Background box ---
    this.graphics = scene.add.graphics();
    this.graphics.setScrollFactor(0);
    this.graphics.setDepth(900);
    this.graphics.setVisible(false);

    // --- Dialog text ---
    this.text = scene.add.text(8, 125, '', {
      fontSize: '7px',
      fontFamily: '"Press Start 2P", monospace',
      fill: '#ffffff',
      wordWrap: { width: 220 },
      lineSpacing: 4
    });
    this.text.setScrollFactor(0);
    this.text.setDepth(901);
    this.text.setVisible(false);

    // --- Blinking advance indicator ▼ ---
    this.indicator = scene.add.text(226, 152, '\u25bc', {
      fontSize: '6px',
      fontFamily: 'monospace',
      fill: '#ffffff'
    });
    this.indicator.setScrollFactor(0);
    this.indicator.setDepth(901);
    this.indicator.setVisible(false);

    // Blink timer
    this.blinkTimer = scene.time.addEvent({
      delay: 400,
      callback: () => {
        if (this.indicator.visible) {
          this.indicator.setAlpha(this.indicator.alpha === 1 ? 0.2 : 1);
        }
      },
      loop: true
    });

    // --- Input Keys ---
    this.spaceKey = scene.input.keyboard.addKey('SPACE');
    this.enterKey = scene.input.keyboard.addKey('ENTER');
  }

  /**
   * Draw the text box background
   */
  _drawBox() {
    this.graphics.clear();
    // Outer border (white)
    this.graphics.lineStyle(1, 0xffffff, 1);
    // Inner fill (dark)
    this.graphics.fillStyle(0x101828, 0.95);
    this.graphics.fillRoundedRect(3, 120, 234, 38, 4);
    this.graphics.strokeRoundedRect(3, 120, 234, 38, 4);
    // Inner border highlight
    this.graphics.lineStyle(1, 0x4488cc, 0.5);
    this.graphics.strokeRoundedRect(5, 122, 230, 34, 3);
  }

  /**
   * Show the text box with an array of messages displayed sequentially.
   * @param {string[]} messages - Array of strings to display one at a time
   * @param {Function} onComplete - Called after all messages have been shown
   */
  show(messages, onComplete) {
    if (!messages || messages.length === 0) return;

    this.messages = messages;
    this.currentIndex = 0;
    this.onComplete = onComplete || null;
    this._visible = true;

    this._drawBox();
    this.graphics.setVisible(true);
    this.text.setVisible(true);

    this._startTyping(messages[0]);
  }

  /**
   * Begin typewriter effect for a single message
   */
  _startTyping(message) {
    this.fullText = message;
    this.currentText = '';
    this.charIndex = 0;
    this.typing = true;
    this.typeTimer = 0;
    this.indicator.setVisible(false);
    this.text.setText('');
  }

  /**
   * Must be called from scene's update loop for the typewriter effect
   */
  update(time, delta) {
    if (!this._visible) return;

    // Typewriter character rendering
    if (this.typing) {
      this.typeTimer += delta;
      while (this.typeTimer >= this.charDelay && this.charIndex < this.fullText.length) {
        this.charIndex++;
        this.typeTimer -= this.charDelay;
      }
      this.text.setText(this.fullText.substring(0, this.charIndex));

      if (this.charIndex >= this.fullText.length) {
        this.typing = false;
        this.indicator.setVisible(true);
      }
    }

    // Advance on Space/Enter
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.advance();
    }
  }

  /**
   * Advance to next message or skip typewriter
   */
  advance() {
    if (!this._visible) return;

    if (this.typing) {
      // Skip to full text instantly
      this.typing = false;
      this.charIndex = this.fullText.length;
      this.text.setText(this.fullText);
      this.indicator.setVisible(true);
      return;
    }

    // Next message
    this.currentIndex++;
    if (this.currentIndex < this.messages.length) {
      this._startTyping(this.messages[this.currentIndex]);
    } else {
      this.hide();
      if (this.onComplete) this.onComplete();
    }
  }

  /**
   * Hide the text box
   */
  hide() {
    this._visible = false;
    this.graphics.setVisible(false);
    this.text.setVisible(false);
    this.indicator.setVisible(false);
    this.typing = false;
  }

  /**
   * @returns {boolean} true if the text box is currently visible
   */
  isVisible() {
    return this._visible;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.blinkTimer) this.blinkTimer.remove();
    this.graphics.destroy();
    this.text.destroy();
    this.indicator.destroy();
  }
}
