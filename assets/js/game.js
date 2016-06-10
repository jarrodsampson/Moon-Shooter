"use strict";

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

// variables user
var starfield;                          // scrolling background
var player;                             // our player
var platforms;                          // player collisions will use this 
var stars, rocks;                       // game interactions
var cursors;                            // arrow keys to move
var jumpButton;                         // spacebar jumping init
var pauseButton;                        // P button init for pause Menu
var score = 0;                          // score for our game
var scoreText, timerText;               // displays for score
var pause_label, choiseLabel;           // displays fpr pause and choice label
var w = 800, h = 600;                   // height and width of screen size
var music, walkmusic, timerEndMusic;    // audio for game
var timer, rockReleaseTimer;            // timers for game setup, one for level time, one for rocks
var menu;                               // our temp game menu
var remainingStars = [];                // hold number of remaining stars from level to know when the game is done
var rocksYouHit = 0;                    // rocks hit starting at zero every level
var endScoreText;                       // display for game end message
var lives, remainingLives, live;        // vars for lives tracking throughout the game
var explosions;                         // explosions on rock hits
var highScore;                          // tell whether or not the player can move on to the next level
var timerTotal;                         // total number of seconds the timer has left
var levelData, bonusLevelData;          // level and bonus data gathered from json file
var indexedLevel = 0;                   // level starting at zero in the array 
var bonusLevel = 0;                     // bonus level starting at zero in the array
var healthLife;                         // health pack creation for a new player life throughtout the game
var indicatedLevel;                     // ui display indicated level that the player is on
var currentLevel;                       // level user is currently on
var men;                                // number of tracked lives
//var playerScores = [];                  // keep track of high scores
var healthpacksound, winsong, timesupsound, nextLevelSound, livesLost;
var scoreBoard, scoreBoardFullData;     // scoreboard for player
var endGameTrophy;                      // when game is done, (asset)
// intro variables
var startGameButton;                    // button to start it all

function preload() {

    game.load.baseURL = 'assets/';
    game.load.crossOrigin = 'anonymous';
    
    game.load.image('sky', 'backgrounds/starfield.png');
    game.load.image('starfield', 'backgrounds/starfield.png');
    game.load.image('platform', 'backgrounds/tron.png');
    game.load.image('star', 'game/star.png');
    game.load.image('rock', 'game/asteroid1.png');
    game.load.image('healthLife', 'game/firstaid.png');
    game.load.spritesheet('kaboom', 'game/explode.png', 128, 128);
    game.load.image('trophy', 'game/trophy.png');

    // game menu
    game.load.spritesheet('menu', 'game/number-buttons-90x90.png', 90, 90);
	// game levels
	game.load.text('levels', 'game/levels.json');
    // bonus levels
    game.load.text('bonusLevels', 'game/bonus_levels.json');

    game.load.spritesheet('player', 'game/dude.png', 32, 48);
    
    // game audio
    game.load.audio('blast', ['audio/blaster.mp3']);
    game.load.audio('walking', ['audio/steps2.mp3']);
    game.load.audio('explosion', ['audio/explosion.mp3']);
    game.load.audio('healthpacksound', ['audio/chest-grab.mp3']);
    game.load.audio('winsong', ['audio/winsong.mp3']);
    game.load.audio('timesupsound', ['audio/timesup.mp3']);
    game.load.audio('nextLevelSound', ['audio/nextLevelSound.mp3']);
    game.load.audio('livesLost', ['audio/livesLost.mp3']);



}

