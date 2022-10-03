// const { Phaser } = require("./phaser.min");
var food;
var move;
var jump;
let config = {
    type: Phaser.auto,//determine which rendering type is better for your browser either canvas or web3gl
    scale: {
        mode:Phaser.Scale.FIT,
        width: 800,
        height: 600,
    },
    backgroundColor: 0xffffcc,
    //add physic using physics engine present in phaser js
    //configure physics
    physics: {
        default: 'arcade',
        arcade: {
            //gravity can be given in any direction
            //giving gravity on y direction
            gravity: {
                y: 1000,
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

let game = new Phaser.Game(config);

function preload()
{
    this.load.image("ground", "Assets/topground.png");
    this.load.image("apple", "Assets/apple.png");
    this.load.image("sky", "Assets/background.png");
    this.load.image("ray", "Assets/ray.png");
    this.load.spritesheet("dude", "Assets/dude.png", { frameWidth: 32, frameHeight: 48 });
    //search openGameArt explore more art work
    //load audios
    this.load.audio('food', 'sounds/food.mp3');
    this.load.audio('jump', 'sounds/green.mp3');
    this.load.audio('move', 'sounds/move.mp3');


}
function create()
{
    food = this.sound.add('food');
    move = this.sound.add('move');
    jump = this.sound.add('jump');
    W = game.config.width;
    H = game.config.height;

    let ground = this.add.tileSprite(0, H - 128,W,128, 'ground');
    ground.setOrigin(0, 0);
    //create background sky
    let background = this.add.sprite(0, 0, 'sky');
    background.setOrigin(0, 0);
    background.displayWidth = W;
    background.displayHeight = H;
    //depth will help in applying sky to the background of ground.
    background.depth = -2;
    //create rotating rays using tweens
    let rays = [];
    for (let i = -10; i <= 10; i++) {
        let ray = this.add.sprite(W / 2, H - 128, 'ray');
        ray.setOrigin(0.5, 1);
        ray.alpha = 0.2;
        ray.depth = -1;
        ray.displayHeight = 1.5 * H;
        ray.displayHeight = 1.2 * H;
        ray.angle = i * 20;
        rays.push(ray);
    }
    //tween
    this.tweens.add({
        targets: rays,
        props: {
            angle: {
                value: "+=20",
            },
        },
        duration: 8000,
        repeat: -1,
    });


    this.player = this.physics.add.sprite(100, 100, 'dude', 4);

    //convert ground object to physics object
    this.physics.add.existing(ground);
    ground.body.allowGravity = false;
    ground.body.immovable = true;
    //use inbuilt collision mechanism to detect collision
    this.physics.add.collider(ground, this.player);
    //add bouncing effect
    this.player.setBounce(0.5);
    //check to make sure player doesn't go out of the window
    this.player.setCollideWorldBounds(true);
    //add a group of apples == physical object hence use physics
    let fruits = this.physics.add.group({
        key: "apple",
        repeat: 8,
        setScale: {x:0.2, y:0.2},
        setXY: { x: 10, y: 10, stepX: 100 }
    })
    this.physics.add.collider(ground, fruits);
    //add bouncing effect to all the apples
    fruits.children.iterate(function (f) {
        f.setBounceY(Phaser.Math.FloatBetween(0.4, 0.7));
    });
    //create more static platforms
    let platforms = this.physics.add.staticGroup();
    platforms.create(500, 350, 'ground').setScale(2,0.5).refreshBody();
    platforms.create(700, 200, 'ground').setScale(2,0.5).refreshBody();
    platforms.create(100, 200, 'ground').setScale(2, 0.5).refreshBody();
    this.physics.add.collider(platforms, fruits);
    this.physics.add.collider(platforms, this.player);
    //player animations and movements
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat:-1
    });
    this.anims.create({
        key: 'center',
        frames: this.anims.generateFrameNumbers('dude', { start: 4, end: 4 }),
        frameRate: 10,
        // repeat:-1
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat:-1
    });
    //keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.overlap(this.player, fruits, eatFruit, null, this);
    
    //create camera
    //define area for camera
    this.cameras.main.setBounds(0, 0, W, H);
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, true);
    this.cameras.main.setZoom(1.5);

}
function eatFruit(player, fruit) {
    fruit.disableBody(true, true);
    food.play();
}
function update()
{
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-150);//velocity in -ve x direction
        this.player.anims.play('left', true);
        // move.play();
    }
    else if (this.cursors.right.isDown)
    {
        this.player.setVelocity(150);
        this.player.anims.play('right', true);
        // move.play();
    }
    else {
        this.player.setVelocityX(0);
        this.player.anims.play('center', true);
        // jump.play();
    }
    //add jumping ability, stp when in air
    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-700);
        jump.play();
    }
}