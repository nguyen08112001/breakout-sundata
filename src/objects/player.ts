import { IRectangleConstructor } from '../interfaces/interfaces';

export class Player extends Phaser.GameObjects.Rectangle {
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
        this.scene.add.existing(this);
    }

    private initRectangle(): void {
        this.setFillStyle(0xffffff);
    }

    private initPhysics(): void {
        this.scene.physics.world.enable(this);
        this.body.setCollideWorldBounds();
        this.body.setDragX(300);
        this.body.setImmovable(true);
    }

}
