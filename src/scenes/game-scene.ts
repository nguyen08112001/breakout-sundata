import { Ball } from '../objects/Ball';
import { Brick } from '../objects/Brick';
import { Player } from '../objects/Player';
import { settings } from '../settings';

const BRICK_COLORS: number[] = [0x0000ff, 0x00ff00, 0xff0000, 0xffffff];

export class GameScene extends Phaser.Scene {
    private ball: Ball;
    private bricks: Phaser.GameObjects.Group;
    private player: Player;
    private scoreText: Phaser.GameObjects.BitmapText;
    private highScoreText: Phaser.GameObjects.BitmapText;
    private livesText: Phaser.GameObjects.BitmapText;
    private spotlight: Phaser.GameObjects.Light;
    private curosrlight: Phaser.GameObjects.Light;

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
        //BACKGROUND
        this.add.sprite(0, 0, 'bg').setPipeline('Light2D')
        .setAlpha(0.2)
        .setOrigin(0);

        //light2d
        this.lights.enable();
        this.lights.setAmbientColor(0x808080);

        // game objects
        // ------------

        // bricks
        this.bricks = this.add.group();

        const BRICKS = settings.LEVELS[settings.currentLevel].BRICKS;
        const WIDTH = settings.LEVELS[settings.currentLevel].WIDTH;
        const HEIGHT = settings.LEVELS[settings.currentLevel].HEIGHT;
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                var _x = (settings.BRICK.WIDTH + settings.BRICK.SPACING) * x;
                var _y = settings.BRICK.MARGIN_TOP +
                y * (settings.BRICK.HEIGHT + settings.BRICK.SPACING);
                this.bricks.add(
                new Brick({
                    scene: this,
                    x: _x,
                    y: _y,
                    width: settings.BRICK.WIDTH,
                    height: settings.BRICK.HEIGHT,
                    fillColor: BRICK_COLORS[BRICKS[y * 14 + x]]
                })
                .setPipeline('Light2D').setAlpha(0.5)
                );
            }
        }

        // Player
        this.player = new Player({
            scene: this,
            x: +this.game.config.width / 2 - 20,
            y: +this.game.config.height - 50,
            width: 100,
            height: 10
        });

        //Light
        this.spotlight = this.lights.addLight(400, 300, 280).setIntensity(6);
        this.spotlight.setColor(0xffffff);
        
        this.curosrlight = this.lights.addLight(400, 300, 280).setIntensity(6);
        this.curosrlight.setColor(0xffffff);

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
            delay: 5000,                // ms
            callback: this.createNewBallItem,
            //args: [],
            callbackScope: this,
            loop: true
        });

        // physics
        // -------
        this.physics.world.checkCollision.down = false;
        this.input.setDefaultCursor('url(./assets/images/cursor.cur), pointer')
    }
    private createNewBall() {
        //init image
        var ball = new Ball({ scene: this, x: this.player.x, y: this.player.y -200 });
        ball.applyInitVelocity();
        ball.body.setVelocityY(-300)

        //add collide with new ball
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
        this.add.particles('flares')
        .createEmitter({
            frame: [ 'red', 'blue', 'green', 'yellow' ],
            speed: { min: -800, max: 800 },
            angle: { min: -180, max: 0 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'SCREEN',
            lifespan: 300,
        })
        .explode(10, _player.x, _player.y)
    }

    private createNewBallItem() {
        var item = this.add.image(Phaser.Math.Between(0, this.sys.canvas.width), 200, 'new-ball-item').setScale(0.5)
        this.physics.world.enable(item);
        var body = item.body as Phaser.Physics.Arcade.Body;
        body.setVelocityY(100);

        this.physics.add.collider(
        this.player,
        item,
        () => {
            item.destroy()
            this.createNewBall()
        },
        null,
        this
        );

    }


    update(): void {
        this.spotlight.x = this.ball.x;
        this.spotlight.y = this.ball.y;
        this.curosrlight.x = this.input.activePointer.worldX;
        this.curosrlight.y = this.input.activePointer.worldY;

        this.player.x = this.input.activePointer.worldX;

        if (!this.ball.visible) {
            this.ball.setPosition(this.player.x, this.player.y - 200);
            this.ball.applyInitVelocity();
            this.ball.setVisible(true);
        }

        if (this.ball.y > this.game.config.height) {
            settings.lives -= 1;
            this.events.emit('livesChanged');

            if (settings.lives === 0) {
                this.gameOver();
            } else {
                this.player.body.setVelocity(0);
                this.ball.setPosition(0, 0);
                this.ball.body.setVelocity(0);
                this.ball.setVisible(false);
            }
        }
    }

    private ballBrickCollision(ball: Ball, brick: Brick): void {
        this.spotlight.setColor(brick.color)
        var img = this.add.image(brick.x, brick.y, 'broken-glass').setScale(0.1);
        this.tweens.add({
            targets: img,
            scale: 0.5,
            alpha: 0,
            duration: 3000,
            ease: 'Power4',
        })

        this.add.particles('broken').createEmitter({
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0},
            blendMode: 'ADD',
            active: true,
            lifespan: 3000,
            gravityY: 50,
            rotate: { start: 0, end:360*10, random: true}
        })
        .explode(5,brick.x, brick.y );

        settings.score += 10;
        this.events.emit('scoreChanged');

        brick.destroy();

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
