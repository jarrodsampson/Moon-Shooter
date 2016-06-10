var gameTitle = function(game){}
 
gameTitle.prototype = {
  	create: function(){
  		var w = 800, h = 600;                   // height and width of screen size

  		// The scrolling starfield background
        starfield = this.game.add.tileSprite(0, 0, 800, 600, 'starfield');

        var textDisplayGroup = this.game.add.physicsGroup();
        textDisplayGroup.alpha = 0;

        var gameTitle = this.game.add.text(w/2, h/2 - 200, 'Moon Shooter', { font: '40px Indie Flower', fill: '#ffffff' }, textDisplayGroup);  
	    gameTitle.anchor.setTo(0.5,0.5);

		var startGameButton = this.game.add.text(w/2, h/2 - 100, 'Start Game', { font: '30px Sniglet', fill: '#ffffff' }, textDisplayGroup);  
	    startGameButton.inputEnabled = true;
	    startGameButton.input.useHandCursor = true;
	    startGameButton.events.onInputUp.add(this.playTheGame, this);
	    startGameButton.anchor.setTo(0.5,0.5);

	    var startCreditsButton = this.game.add.text(w/2, h/2 + 0, 'Credits', { font: '30px Sniglet', fill: '#ffffff' }, textDisplayGroup);  
	    startCreditsButton.inputEnabled = true;
	    startCreditsButton.input.useHandCursor = true;
	    startCreditsButton.events.onInputUp.add(this.showCredits, this);
	    startCreditsButton.anchor.setTo(0.5,0.5);

	    var highScores = this.game.add.text(w/2, h/2 + 100, 'High Scores', { font: '30px Sniglet', fill: '#ffffff' }, textDisplayGroup);  
	    highScores.anchor.setTo(0.5,0.5);

	    var helpButton = this.game.add.text(w/2, h/2 + 200, 'Help/Instructions', { font: '30px Sniglet', fill: '#ffffff' }, textDisplayGroup);  
	    helpButton.inputEnabled = true;
	    helpButton.input.useHandCursor = true;
	    helpButton.events.onInputUp.add(this.showInstructions, this);
	    helpButton.anchor.setTo(0.5,0.5);

	    // Adding the fading animations to the stars and rocks
        this.game.add.tween(textDisplayGroup).to({
            alpha: 1
        }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);


	    // set storage
	    if(localStorage.getItem('highscores') === null){       
	        localStorage.setItem('highscores', "[]");
	        console.log("Added HighScores");
	     }

	     if(localStorage.getItem('bestScore') === null){       
	        localStorage.setItem('bestScore', "");
	        console.log("Added BestScore");
	     }

	     console.log(JSON.parse(localStorage.getItem('highscores')).length);
		if (JSON.parse(localStorage.getItem('highscores')).length >= 1) {
			highScores.inputEnabled = true;
		    highScores.input.useHandCursor = true;
		    highScores.events.onInputUp.add(this.highScores, this);
		} else {
			highScores.fill = '#565656';
		}
	},
	update: function(){
          //  Scroll the background
        starfield.tilePosition.y += 2;
        starfield.tilePosition.x += 3;
	},
	playTheGame: function(){
		this.game.state.start("TheGame");
	},
	highScores: function(){
		this.game.state.start("GameOver");
	},
	showCredits: function(){
		this.game.state.start("TheCredits");
	},
	showInstructions: function(){
		this.game.state.start("Help");
	}
}