function create() {

     introToGame();

     // We only want world bounds on the left and right
    game.physics.setBoundsToWorld();

    // music and sound effects for game
    music = game.add.audio('blast');
    walkmusic = game.add.audio('walking');
    timerEndMusic = game.add.audio('explosion');
    healthpacksound = game.add.audio('healthpacksound');
    winsong = game.add.audio('winsong');
    timesupsound = game.add.audio('timesupsound');
    nextLevelSound = game.add.audio('nextLevelSound');
    livesLost = game.add.audio('livesLost');

    // Create our Timer
    timer = game.time.create(false);
    rockReleaseTimer = game.time.create(false);

    // The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');
    
    // load json sheet level data
    levelData = JSON.parse(this.game.cache.getText('levels'));
    console.log(levelData);
    // load json sheet bonus level data
    bonusLevelData = JSON.parse(this.game.cache.getText('bonusLevels'));
    console.log(bonusLevelData);


    //star = game.add.sprite(0, 0, 'star');
    //rock = game.add.sprite(0, 0, 'rock');
    //game.add.sprite(0, 0, 'sky');
    player = game.add.sprite(levelData.levelsData.levels[indexedLevel].playerAttr.x, levelData.levelsData.levels[indexedLevel].playerAttr.y, 'player');
    // healthLife = game.add.sprite(w/2, h/2, 'healthLife');
    // lives
    lives = game.add.group();
    
    
    
    stars = game.add.group();
    rocks = game.add.group();
    stars.enableBody = true;
    rocks.enableBody = true;
    stars.alpha = 0;
    rocks.alpha = 0;

    // Adding the fading animations to the stars and rocks
    game.add.tween(stars).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, true);
    game.add.tween(rocks).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupRockExplosion, this);

    // caculate level for game
    currentLevel = indexedLevel + 1;

    

    // Add a input listener that can help us return from being paused
    game.input.onDown.add(unpause, self);
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.P);
    

}

function update() {

    //  Scroll the background
    starfield.tilePosition.y += 2;

    // player collisions
    game.physics.arcade.collide(rocks, platforms, platformOnRock, null, this);
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(healthLife, platforms);
    game.physics.arcade.collide(healthLife, rocks);
    game.physics.arcade.collide(healthLife, stars);
    game.physics.arcade.collide(stars, rocks);
    game.physics.arcade.collide(rocks, rocks);
    game.physics.arcade.collide(stars, stars);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, rocks, collectRock, null, this);
    game.physics.arcade.overlap(healthLife, player, collectHealthPack, null, this);

    player.body.velocity.x = 0;

// make sure player can still move if in fact the game timer is still ticking
    if (timerTotal > 0)
    {

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -250;
            player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 250;
            player.animations.play('right');
        }
        else
        {
            //  Stand still
            player.animations.stop();

            player.frame = 4;
        }

        // jump only if the player legs are touching down
        if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down))
        {
            player.body.velocity.y = -500;
            walkmusic.play();
        }

        // pause game
        if (pauseButton.isDown)
        {
            if(game.paused == false){
                pause();
            } else {
                console.log("this one");
                unpause(game.paused);
            }
            
        }

        /*if (game.input.mousePointer.isDown)
        {
            //  400 is the speed it will move towards the mouse
            game.physics.arcade.moveToPointer(player, 400);

            //  if it's overlapping the mouse, don't move any more
            if (Phaser.Rectangle.contains(player.body, game.input.x, game.input.y))
            {
                player.body.velocity.setTo(0, 0);
            }
        }
        else
        {
            player.body.velocity.setTo(0, 0);
        }*/

        //player.rotation = game.physics.arcade.angleToPointer(player);

        /*if (game.input.activePointer.isDown)
        {
            console.log("bam");
        }*/

    } else {
            //  Stand still
            player.animations.stop();
    }

}


function render() {

    // debug statements
    //game.debug.text('Time until event: ' + timer.duration.toFixed(0), 32, 32);
    //game.debug.text('Loop Count: ' + timerTotal, 32, 64);indexedLevel
    //game.debug.text(levelData.levelsData.levels.length, 32, 64);
    //game.debug.text(indexedLevel, 32, 164);

}

// when game first starts
function introToGame() {
    startGameButton = game.add.text(w/2, h/2, 'Start Game', { fontSize: '32px Arial', fill: '#ffffff' });  
    startGameButton.inputEnabled = true;
    startGameButton.input.useHandCursor = true;
    startGameButton.events.onInputUp.add(startGame, self);

    if(localStorage.getItem('highscores') === null){       
        localStorage.setItem('highscores', "[]");
        //console.log(playerScores);
     }

     if(localStorage.getItem('bestScore') === null){       
        localStorage.setItem('bestScore', "");
        //console.log(bestScore);
     }
}

