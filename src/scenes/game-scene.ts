import { Ball } from '../objects/ball';
import { Brick } from '../objects/brick';
import { Player } from '../objects/player';
import { settings } from '../settings';

const BRICK_COLORS: number[] = [0xf2e49b, 0xbed996, 0xf2937e, 0xffffff];

export class GameScene extends Phaser.Scene {
  private ball: Ball;
  private bricks: Phaser.GameObjects.Group;
  private player: Player;
  private scoreText: Phaser.GameObjects.BitmapText;
  private highScoreText: Phaser.GameObjects.BitmapText;
  private livesText: Phaser.GameObjects.BitmapText;

  constructor() {
    super({
      key: 'GameScene'
    });
  }

  init(): void {
    settings.highScore = settings.score;
    settings.score = 0;
    settings.lives = 3;
  }

  create(): void {
    // game objects
    // ------------

    // bricks
    this.bricks = this.add.group();

    const BRICKS = settings.LEVELS[settings.currentLevel].BRICKS;
    const WIDTH = settings.LEVELS[settings.currentLevel].WIDTH;
    const HEIGHT = settings.LEVELS[settings.currentLevel].HEIGHT;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        this.bricks.add(
          new Brick({
            scene: this,
            x: (settings.BRICK.WIDTH + settings.BRICK.SPACING) * x,
            y:
              settings.BRICK.MARGIN_TOP +
              y * (settings.BRICK.HEIGHT + settings.BRICK.SPACING),
            width: settings.BRICK.WIDTH,
            height: settings.BRICK.HEIGHT,
            fillColor: BRICK_COLORS[BRICKS[y * 14 + x]]
          })
        );
      }
    }

    // player
    this.player = new Player({
      scene: this,
      x: +this.game.config.width / 2 - 20,
      y: +this.game.config.height - 50,
      width: 50,
      // width: this.sys.canvas.width,
      height: 10
    });

    // ball
    this.ball = new Ball({ scene: this, x: 0, y: 0 }).setVisible(false);

    // score
    this.scoreText = this.add.bitmapText(
      10,
      10,
      'font',
      `Score: ${settings.score}`,
      8
    );

    this.highScoreText = this.add.bitmapText(
      10,
      20,
      'font',
      `Highscore: ${settings.highScore}`,
      8
    );

    this.livesText = this.add.bitmapText(
      10,
      30,
      'font',
      `Lives: ${settings.lives}`,
      8
    );

    // collisions
    // ----------
    this.physics.add.collider(this.player, this.ball, this.createEmitter, null, this);

    this.physics.add.collider(
      this.ball,
      this.bricks,
      this.ballBrickCollision,
      null,
      this
    );

    // events
    // ------
    this.events.on('scoreChanged', this.updateScore, this);
    this.events.on('livesChanged', this.updateLives, this);
    this.time.addEvent({
      delay: 10000,                // ms
      callback: this.createNewBallItem,
      //args: [],
      callbackScope: this,
      loop: true
    });

    // physics
    // -------
    this.physics.world.checkCollision.down = false;
    var atlasTexture = this.textures.get('flares');
    var frames = atlasTexture.getFrameNames();
    for (var i = 0; i < frames.length; i++) {
      console.log(frames[i])
    }
    
  }
  private createNewBall() {
    var ball = new Ball({ scene: this, x: this.player.x, y: this.player.y -200 });
    ball.applyInitVelocity();
    this.physics.add.collider(this.player, ball, this.createEmitter, null, this);
    this.physics.add.collider(
      ball,
      this.bricks,
      this.ballBrickCollision,
      null,
      this
    );
  }

  private createEmitter(_player: Player, _ball: Ball) {
    var particles = this.add.particles('flares');
    //  Create an emitter by passing in a config object directly to the Particle Manager
      var emitter = particles.createEmitter({
        frame: [ 'red', 'blue', 'green', 'yellow' ],
        x: _player.x,
        y: _player.y,
        speed: { min: -800, max: 800 },
        angle: { min: -180, max: 0 },
        scale: { start: 0.3, end: 0 },
        blendMode: 'SCREEN',
        //active: false,
        lifespan: 300,
        // gravityY: 800,
        // maxParticles: 10,
        // on: false
      });

      emitter.explode(10, _player.x, _player.y)
  }

  private createNewBallItem() {
    var item = this.add.image(Phaser.Math.Between(0, this.sys.canvas.width), 200, 'new-ball-item').setScale(0.5);
    this.physics.world.enable(item);
    var body = item.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(200);

    this.physics.add.collider(
      this.player,
      item,
      () => {
        console.log(123)
        item.destroy()
        this.createNewBall()
      },
      null,
      this
    );

  }


  update(): void {
    this.player.update();
    this.player.x = this.input.activePointer.worldX;
    if (!this.ball.visible) {
      this.ball.setPosition(this.player.x, this.player.y - 200);
      this.ball.applyInitVelocity();
      this.ball.setVisible(true);
    }

    if (this.ball.y > this.game.config.height) {
      return
      settings.lives -= 1;
      this.events.emit('livesChanged');

      if (settings.lives === 0) {
        this.gameOver();
      } else {
        this.player.body.setVelocity(0);
        this.player.resetToStartPosition();
        this.ball.setPosition(0, 0);
        this.ball.body.setVelocity(0);
        this.ball.setVisible(false);
      }
    }
  }

  private ballBrickCollision(ball: Ball, brick: Brick): void {
    brick.destroy();
    var img = this.add.image(brick.x, brick.y, 'broken-glass').setScale(0.1);
    this.tweens.add({
      targets: img,
      scale: 0.5,
      alpha: 0,
      duration: 3000,
      ease: 'Power3'
    })

    var emitter = this.add.particles('broken').createEmitter({
        speed: { min: -100, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0},
        // scale: 0.5,
        // alpha: { start: 1, end: 0 },
        blendMode: 'ADD',
        active: true,
        lifespan: 3000,
        gravityY: 50,
        // on: false,
    });
    emitter.explode(5,brick.x, brick.y );

    // this.time.addEvent({
    //   delay: 1500,
    //   callback: () => {
    //     emitter.setScale({ start: 0.05, end: 0 })
    //     // emitter.setLifespan(1000)s: 0.5, end: 0 })
    //   }
    // })
    

    

    settings.score += 10;
    this.events.emit('scoreChanged');

    if (this.bricks.countActive() === 0) {
      // all bricks are gone!
    }
  }

  private gameOver(): void {
    this.scene.restart();
  }

  private updateScore(): void {
    this.scoreText.setText(`Score: ${settings.score}`);
    this.scoreText.setScale(2)
    this.tweens.add({
      targets: this.scoreText,
      scale: 1,
      duration: 2000,
      ease: 'Power3'
    })
  }

  private updateLives(): void {
    this.livesText.setText(`Lives: ${settings.lives}`);
  }
}
