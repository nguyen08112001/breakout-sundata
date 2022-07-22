import { IRectangleConstructor } from '../interfaces/interfaces';

export class Ball extends Phaser.GameObjects.Rectangle {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: IRectangleConstructor) {
        super(
        aParams.scene,
        aParams.x,
        aParams.y,
        aParams.width,
        aParams.height,
        aParams.fillColor,
        aParams.fillAlpha
        );

        this.initRectangle();
        this.initPhysics();
        this.initEmitter();
        this.scene.add.existing(this);
    }
    initEmitter() {
        this.scene.add.particles('flares')
        .createEmitter({
            frame: ['yellow', 'red', 'blue', 'green', 'white'],
            radial: false,
            lifespan: 1000,
            speedX: { min: -100, max: 100 }, 
            quantity: 2,
            scale: { start: 0.3, end: 0, ease: 'Power3' },
            blendMode: 'ADD',
            follow: this
        });
    }

    private initRectangle(): void {
        this.setOrigin(0.05, 0.05);
        this.width = 10;
        this.height = 10;
        this.setFillStyle(0xffffff);
    }

    private initPhysics(): void {
        this.scene.physics.world.enable(this);
        this.body.setBounce(1, 1);
        this.body.setCollideWorldBounds();
    }

    public applyInitVelocity(): void {
        this.body.setVelocity(Phaser.Math.RND.between(-200, 200), 300);
        this.body.speed = 800;
    }
}