// load actual game
function startGame() {

    winsong.play();

    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px Arial', fill: '#ffffff' });  
    timerText = game.add.text(306, 16, 'Time: levelData.levelsData.levels[indexedLevel].timeLimit', { fontSize: '32px Arial', fill: '#ffffff' });  
    indicatedLevel = game.add.text(550, 16, 'Level: ' + currentLevel, { fontSize: '32px Arial', fill: '#ffffff' }); 
    
    // initialize game
    createLives();
    startTimer();
    createStars();
    createRocks();
    createPlayer();
    createPlatforms();
    
    // pause menu
    pause_label = game.add.text(w - 110, 16, 'Menu', { font: '24px Arial', fill: '#ffffff' });
    pause_label.inputEnabled = true;
    pause_label.input.useHandCursor = true;
    pause_label.events.onInputUp.add(pause, self);

   
}

function createPlayer() {
    // player details
    game.physics.arcade.enable(player);

    //game.physics.setBoundsToWorld(true, true, true, true, false);
    player.body.collideWorldBounds = true;
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 700;
    player.checkWorldBounds = false;
    player.events.onOutOfBounds.add(playerOut, this);
    player.reset(levelData.levelsData.levels[indexedLevel].playerAttr.x, levelData.levelsData.levels[indexedLevel].playerAttr.y);
    
    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
}

// set up explosions to occur between the player and a rock on impact
function setupRockExplosion (explosion) {

    explosion.anchor.x = 0.5;
    explosion.anchor.y = 0.5;
    explosion.animations.add('kaboom');

}

// set up player level platforms
function createPlatforms() {
    platforms = game.add.physicsGroup();

    platforms.create(
        levelData.levelsData.levels[indexedLevel].platforms.px1, 
        levelData.levelsData.levels[indexedLevel].platforms.py1,
        'platform'
    );

    platforms.create(
        levelData.levelsData.levels[indexedLevel].platforms.px2, 
        levelData.levelsData.levels[indexedLevel].platforms.py2,
        'platform'
    );

    platforms.create(
        levelData.levelsData.levels[indexedLevel].platforms.px3, 
        levelData.levelsData.levels[indexedLevel].platforms.py3,
        'platform'
    );

    platforms.setAll('body.immovable', true);
}

function createLives() {
    // three lives
    for (var i = 1; i < levelData.levelsData.playerLives; i++) 
    {
        men = lives.create(game.world.width - 100 + (30 * i), 60, 'player');
        men.anchor.setTo(0.5, 0.5);
        men.scale.setTo(0.7, 0.7);
        men.alpha = 0.4;
    }

    remainingLives = levelData.levelsData.playerLives;
}

function createStars() {

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < levelData.levelsData.levels[indexedLevel].starNumbers; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 9;
        star.body.gravity.x = game.rnd.integerInRange(0, 11);
        star.reset(game.rnd.integerInRange(0, 780), game.rnd.integerInRange(0, 45));
        star.body.collideWorldBounds = true;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
        // make sure stars bounce off of walls
        star.body.bounce.set(1);
        star.checkWorldBounds = true;
        star.events.onOutOfBounds.add(starOut, this);
        remainingStars.push(star);
    }

}

function createRocks() {

    //  Set a TimerEvent to occur after every second
    rockReleaseTimer.loop(levelData.levelsData.levels[indexedLevel].rockReleaseTimer, function() {

        for (var r = 0; r < levelData.levelsData.levels[indexedLevel].rockNumbers; r++)
        {
            //  Create a star inside of the 'rocks' group 
            var rock = rocks.create(r * 100, 0, 'rock');

            //  Let gravity do its thing
            //player.body.velocity.x = game.rnd.integerInRange(50, 350);
            rock.body.gravity.y = game.rnd.integerInRange(1, 11);
            rock.body.rotation = 50;
            rock.reset(game.rnd.integerInRange(0, 780), game.rnd.integerInRange(0, 30));

            game.add.tween(rock).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);
        }


    }, this);

    rockReleaseTimer.start();
    /*
    if (indexedLevel == 3) {
        createHealthPack();
    }
    */
    // create a health pack starting at level three then in every other odd level
    if (indexedLevel >= 3 && indexedLevel % 2 != 0) {
        createHealthPack();
    }

    

}
// healthpack init
function createHealthPack() {
    healthLife = game.add.sprite(100, 200, 'healthLife');
    game.physics.arcade.enable(healthLife);
    healthLife.body.gravity.x = game.rnd.integerInRange(-5, 5);
    healthLife.body.gravity.y = game.rnd.integerInRange(0, 11);
    healthLife.reset(game.rnd.integerInRange(0, 780), game.rnd.integerInRange(0, 30));
    healthLife.checkWorldBounds = true;
    healthLife.collideWorldBounds = true;
    healthLife.body.bounce.y = 1;
    // make sure healthLife bounce off of walls
    healthLife.body.bounce.set(1);
}

