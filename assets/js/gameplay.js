var theGame = function(game) {
    // variables user
    starfield = ""; // scrolling background
    player = ""; // our player
    platforms = ""; // player collisions will use this 
    stars = "";
    rocks = ""; // game interactions
    cursors = ""; // arrow keys to move
    jumpButton = ""; // spacebar jumping init
    pauseButton = ""; // P button init for pause Menu
    score = 0; // score for our game
    scoreText = "";
    timerText = ""; // displays for score
    pause_label = "";
    choiseLabel = ""; // displays fpr pause and choice label
    w = 800, h = 600; // height and width of screen size
    music = "";
    walkmusic = "";
    timerEndMusic = ""; // audio for game
    timer = "";
    rockReleaseTimer = ""; // timers for game setup, one for level time, one for rocks
    menu = ""; // our temp game menu
    remainingStars = []; // hold number of remaining stars from level to know when the game is done
    rocksYouHit = 0; // rocks hit starting at zero every level
    endScoreText = ""; // display for game end message
    quitGameText = ""; // end game and return to main menu
    lives = "";
    remainingLives = "";
    live = ""; // vars for lives tracking throughout the game
    explosions = ""; // explosions on rock hits
    highScore = ""; // tell whether or not the player can move on to the next level
    timerTotal = 0; // total number of seconds the timer has left
    levelData = "";
    bonusLevelData = ""; // level and bonus data gathered from json file
    indexedLevel = 0; // level starting at zero in the array 
    bonusLevel = 0; // bonus level starting at zero in the array
    healthLife = ""; // health pack creation for a new player life throughtout the game
    indicatedLevel = ""; // ui display indicated level that the player is on
    currentLevel = ""; // level user is currently on
    men = ""; // number of tracked lives
    //var playerScores = [];                  // keep track of high scores
    healthpacksound = "";
    winsong = "";
    timesupsound = "";
    nextLevelSound = "";
    livesLost = "";
    scoreBoard = "";
    scoreBoardFullData = ""; // scoreboard for player
    endGameTrophy = ""; // when game is done, (asset)
    // intro variables
    startGameButton = ""; // button to start it all
    soundIcon = "";
    isGameSoundOn = true;
}

