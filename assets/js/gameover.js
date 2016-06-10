var gameOver = function(game){
	console.log("Game Over");
};
  
gameOver.prototype = {
	preload: function(){
          
	},
  	create: function(){
		
		// The scrolling starfield background
        starfield = this.game.add.tileSprite(0, 0, 800, 600, 'starfield');

        backButton = this.add.sprite(50,50,"backButton");
        backButton.anchor.setTo(0.5,0.5);
        backButton.scale.setTo(0.3, 0.3);
        backButton.inputEnabled = true;
	    backButton.input.useHandCursor = true;
	    backButton.events.onInputUp.add(this.mainMenu, this);

	    var highScoreText = this.game.add.text(w/2, h/2 - 250, 'High Scores', { font: '40px Indie Flower', fill: '#ffffff' });  
  		highScoreText.anchor.setTo(0.5,0.5);

	    // show UI
	    var playerScores = [];
        playerScores = JSON.parse(localStorage.getItem('highscores'));

        scoreBoard = this.game.add.text(
            w / 2, 140,
            'Your Scores: \n' + this.displayScoreLayout(playerScores, localStorage.getItem('bestScore')), {
                font: '30px Sniglet',
                fill: '#fff'
            }
        );
        scoreBoard.anchor.setTo(0.5, 0.1);
		
	},
	update: function(){
          //  Scroll the background
        starfield.tilePosition.y += 2;
        starfield.tilePosition.x += 3;
	},
	mainMenu: function(){
          this.game.state.start("GameTitle");
	},
	displayScoreLayout: function(playerScores, playerBest) {
        var scoreBoardData = "";
        var spacing = 20;
        scoreBoardFullData = this.game.add.physicsGroup();
        scoreBoardFullData.alpha = 0;

        for (var i = 0; i < playerScores.length; ++i) {
            var numCountDisplay = i + 1;

            // add scoreboard display ui
            var scoresList = this.game.add.text(
                w / 2 - 65, h / 2 - 140 + spacing,
                numCountDisplay + ". " + playerScores[i] + " points \n", {
                    font: '25px Arial',
                    fill: '#fff'
                },
                scoreBoardFullData
            );

            spacing += 40;
        }

        // add player best
        var bestplayerTitle = this.game.add.text(
            50, h / 2 + 100,
            "Your Best Score:", {
                font: '25px Sniglet',
                fill: '#fff'
            },
            scoreBoardFullData
        );

        var bestPlayerScore = this.game.add.text(
            0, h / 2 + 150,
            playerBest, {
                font: '45px Sniglet',
                fill: '#fff'
            },
            scoreBoardFullData
        );

        endGameTrophy = this.game.add.sprite(110, 800, 'trophy');
        endGameTrophy.scale.setTo(0.1, 0.1);
        endGameTrophy.angle = 10;

        this.game.add.tween(scoreBoardFullData).to({
            alpha: 1
        }, 1500, Phaser.Easing.Linear.None, true, 0, 0, true);

        var zoomTween = this.game.add.tween(bestplayerTitle.scale);
        zoomTween.to({
            x: 1.5,
            y: 1.5
        }, 800, Phaser.Easing.Elastic.Out);
        zoomTween.onComplete.addOnce(function() {
            zoomTween.to({
                x: 1,
                y: 1
            }, 300, Phaser.Easing.Elastic.Out);
        }, this);
        zoomTween.start();

        var moveTween = this.game.add.tween(bestPlayerScore);
        moveTween.to({
            x: 90
        }, 1100, Phaser.Easing.Linear.None);
        moveTween.start();

        var moveTweeny = this.game.add.tween(endGameTrophy);
        moveTweeny.to({
            y: h / 2 + 200
        }, 1100, Phaser.Easing.Linear.None);
        moveTweeny.start();




        return scoreBoardData;
    },
}