function pause(){
        
        // When the pause button is pressed, we pause the game
        game.paused = true;
        pause_label.text = "Paused";

        // Then add the menu
        menu = game.add.sprite(w/2, h/2, 'menu');
        menu.anchor.setTo(0.5, 0.5);
        menu.inputEnabled = true;
        menu.input.useHandCursor = true;
        //the "click to restart" handler
        //game.input.onTap.addOnce(restart,this);

        // And a label to illustrate which menu item was chosen. (This is not necessary)
        choiseLabel = game.add.text(w/2, h-150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
        choiseLabel.anchor.setTo(0.5, 0.5);
} 

function unpause(){
        
        if(game.paused){

            pause_label.text = "Menu";
    
            choiseLabel.destroy();
            menu.destroy();
        
            // Unpause the game
            game.paused = false;
        }
}

function platformOnRock(rock, platform) {

    // Removes the rock from the screen
    rock.kill();

    var explosionPlat = explosions.getFirstExists(false);
    explosionPlat.reset(rock.body.x, rock.body.y);
    explosionPlat.play('kaboom', 30, false, true);
}

// when player hits/collects a star
function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();
    timerTotal += levelData.levelsData.levels[indexedLevel].starScoreExtraTime;
    remainingStars.length -= 1;
    console.log(remainingStars.length);
    
    music.play();
    
    //  Add and update the score
    score += levelData.levelsData.levels[indexedLevel].starScore;
    scoreText.text = 'Score: ' + score;

    var zoomTween = game.add.tween(scoreText.scale);
            zoomTween.to({x:1.1,y:1.1}, 700, Phaser.Easing.Elastic.Out);
            zoomTween.onComplete.addOnce(function(){
                zoomTween.to({x:1,y:1}, 300, Phaser.Easing.Elastic.Out);
            }, this);
            zoomTween.start();

    if (remainingStars.length <= 0)
    {
        gameEnd();
    }
}

// when player hits/collects a rock
function collectRock (player, rock) {
    
    // Removes the rock from the screen
    rock.kill();
    timerTotal -= levelData.levelsData.levels[indexedLevel] .rockHitTimeLoss;
    rocksYouHit += 1;
    score -= levelData.levelsData.levels[indexedLevel] .rockHitScoreLoss;
    timerEndMusic.play();

    var explosion = explosions.getFirstExists(false);
    explosion.reset(rock.body.x, rock.body.y);
    explosion.play('kaboom', 30, false, true);

    if (rocksYouHit % 2 == 0) {
        live = lives.getFirstAlive();
        remainingLives -= 1;

        if (live)
        {
            live.kill();
        }
    }
    
    
    //  Add and update the score
    // final end score of game
    if (score <= 0) {
        scoreText.text = 'Score: 0';
        score = 0;
    } else {
        scoreText.text = 'Score: ' + score;
    }

    var zoomTween = game.add.tween(scoreText.scale);
            zoomTween.to({x:1.1,y:1.1}, 700, Phaser.Easing.Elastic.Out);
            zoomTween.onComplete.addOnce(function(){
                zoomTween.to({x:1,y:1}, 300, Phaser.Easing.Elastic.Out);
            }, this);
            zoomTween.start();

    // When the player dies kill player and end game
    if (remainingLives == 0)
    {
        player.kill();
        livesLost.play();
        gameEnd();
    }
    

}

