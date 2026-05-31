const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    await page.goto('http://localhost:5174/Pokemon/', { waitUntil: 'networkidle0' });
    
    // Click canvas to get focus
    await page.mouse.click(400, 300);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Press space to dismiss the 4 messages
    // Wait slightly longer between presses to let typing finish or skip
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Space');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    let state = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'FacilityScene');
      if (!scene) return "No scene";
      return { 
        x: scene.player.tileX, 
        y: scene.player.tileY, 
        isMoving: scene.player.isMoving,
        textBoxVisible: scene.textBox.isVisible()
      };
    });
    console.log("After dialog:", state);
    
    // Try to move
    await page.keyboard.down('ArrowUp');
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.keyboard.up('ArrowUp');
    
    state = await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'FacilityScene');
      return { 
        x: scene.player.tileX, 
        y: scene.player.tileY, 
        isMoving: scene.player.isMoving 
      };
    });
    console.log("After moving:", state);

    await browser.close();
  } catch (e) {
    console.error('Error in script:', e);
  }
})();