theGame.prototype = {
    create: function() {
        // We only want world bounds on the left and right
        this.game.physics.setBoundsToWorld();

        // music and sound effects for game
        music = this.game.add.audio('blast');
        walkmusic = this.game.add.audio('walking');
        timerEndMusic = this.game.add.audio('explosion');
        healthpacksound = this.game.add.audio('healthpacksound');
        winsong = this.game.add.audio('winsong');
        timesupsound = this.game.add.audio('timesupsound');
        nextLevelSound = this.game.add.audio('nextLevelSound');
        livesLost = this.game.add.audio('livesLost');

        // Create our Timer
        timer = this.game.time.create(false);
        rockReleaseTimer = this.game.time.create(false);

        // load json sheet level data
        levelData = JSON.parse(this.game.cache.getText('levels'));
        console.log(levelData);
        // load json sheet bonus level data
        bonusLevelData = JSON.parse(this.game.cache.getText('bonusLevels'));
        console.log(bonusLevelData);

        // The scrolling starfield background
        starfield = this.game.add.tileSprite(0, 0, 800, 600, levelData.levelsData.levels[indexedLevel].starField);


        //star = game.add.sprite(0, 0, 'star');
        //rock = game.add.sprite(0, 0, 'rock');
        //game.add.sprite(0, 0, 'sky');
        player = this.game.add.sprite(levelData.levelsData.levels[indexedLevel].playerAttr.x, levelData.levelsData.levels[indexedLevel].playerAttr.y, 'player');
        // healthLife = game.add.sprite(w/2, h/2, 'healthLife');
        // lives
        lives = this.game.add.group();



        stars = this.game.add.group();
        rocks = this.game.add.group();
        stars.enableBody = true;
        rocks.enableBody = true;
        stars.alpha = 0;
        rocks.alpha = 0;

        // Adding the fading animations to the stars and rocks
        this.game.add.tween(stars).to({
            alpha: 1
        }, 2000, Phaser.Easing.Linear.None, true, 0, 0, true);
        this.game.add.tween(rocks).to({
            alpha: 1
        }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);

        //  An explosion pool
        explosions = this.game.add.group();
        explosions.createMultiple(30, 'kaboom');
        explosions.forEach(this.setupRockExplosion, this);

        // caculate level for game
        currentLevel = indexedLevel + 1;

        winsong.play();

        scoreText = this.game.add.text(16, 16, 'Score: 0', {
            font: '32px Sniglet',
            fill: '#ffffff'
        });
        timerText = this.game.add.text(306, 16, 'Time: levelData.levelsData.levels[indexedLevel].timeLimit', {
            font: '32px Sniglet',
            fill: '#ffffff'
        });
        indicatedLevel = this.game.add.text(550, 16, 'Level: ' + currentLevel, {
            font: '32px Sniglet',
            fill: '#ffffff'
        });

        soundIcon = this.game.add.sprite(w/2 + 350, 15, 'soundIcon');
        soundIcon.scale.setTo(0.5, 0.5);
        soundIcon.inputEnabled = true;
	    soundIcon.input.useHandCursor = true;
	    soundIcon.events.onInputUp.add(this.toggleSound, this);
	    this.toggleSound();

        // initialize game
        this.createLives();
        this.startTimer();
        this.createStars();
        this.createRocks();
        this.createPlayer();
        this.createPlatforms();

        // pause menu
        pause_label = this.game.add.text(w - 110, 16, 'Menu', {
            font: '24px Sniglet',
            fill: '#ffffff'
        });
        pause_label.inputEnabled = true;
        pause_label.input.useHandCursor = true;
        pause_label.events.onInputUp.add(this.pause, this);



        // Add a input listener that can help us return from being paused
        this.game.input.onDown.add(this.unpause, this);
        cursors = this.game.input.keyboard.createCursorKeys();
        jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        pauseButton = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
    },
    update: function() {
        //  Scroll the background
        starfield.tilePosition.y += 2;

        // player collisions
        this.game.physics.arcade.collide(rocks, platforms, this.platformOnRock, null, this);
        this.game.physics.arcade.collide(player, platforms);
        this.game.physics.arcade.collide(stars, platforms);
        this.game.physics.arcade.collide(healthLife, platforms);
        this.game.physics.arcade.collide(healthLife, rocks);
        this.game.physics.arcade.collide(healthLife, stars);
        this.game.physics.arcade.collide(stars, rocks);
        this.game.physics.arcade.collide(rocks, rocks);
        this.game.physics.arcade.collide(stars, stars);
        this.game.physics.arcade.overlap(player, stars, this.collectStar, null, this);
        this.game.physics.arcade.overlap(player, rocks, this.collectRock, null, this);
        this.game.physics.arcade.overlap(healthLife, player, this.collectHealthPack, null, this);

        player.body.velocity.x = 0;

        // make sure player can still move if in fact the game timer is still ticking
        if (timerTotal > 0) {

            if (cursors.left.isDown) {
                player.body.velocity.x = -250;
                player.animations.play('left');
            } else if (cursors.right.isDown) {
                player.body.velocity.x = 250;
                player.animations.play('right');
            } else {
                //  Stand still
                player.animations.stop();

                player.frame = 4;
            }

            // jump only if the player legs are touching down
            if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down) ||
            	cursors.up.isDown && (player.body.onFloor() || player.body.touching.down)) {
                player.body.velocity.y = -500;
                walkmusic.play();
            }

            // pause game
            if (pauseButton.isDown) {
                if (this.game.paused == false) {
                    this.pause();
                } else {
                    console.log("this one");
                    this.unpause(this.game.paused);
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
    },
    setupRockExplosion: function(explosion) {

        explosion.anchor.x = 0.5;
        explosion.anchor.y = 0.5;
        explosion.animations.add('kaboom');

    },
    createPlatforms: function() {
        platforms = this.game.add.physicsGroup();

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
    },
    createLives: function() {
        // three lives
        for (var i = 1; i < levelData.levelsData.playerLives; i++) {
            men = lives.create(this.game.world.width - 100 + (30 * i), 60, 'player');
            men.anchor.setTo(0.5, 0.5);
            men.scale.setTo(0.7, 0.7);
            men.alpha = 0.4;
        }

        remainingLives = levelData.levelsData.playerLives;
    },
    createStars: function() {
        //  Here we'll create 12 of them evenly spaced apart
        for (var i = 0; i < levelData.levelsData.levels[indexedLevel].starNumbers; i++) {
            //  Create a star inside of the 'stars' group
            var star = stars.create(i * 70, 0, 'star');

            //  Let gravity do its thing
            star.body.gravity.y = 11;
            star.body.gravity.x = this.game.rnd.integerInRange(10, 11);
            star.reset(this.game.rnd.integerInRange(0, 780), this.game.rnd.integerInRange(0, 45));
            star.body.collideWorldBounds = true;

            //  This just gives each star a slightly random bounce value
            star.body.bounce.y = 0.1 + Math.random() * 0.2;
            // make sure stars bounce off of walls
            star.body.bounce.set(1);
            star.checkWorldBounds = true;
            star.events.onOutOfBounds.add(this.starOut, this);
            remainingStars.push(star);
        }
    },
    createRocks: function() {
        //  Set a TimerEvent to occur after every second
        rockReleaseTimer.loop(levelData.levelsData.levels[indexedLevel].rockReleaseTimer, function() {

            for (var r = 0; r < levelData.levelsData.levels[indexedLevel].rockNumbers; r++) {
                //  Create a star inside of the 'rocks' group 
                var rock = rocks.create(r * 100, 0, 'rock');

                //  Let gravity do its thing
                //player.body.velocity.x = game.rnd.integerInRange(50, 350);
                rock.body.gravity.y = this.game.rnd.integerInRange(1, 11);
                rock.body.rotation = 50;
                rock.reset(this.game.rnd.integerInRange(0, 780), this.game.rnd.integerInRange(0, 30));

                this.game.add.tween(rock).to({
                    alpha: 1
                }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);
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
            this.createHealthPack();
        }
    },
    createHealthPack: function() {
        healthLife = this.game.add.sprite(100, 200, 'healthLife');
        this.game.physics.arcade.enable(healthLife);
        healthLife.body.gravity.x = this.game.rnd.integerInRange(-5, 5);
        healthLife.body.gravity.y = this.game.rnd.integerInRange(0, 11);
        healthLife.reset(this.game.rnd.integerInRange(0, 780), this.game.rnd.integerInRange(0, 30));
        healthLife.checkWorldBounds = true;
        healthLife.collideWorldBounds = true;
        healthLife.body.bounce.y = 1;
        // make sure healthLife bounce off of walls
        healthLife.body.bounce.set(1);
    },
    createPlayer: function() {
        // player details
        this.game.physics.arcade.enable(player);

        //game.physics.setBoundsToWorld(true, true, true, true, false);
        player.body.collideWorldBounds = true;
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 700;
        player.checkWorldBounds = false;
        player.events.onOutOfBounds.add(this.playerOut, this);
        player.reset(levelData.levelsData.levels[indexedLevel].playerAttr.x, levelData.levelsData.levels[indexedLevel].playerAttr.y);

        //  Our two animations, walking left and right.
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
    },
    platformOnRock: function(rock, platform) {
        // Removes the rock from the screen
        rock.kill();

        var explosionPlat = explosions.getFirstExists(false);
        explosionPlat.reset(rock.body.x, rock.body.y);
        explosionPlat.play('kaboom', 30, false, true);
    },
    collectStar: function(player, star) {
        // Removes the star from the screen
        star.kill();
        timerTotal += levelData.levelsData.levels[indexedLevel].starScoreExtraTime;
        remainingStars.length -= 1;
        console.log(remainingStars.length);

        music.play();

        //  Add and update the score
        score += levelData.levelsData.levels[indexedLevel].starScore;
        scoreText.text = 'Score: ' + score;

        var zoomTween = this.game.add.tween(scoreText.scale);
        zoomTween.to({
            x: 1.1,
            y: 1.1
        }, 700, Phaser.Easing.Elastic.Out);
        zoomTween.onComplete.addOnce(function() {
            zoomTween.to({
                x: 1,
                y: 1
            }, 300, Phaser.Easing.Elastic.Out);
        }, this);
        zoomTween.start();

        if (remainingStars.length <= 0) {
            this.gameEnd();
        }
    },
    collectRock: function(player, rock) {
        // Removes the rock from the screen
        rock.kill();
        timerTotal -= levelData.levelsData.levels[indexedLevel].rockHitTimeLoss;
        rocksYouHit += 1;
        score -= levelData.levelsData.levels[indexedLevel].rockHitScoreLoss;
        timerEndMusic.play();

        var explosion = explosions.getFirstExists(false);
        explosion.reset(rock.body.x, rock.body.y);
        explosion.play('kaboom', 30, false, true);

        if (rocksYouHit % 2 == 0) {
            live = lives.getFirstAlive();
            remainingLives -= 1;

            if (live) {
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

        var zoomTween = this.game.add.tween(scoreText.scale);
        zoomTween.to({
            x: 1.1,
            y: 1.1
        }, 700, Phaser.Easing.Elastic.Out);
        zoomTween.onComplete.addOnce(function() {
            zoomTween.to({
                x: 1,
                y: 1
            }, 300, Phaser.Easing.Elastic.Out);
        }, this);
        zoomTween.start();

        // When the player dies kill player and end game
        if (remainingLives == 0) {
            player.kill();
            livesLost.play();
            this.gameEnd();
        }
    },
    collectHealthPack: function(health) {
        health.kill();
        remainingLives += 1;
        // gain points on collecting health pack
        score += 100;
        men = lives.create(this.game.world.width - 100 + (30 * 3), 60, 'player');
        men.anchor.setTo(0.5, 0.5);
        men.scale.setTo(0.7, 0.7);
        men.alpha = 0.4;
        healthpacksound.play();

        var zoomTween = this.game.add.tween(scoreText.scale);
        zoomTween.to({
            x: 1.1,
            y: 1.1
        }, 700, Phaser.Easing.Elastic.Out);
        zoomTween.onComplete.addOnce(function() {
            zoomTween.to({
                x: 1,
                y: 1
            }, 300, Phaser.Easing.Elastic.Out);
        }, this);
        zoomTween.start();
    },
    gameEnd: function() {
        //  Add and update the score from timer
        score += timerTotal;
        timerTotal = 0;
        timerText.text = 'Time: 0';
        scoreText.text = 'Score: ' + score;

        // check to see if the user is going to be able to move on from this next level
        if (score >= 70 && remainingLives != 0) {
            endScoreText = this.game.add.text(w / 2, h / 2, 'Click to Continue', {
                font: '32px Sniglet',
                fill: '#ffffff'
            });
            nextLevelSound.play();
            indexedLevel += 1; // levels get progressively harder

            // if there are no more levels within the game, then the game has been won
            if (indexedLevel == levelData.levelsData.levels.length) {
                // game has been won!
                this.onGameWin();
                return false;
            } else {


                // send user to bonus round if they have at least three lives, a good score, and there is a bonus level available
                if (remainingLives >= 3 && score >= 200 && bonusLevel != bonusLevelData.bonuslevelsData.levels.length) {
                    indexedLevel -= 1; // level stays the same because of bonus round
                    this.sendToBonusRound();
                    return false;
                } else {
                    currentLevel += 1;
                    highScore = this.game.add.text(w / 2, h / 2 - 100, 'Continue To Level ' + currentLevel, {
                        font: '32px Sniglet',
                        fill: '#ffffff'
                    });
                    highScore.anchor.setTo(0.5, 0.5);
                }

            }


            indicatedLevel.text = 'Level: ' + currentLevel;

            var zoomTween = this.game.add.tween(indicatedLevel.scale);
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

        } else {
            endScoreText = this.game.add.text(w / 2, 350, 'You Lose, Click to Restart', {
                font: '32px Sniglet',
                fill: '#ffffff'
            });

            quitGameText = this.game.add.text(w / 2 - 70, 400, 'Quit Game', {
                font: '32px Sniglet',
                fill: '#ffffff'
            });

            quitGameText.inputEnabled = true;
            quitGameText.input.useHandCursor = true;
            quitGameText.events.onInputUp.add(this.quitGame, this);

            this.saveScores();
        }
        // common stopping events at end of game events
        pause_label.events.onInputUp.removeAll();
        stars.removeAll();
        rocks.removeAll();
        endScoreText.anchor.setTo(0.5, 0.1);
        endScoreText.inputEnabled = true;
        endScoreText.input.useHandCursor = true;
        endScoreText.events.onInputUp.add(this.restart, this);
        endScoreText.anchor.setTo(0.5, 0.1);
        timer.stop();
        rockReleaseTimer.stop();
        player.kill();
    },
    restart: function() {
        remainingStars = [];
        if (score >= 70 && remainingLives != 0 && indexedLevel != levelData.levelsData.levels.length) {
            highScore.destroy();
            this.nextLevel();
        } else if (indexedLevel == levelData.levelsData.levels.length) {
            highScore.destroy();
            this.restartHelper();
        } else {
            this.restartHelper();
        }
    },
    quitGame: function() {
        // back to square one
        timerText.fill = '#ffffff';
        score = 0;
        rocksYouHit = 0;
        scoreText.text = 'Score: 0';
        if (healthLife) {
            healthLife.kill();
        }
        if (scoreBoard) {
            scoreBoard.destroy();
        }
        if (scoreBoardFullData) {
            scoreBoardFullData.removeAll();
        }
        if (endGameTrophy) {
            endGameTrophy.kill();
        }
        currentLevel = 1;
        indexedLevel = 0; // back to level 1
        bonusLevel = 0; // restart bonuses
        indicatedLevel.text = 'Level: ' + currentLevel;
        stars.removeAll();
        rocks.removeAll();
        lives.removeAll();
        platforms.removeAll();

        starfield.destroy();
        // The scrolling starfield background
        starfield = this.game.add.tileSprite(0, 0, 800, 600, levelData.levelsData.levels[indexedLevel].starField);



        this.game.state.start("GameTitle", true, false);
    },
    restartLevel: function() {
        // back to square one
        this.game.state.start("GameTitle", true, false);
    },
    restartHelper: function() {
    	starfield.destroy();
    	// The scrolling starfield background
        starfield = this.game.add.tileSprite(0, 0, 800, 600, levelData.levelsData.levels[indexedLevel].starField);
        this.game.world.sendToBack(starfield);
        timerText.fill = '#ffffff';
        score = 0;
        rocksYouHit = 0;
        scoreText.text = 'Score: 0';
        if (healthLife) {
            healthLife.kill();
        }
        if (scoreBoard) {
            scoreBoard.destroy();
        }
        if (scoreBoardFullData) {
        	scoreBoardFullData.removeAll();
        }
        if (endGameTrophy) {
        	endGameTrophy.kill();
        }
        currentLevel = 1;
        indexedLevel = 0; // back to level 1
        bonusLevel = 0; // restart bonuses
        indicatedLevel.text = 'Level: ' + currentLevel;
        stars.removeAll();
        rocks.removeAll();
        lives.removeAll();
        platforms.removeAll();
        this.createPlatforms();
        this.createRocks();
        this.createStars();
        this.createPlayer();
        this.createLives();
        if (endScoreText) {
        	endScoreText.destroy();
        }
        pause_label.events.onInputUp.add(this.pause, this);

        //revives the player
        //player.revive();
        this.startTimer();
    },
    nextLevel: function() {
        // next level continues, keep score
        starfield.destroy();
    	// The scrolling starfield background
        starfield = this.game.add.tileSprite(0, 0, 800, 600, levelData.levelsData.levels[indexedLevel].starField);
        this.game.world.sendToBack(starfield);
        rocksYouHit = 0; // reset rocks hit for this level
        stars.removeAll();
        rocks.removeAll();
        platforms.removeAll();
        if (healthLife) {
            healthLife.kill();
        }
        nextLevelSound.play();
        this.createPlatforms();
        this.createRocks();
        this.createStars();
        endScoreText.destroy();
        pause_label.events.onInputUp.add(this.pause, this);

        //revives the player
        player.revive();
        player.reset(levelData.levelsData.levels[indexedLevel].playerAttr.x, levelData.levelsData.levels[indexedLevel].playerAttr.y);
        this.startTimer();
    },
    sendToBonusRound: function() {
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
        pause_label.events.onInputUp.add(this.pause, this);

        nextLevelSound.play();
        indicatedLevel.text = 'Bonus!';

        platforms = this.game.add.physicsGroup();

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
        for (var i = 0; i < bonusLevelData.bonuslevelsData.levels[bonusLevel].starNumbers; i++) {
            //  Create a star inside of the 'stars' group
            var star = stars.create(i * 70, 0, 'star');

            //  Let gravity do its thing
            star.body.gravity.y = 9;
            star.body.gravity.x = this.game.rnd.integerInRange(0, 11);
            star.reset(this.game.rnd.integerInRange(0, 780), this.game.rnd.integerInRange(0, 45));
            star.body.collideWorldBounds = true;

            //  This just gives each star a slightly random bounce value
            star.body.bounce.y = 0.7 + Math.random() * 0.2;
            // make sure stars bounce off of walls
            star.body.bounce.set(1);
            star.checkWorldBounds = true;
            star.events.onOutOfBounds.add(this.starOut, this);
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
        timer.loop(1000, this.updateCounter, this);

        timer.start();

        bonusLevel += 1;
    },
    onGameWin: function() {
        highScore = this.game.add.text(w / 2, h / 2 - 100, 'Congratulations, you have won the game!', {
            font: '32px Sniglet',
            fill: '#ffffff'
        });
        highScore.anchor.setTo(0.5, 0.5);
        pause_label.events.onInputUp.removeAll();
        stars.removeAll();
        rocks.removeAll();
        endScoreText.anchor.setTo(0.5, 0.5);
        endScoreText.inputEnabled = true;
        endScoreText.input.useHandCursor = true;
        endScoreText.events.onInputUp.add(this.restart, this);
        timer.stop();
        rockReleaseTimer.stop();
        player.kill();
        winsong.play();
        this.saveScores();
    },
    saveScores: function() {
        // save score
        var playerScores = [];
        playerScores = JSON.parse(localStorage.getItem('highscores'));
        if (localStorage.getItem('highscores') !== null && score > 0) {



            if (playerScores.length > 4) {
                playerScores.shift(); // remove earliest score if there are 5 recent scores racked up
            }

            // set best score only if score is better than last, or doesnt exist yet
            if (score > parseInt(localStorage.getItem('bestScore')) || localStorage.getItem('bestScore') == "") {
                localStorage.setItem('bestScore', score);
            }
            playerScores.push(score);
            localStorage.setItem('highscores', JSON.stringify(playerScores));

        }


        // show UI

        scoreBoard = this.game.add.text(
            w / 2, 100,
            'Your Scores: \n' + this.displayScoreLayout(playerScores, localStorage.getItem('bestScore')), {
                font: '30px Sniglet',
                fill: '#fff'
            }
        );
        scoreBoard.anchor.setTo(0.5, 0.1);
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
                w / 2 - 65, h / 2 - 180 + spacing,
                numCountDisplay + ". " + playerScores[i] + " points \n", {
                    font: '25px Sniglet',
                    fill: '#fff'
                },
                scoreBoardFullData
            );

            spacing += 40;
        }

        // add player best
        var bestplayerTitle = this.game.add.text(
            50, h / 2 - 200,
            "Your Best Score:", {
                font: '25px Sniglet',
                fill: '#fff'
            },
            scoreBoardFullData
        );

        var bestPlayerScore = this.game.add.text(
            0, h / 2 - 150,
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
            y: h / 2 - 100
        }, 1100, Phaser.Easing.Linear.None);
        moveTweeny.start();

        return scoreBoardData;
    },
    toggleSound: function() {
    	// mutes all game sounds
    	soundIcon.destroy();

    	if (isGameSoundOn) {
    		this.game.sound.mute = false;
    		isGameSoundOn = false;
    		soundIcon = this.game.add.sprite(w/2 + 370, 30, 'soundIcon');

    	} else {
    		this.game.sound.mute = true;
    		isGameSoundOn = true;
    		soundIcon = this.game.add.sprite(w/2 + 370, 30, 'soundIconDisabled');

    	}

    	soundIcon.scale.setTo(0.5, 0.5);
        soundIcon.inputEnabled = true;
	    soundIcon.input.useHandCursor = true;
	    soundIcon.events.onInputUp.add(this.toggleSound, this);
	    soundIcon.anchor.setTo(0.5, 0.5);

	    var moveTween = this.game.add.tween(soundIcon);
        moveTween.to({angle:360}, 500, Phaser.Easing.Linear.None);
        moveTween.start();

        
    },
    unpause: function() {

    	if (this.game.paused) {
    		this.game.paused = false;

	        choiseLabel.destroy();
	        pause_label.text = "Menu";

	        if (isGameSoundOn) {
    		this.game.sound.mute = true;

	    	} else {
	    		this.game.sound.mute = false;

	    	}
    	}
        
    },
    restartAll: function() {
    	this.game.paused = false;
        this.game.state.start("TheGame");
    },
    pause: function() {

    	this.game.paused = true;

    	// And a label to illustrate which menu item was chosen. (This is not necessary)
        choiseLabel = this.game.add.text(w/2, h/2, 'Click to continue', { font: '30px Arial', fill: '#fff' });
        choiseLabel.anchor.setTo(0.5, 0.5);

        // When the pause button is pressed, we pause the game
        //this.game.paused = true;
        // YOU LEFT OFF HERE
        /*
        this.game.physics.arcade.isPaused=true;
        pause_label.text = "Paused";

        var textDisplayGroup = this.game.add.physicsGroup();

        // Then add the menu
        menu = this.game.add.sprite(w / 2 - 80, h / 2, 'menu');
        menu.anchor.setTo(0.5, 0.5);
        menu.scale.setTo(0.5, 0.5);
        menu.inputEnabled = true;
        menu.input.useHandCursor = true;

        var resume = this.game.add.text(w/2 - 30, h/2 - 90, 'Resume', { fontSize: '32px Arial', fill: '#000000' }, textDisplayGroup);  
		    resume.inputEnabled = true;
		    resume.input.useHandCursor = true;
		    resume.events.onInputUp.add(this.unpause, this);

		/*var restart = this.game.add.text(w/2 - 30, h/2 - 0, 'Restart', { fontSize: '32px Arial', fill: '#000000' }, textDisplayGroup);  
		    restart.inputEnabled = true;
		    restart.input.useHandCursor = true;
		    restart.events.onInputUp.add(this.restartAll, this);
		    restart.anchor.setTo(0.5,0.5);   

		var quit = this.game.add.text(w/2 - 30, h/2 + 90, 'Quit', { fontSize: '32px Arial', fill: '#000000' }, textDisplayGroup);  
		    quit.inputEnabled = true;
		    quit.input.useHandCursor = true;
		    //resume.events.onInputUp.add(this.restartAll(), this);
		    quit.anchor.setTo(0.5,0.5);  */      
		

		//this.game.world.bringToTop(textDisplayGroup);    
        //the "click to restart" handler
        //game.input.onTap.addOnce(restart,this);

        // And a label to illustrate which menu item was chosen. (This is not necessary)
        /*choiseLabel = this.game.add.text(w / 2, h - 150, 'Click outside menu to continue', {
            font: '30px Arial',
            fill: '#fff'
        }); 
        choiseLabel.anchor.setTo(0.5, 0.5);*/
    },
    playerOut: function(player) {
        console.log("hit");
    },
    starOut: function(star, event) {
        remainingStars.length -= 1;
        //console.log(remainingStars.length);
    },
    updateCounter: function() {
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
            this.gameEnd();

        } else if (timerTotal <= 10) {
            timerText.fill = '#FF0000';

            var zoomTween = this.game.add.tween(timerText.scale);
            zoomTween.to({
                x: 1.2,
                y: 1.2
            }, 700, Phaser.Easing.Elastic.Out);
            zoomTween.onComplete.addOnce(function() {
                zoomTween.to({
                    x: 1,
                    y: 1
                }, 300, Phaser.Easing.Elastic.Out);
            }, this);
            zoomTween.start();
        } else {
            timerText.fill = '#ffffff';
        }
    },
    startTimer: function() {
        timerTotal = levelData.levelsData.levels[indexedLevel].timeLimit;
        timerText.text = 'Time: ' + levelData.levelsData.levels[indexedLevel].timeLimit;

        //  Set a TimerEvent to occur after every second
        timer.loop(1000, this.updateCounter, this);

        timer.start();
    },
}