// when user collects a health pack
function collectHealthPack(health) {
    health.kill();
    remainingLives += 1;
    // gain points on collecting health pack
    score += 100;
    men = lives.create(game.world.width - 100 + (30 * 3), 60, 'player');
    men.anchor.setTo(0.5, 0.5);
    men.scale.setTo(0.7, 0.7);
    men.alpha = 0.4;
    healthpacksound.play();

    var zoomTween = game.add.tween(scoreText.scale);
            zoomTween.to({x:1.1,y:1.1}, 700, Phaser.Easing.Elastic.Out);
            zoomTween.onComplete.addOnce(function(){
                zoomTween.to({x:1,y:1}, 300, Phaser.Easing.Elastic.Out);
            }, this);
            zoomTween.start();
}

// on timer ticking
function updateCounter() {

    timerTotal--;
    timerText.text = 'Time: ' + timerTotal;

    if (timerTotal <= 0) {
        timer.stop();
        timerText.text = 'Time: 0';
        if (score <= 0) {
            scoreText.text = 'Score: 0';
            score = 0;
        }
        timesupsound.play();
        gameEnd();

    } else if (timerTotal <= 10) {
        timerText.fill = '#FF0000';

        var zoomTween = game.add.tween(timerText.scale);
            zoomTween.to({x:1.2,y:1.2}, 700, Phaser.Easing.Elastic.Out);
            zoomTween.onComplete.addOnce(function(){
                zoomTween.to({x:1,y:1}, 300, Phaser.Easing.Elastic.Out);
            }, this);
            zoomTween.start();
    }

}

// once end of game is reached, regardless if user wins or loses
function gameEnd() {

    //  Add and update the score from timer
    score += timerTotal;
    timerTotal = 0;
    timerText.text = 'Time: 0';
    scoreText.text = 'Score: ' + score;

    // check to see if the user is going to be able to move on from this next level
    if (score >= 70 && remainingLives != 0) {
        endScoreText = game.add.text(w/2, h/2, 'Click to Continue', { fontSize: '32px', fill: '#ffffff' }); 
        nextLevelSound.play();
        indexedLevel += 1; // levels get progressively harder

        // if there are no more levels within the game, then the game has been won
        if (indexedLevel == levelData.levelsData.levels.length)
        {
            // game has been won!
            onGameWin();
            return false;
        } else {
            

            // send user to bonus round if they have at least three lives, a good score, and there is a bonus level available
            if (remainingLives >= 3 && score >= 200 && bonusLevel != bonusLevelData.bonuslevelsData.levels.length) {
                indexedLevel -= 1; // level stays the same because of bonus round
                sendToBonusRound();
                return false;
            } else {
                currentLevel += 1;
                highScore = game.add.text(w/2, h/2 - 100, 'Continue To Level ' + currentLevel, { fontSize: '32px', fill: '#ffffff' }); 
                highScore.anchor.setTo(0.5, 0.5);
            }

        }

        
        indicatedLevel.text = 'Level: ' + currentLevel;

        var zoomTween = game.add.tween(indicatedLevel.scale);
            zoomTween.to({x:1.5,y:1.5}, 800, Phaser.Easing.Elastic.Out);
            zoomTween.onComplete.addOnce(function(){
                zoomTween.to({x:1,y:1}, 300, Phaser.Easing.Elastic.Out);
            }, this);
            zoomTween.start();

    } else {
        endScoreText = game.add.text(w/2, 350, 'You Lose, Click to Restart', { fontSize: '32px', fill: '#ffffff' });

        saveScores(); 
    }
        // common stopping events at end of game events
        pause_label.events.onInputUp.removeAll();
        stars.removeAll();
        rocks.removeAll();
        endScoreText.anchor.setTo(0.5, 0.1);
        endScoreText.inputEnabled = true;
        endScoreText.input.useHandCursor = true;
        endScoreText.events.onInputUp.add(restart, self);
        timer.stop();
        rockReleaseTimer.stop();
        player.kill();   

}

// restart the level on any condition
function restart () {

    remainingStars = [];
	if (score >= 70 && remainingLives != 0 && indexedLevel != levelData.levelsData.levels.length) {
        highScore.destroy();
        nextLevel();
	} else if (indexedLevel == levelData.levelsData.levels.length ){
        highScore.destroy();
        restartHelper();
    } else {
        restartHelper();
    }
}

