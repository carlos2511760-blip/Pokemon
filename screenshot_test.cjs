const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set a standard game resolution size (e.g. 800x600)
  await page.setViewport({ width: 800, height: 600 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    } else {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:5174/Pokemon/');

  console.log('Waiting for Phaser to load...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.screenshot({ path: 'screenshot_before_dialog.png' });

  // Get TextBox status before keypress
  let state = await page.evaluate(() => {
    const scene = window.__PHASER_GAME__.scene.getScene('FacilityScene');
    return {
      visible: scene.textBox ? scene.textBox.isVisible() : false,
      text: scene.textBox ? scene.textBox.text.text : '',
      charIndex: scene.textBox ? scene.textBox.charIndex : 0,
      fullText: scene.textBox ? scene.textBox.fullText : ''
    };
  });
  console.log('Before keypress:', state);

  // Press Space multiple times to skip dialog
  for (let i = 0; i < 10; i++) {
    await page.keyboard.down('Space');
    await new Promise(resolve => setTimeout(resolve, 50));
    await page.keyboard.up('Space');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  await page.screenshot({ path: 'screenshot_after_dialog.png' });

  state = await page.evaluate(() => {
    const scene = window.__PHASER_GAME__.scene.getScene('FacilityScene');
    return {
      x: scene.player.tileX,
      y: scene.player.tileY,
      isMoving: scene.player.isMoving,
      textBoxVisible: scene.textBox.isVisible()
    };
  });
  console.log('After dialogs:', state);

  // Try to move UP
  console.log('Moving UP...');
  await page.keyboard.down('w'); // W key for WASD
  await new Promise(resolve => setTimeout(resolve, 400));
  await page.keyboard.up('w');
  await new Promise(resolve => setTimeout(resolve, 400));
  
  await page.screenshot({ path: 'screenshot_after_move.png' });

  state = await page.evaluate(() => {
    const scene = window.__PHASER_GAME__.scene.getScene('FacilityScene');
    return {
      x: scene.player.tileX,
      y: scene.player.tileY,
      isMoving: scene.player.isMoving
    };
  });
  console.log('After moving UP:', state);

  await browser.close();
})();
