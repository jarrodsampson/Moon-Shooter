var help = function(game){
	console.log("Help/Instructions");
};
  
help.prototype = {
	preload: function(){
          this.game.load.image("cursor","game/cursor-instr.png"); 
          this.game.load.image("pause","game/pauseButton.png"); 
          this.game.load.image("spacebar","game/spacebar.png"); 
	},
  	create: function(){

  		// The scrolling starfield background
        starfield = this.game.add.tileSprite(0, 0, 800, 600, 'starfield');

        var startGameText = this.game.add.text(w/2, h/2 - 250, 'Instructions', { font: '40px Indie Flower', fill: '#ffffff' });  
  		startGameText.anchor.setTo(0.5,0.5);

  		var startGameText = this.game.add.text(w/2, h/2 - 200, 'Controls to Play the Game', { font: '30px Sniglet', fill: '#ffffff' });  
  		startGameText.anchor.setTo(0.5,0.5);
		

		var backButton = this.add.sprite(50,50,"backButton");
        backButton.anchor.setTo(0.5,0.5);
        backButton.scale.setTo(0.3, 0.3);
        backButton.inputEnabled = true;
	    backButton.input.useHandCursor = true;
	    backButton.events.onInputUp.add(this.mainMenu, this);


	    var cursorKeys = this.game.add.sprite(w/2 - 100, h/2 - 50, 'cursor');
	    cursorKeys.scale.setTo(0.6, 0.6);
        cursorKeys.anchor.setTo(0.5,0.5);

        var pauseKey = this.game.add.sprite(w/2 + 200, h/2 - 50, 'pause');
        pauseKey.scale.setTo(0.6, 0.6);
        pauseKey.anchor.setTo(0.5,0.5);

        var spacebar = this.game.add.sprite(w/2, h/2 + 200, 'spacebar');
        spacebar.scale.setTo(0.6, 0.6);
        spacebar.anchor.setTo(0.5,0.5);

		
	},
	update: function(){
          //  Scroll the background
        starfield.tilePosition.y += 2;
        starfield.tilePosition.x += 3;
	},
	mainMenu: function(){
          this.game.state.start("GameTitle");
	}
}