// reset the game and start everything over again
function restartHelper() {
        score = 0;
        rocksYouHit = 0;
        scoreText.text = 'Score: 0';
        if (healthLife) {
            healthLife.kill();
        }
        if (scoreBoard) {
            scoreBoard.destroy();
        }
        scoreBoardFullData.removeAll();
        endGameTrophy.kill();
        currentLevel = 1;
        indexedLevel = 0; // back to level 1
        bonusLevel = 0; // restart bonuses
        indicatedLevel.text = 'Level: ' + currentLevel;
        stars.removeAll();
        rocks.removeAll();
        lives.removeAll();
        platforms.removeAll();
        createPlatforms();
        createRocks();
        createStars();
        createPlayer();
        createLives();
        endScoreText.destroy();
        pause_label.events.onInputUp.add(pause, self);

        //revives the player
        //player.revive();
        startTimer();
}

// initialize the timer 
function startTimer() {
    timerTotal = levelData.levelsData.levels[indexedLevel].timeLimit;
    timerText.text = 'Time: ' + levelData.levelsData.levels[indexedLevel].timeLimit;

    //  Set a TimerEvent to occur after every second
    timer.loop(1000, updateCounter, this);

    timer.start();
}

// once a star leave the field, count it as off the screen and reduce the star count
function starOut(star, event) {

    remainingStars.length -= 1;
    //console.log(remainingStars.length);

}

// if a player leaves the field, or falls out of bounds
function playerOut(player) {
    //highScore.destroy();
    console.log("hit");
}

// move player on to the next level if they are successful
function nextLevel() {
        // next level continues, keep score
        rocksYouHit = 0; // reset rocks hit for this level
        stars.removeAll();
        rocks.removeAll();
        platforms.removeAll();
        if (healthLife) {
            healthLife.kill();
        }
        nextLevelSound.play();
        createPlatforms();
        createRocks();
        createStars();
        endScoreText.destroy();
        pause_label.events.onInputUp.add(pause, self);

        //revives the player
        player.revive();
        player.reset(levelData.levelsData.levels[indexedLevel].playerAttr.x, levelData.levelsData.levels[indexedLevel].playerAttr.y);
        startTimer();
}

// bonus round setup
function sendToBonusRound() {

    stars.removeAll();
    rocks.removeAll();
    platforms.removeAll();
    nextLevelSound.play();
    endScoreText.destroy();
    timer.stop();
    rockReleaseTimer.stop();
    player.kill();
    if (healthLife) {
            healthLife.kill();
    }
    pause_label.events.onInputUp.add(pause, self);

    nextLevelSound.play();
    indicatedLevel.text = 'Bonus!';

    platforms = game.add.physicsGroup();

    platforms.create(
        bonusLevelData.bonuslevelsData.levels[bonusLevel].platforms.px1, 
        bonusLevelData.bonuslevelsData.levels[bonusLevel].platforms.py1,
        'platform'
    );

    platforms.create(
        bonusLevelData.bonuslevelsData.levels[bonusLevel].platforms.px2, 
        bonusLevelData.bonuslevelsData.levels[bonusLevel].platforms.py2,
        'platform'
    );

    platforms.create(
        bonusLevelData.bonuslevelsData.levels[bonusLevel].platforms.px3, 
        bonusLevelData.bonuslevelsData.levels[bonusLevel].platforms.py3,
        'platform'
    );

    platforms.setAll('body.immovable', true);

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < bonusLevelData.bonuslevelsData.levels[bonusLevel].starNumbers; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 9;
        star.body.gravity.x = game.rnd.integerInRange(0, 11);
        star.reset(game.rnd.integerInRange(0, 780), game.rnd.integerInRange(0, 45));
        star.body.collideWorldBounds = true;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
        // make sure stars bounce off of walls
        star.body.bounce.set(1);
        star.checkWorldBounds = true;
        star.events.onOutOfBounds.add(starOut, this);
        remainingStars.push(star);
    }

        //revives the player
        player.revive();
        player.reset(
            bonusLevelData.bonuslevelsData.levels[bonusLevel].playerAttr.x, 
            bonusLevelData.bonuslevelsData.levels[bonusLevel].playerAttr.y
        );

        timerTotal = bonusLevelData.bonuslevelsData.levels[bonusLevel].timeLimit;
        timerText.text = 'Time: ' + bonusLevelData.bonuslevelsData.levels[bonusLevel].timeLimit;

        //  Set a TimerEvent to occur after every second
        timer.loop(1000, updateCounter, this);

        timer.start();

        bonusLevel += 1;
}

