var preload = function(game){var loadingBar = "";}
 
preload.prototype = {
	preload: function(){ 
          loadingBar = this.add.sprite(160,240,"loading");
          loadingBar.anchor.setTo(0.5,0.5);
          loadingBar.alpha = 0;
          this.load.setPreloadSprite(loadingBar);
		this.game.load.baseURL = 'assets/';
	    this.game.load.crossOrigin = 'anonymous';
	    
	    this.game.load.image('sky', 'backgrounds/starfield.png');
	    this.game.load.image('starfield', 'backgrounds/starfield.png');
	    this.game.load.image('starfield2', 'backgrounds/starfield2.png');
	    this.game.load.image('starfield3', 'backgrounds/starfield3.jpg');
	    this.game.load.image('starfield4', 'backgrounds/starfield4.gif');
	    this.game.load.image('platform', 'backgrounds/platform1.jpg');
	    this.game.load.image('star', 'game/star.png');
	    this.game.load.image('rock', 'game/asteroid1.png');
	    this.game.load.image('healthLife', 'game/firstaid.png');
	    this.game.load.spritesheet('kaboom', 'game/explode.png', 128, 128);
	    this.game.load.image('trophy', 'game/trophy.png');
	    this.game.load.image('soundIcon', 'game/soundIcon.png');
	    this.game.load.image('soundIconDisabled', 'game/soundIconDisabled.png');
	    this.game.load.image('backButton', 'game/backButton.png');

	    // game menu
	    this.game.load.spritesheet('menu', 'game/fullMenu.png', 800, 800);
		// game levels
		this.game.load.text('levels', 'game/levels.json');
	    // bonus levels
	    this.game.load.text('bonusLevels', 'game/bonus_levels.json');

	    this.game.load.spritesheet('player', 'game/dude.png', 32, 48);
	    
	    // game audio
	    this.game.load.audio('blast', ['audio/blaster.mp3']);
	    this.game.load.audio('walking', ['audio/steps2.mp3']);
	    this.game.load.audio('explosion', ['audio/explosion.mp3']);
	    this.game.load.audio('healthpacksound', ['audio/chest-grab.mp3']);
	    this.game.load.audio('winsong', ['audio/winsong.mp3']);
	    this.game.load.audio('timesupsound', ['audio/timesup.mp3']);
	    this.game.load.audio('nextLevelSound', ['audio/nextLevelSound.mp3']);
	    this.game.load.audio('livesLost', ['audio/livesLost.mp3']);
	},
  	create: function(){

  		var brandText = this.game.add.text(w/2, h/2 - 100, 'Planlodge Games', { font: '32px Sniglet', fill: '#ffffff' });  
  		brandText.anchor.setTo(0.5,0.5);
		brandText.alpha = 0;

        // Adding the fading animations to the stars and rocks
        this.game.add.tween(brandText).to({
            alpha: 1
        }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);


  		this.game.time.events.add(Phaser.Timer.SECOND * 3,function () {this.game.state.start("GameTitle"); }, this);
	}
}