// game win notification
function onGameWin() {
    highScore = game.add.text(w/2, h/2 - 100, 'Congratulations, you have won the game!', { fontSize: '32px', fill: '#ffffff' }); 
    highScore.anchor.setTo(0.5, 0.5);
    pause_label.events.onInputUp.removeAll();
        stars.removeAll();
        rocks.removeAll();
        endScoreText.anchor.setTo(0.5, 0.5);
        endScoreText.inputEnabled = true;
        endScoreText.input.useHandCursor = true;
        endScoreText.events.onInputUp.add(restart, self);
        timer.stop();
        rockReleaseTimer.stop();
        player.kill();
        winsong.play();
        saveScores();
}

function displayScoreLayout(playerScores, playerBest) {
        var scoreBoardData = "";
        var spacing = 20;
        scoreBoardFullData = game.add.physicsGroup();
        scoreBoardFullData.alpha = 0;

        for (var i = 0; i < playerScores.length; ++i) {
            var numCountDisplay = i + 1;

            // add scoreboard display ui
            var scoresList = game.add.text(
                w/2 - 65, h/2 - 180 + spacing,
                numCountDisplay + ". " + playerScores[i] + " points \n",
                { font: '25px Arial', fill: '#fff' },
                scoreBoardFullData
            );

            spacing += 40;
        }

            // add player best
            var bestplayerTitle = game.add.text(
                50, h/2 - 200,
                "Your Best Score:",
                { font: '25px Arial', fill: '#fff' },
                scoreBoardFullData
            );

            var bestPlayerScore = game.add.text(
                0, h/2 - 150,
                playerBest,
                { font: '45px Arial', fill: '#fff' },
                scoreBoardFullData
            );

            endGameTrophy = game.add.sprite(110, 800, 'trophy');
            endGameTrophy.scale.setTo(0.1,0.1);
            endGameTrophy.angle = 10;

            game.add.tween(scoreBoardFullData).to( { alpha: 1 }, 1500, Phaser.Easing.Linear.None, true, 0, 0, true);

            var zoomTween = game.add.tween(bestplayerTitle.scale);
            zoomTween.to({x:1.5,y:1.5}, 800, Phaser.Easing.Elastic.Out);
            zoomTween.onComplete.addOnce(function(){
                zoomTween.to({x:1,y:1}, 300, Phaser.Easing.Elastic.Out);
            }, this);
            zoomTween.start();

            var moveTween = game.add.tween(bestPlayerScore);
            moveTween.to( { x: 90 }, 1100, Phaser.Easing.Linear.None);
            moveTween.start();

            var moveTweeny = game.add.tween(endGameTrophy);
            moveTweeny.to( { y: h/2 - 100 }, 1100, Phaser.Easing.Linear.None);
            moveTweeny.start();

            
            

        return scoreBoardData;
} 

function saveScores() {
    // save score
    var playerScores = [];
    playerScores = JSON.parse(localStorage.getItem('highscores'));
     if(localStorage.getItem('highscores') !== null && score > 0){

        
        
        if (playerScores.length > 4) {
            playerScores.shift(); // remove earliest score if there are 5 recent scores racked up
        }

        // set best score only if score is better than last, or doesnt exist yet
        if (score > parseInt(localStorage.getItem('bestScore')) || localStorage.getItem('bestScore') == "") {
            localStorage.setItem('bestScore', score);
        }
        playerScores.push(score);
        localStorage.setItem('highscores',JSON.stringify(playerScores));

     }   


    // show UI

    scoreBoard = game.add.text(
            w/2, 100,
            'Your Scores: \n' + displayScoreLayout(playerScores, localStorage.getItem('bestScore')),
            { font: '30px Arial', fill: '#fff' }
    );
    scoreBoard.anchor.setTo(0.5, 0.1);
}