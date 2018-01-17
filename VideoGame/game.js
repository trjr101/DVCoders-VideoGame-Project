var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update});

//constants
var PLAYER_SPEED = 200;
var PLAYER_GRAVITY = 500;
var PLAYER_JUMP = -500;
var MAXSPEED = 200;
var PLAYER_FRICTION = 0.96;
var ENEMY_SPAWN_RATE = 3000;//*
var ENEMY_SPEED = 200;
var ENEMY_LIFESPAN = 9000;

//variables
var lastSpawnTime = 0;
var score = 0;
var stop = false;

//objects
var player;
var floor;
var floor1;
var floor2;
var floor3;
var rifle;
var enemies;
var lastSpawn;
var textScore;

function preload() {

	game.load.image("gray",			"asset/gray.jpg");
	game.load.image("platform",		"asset/platform.jpg");
	game.load.image("player", 		"asset/man.gif");
	game.load.image("red",          "asset/red.png");
}

function create() {
	game.add.tileSprite(0, 0, game.width, game.height, "gray");

	player = game.add.sprite(300, 400, "player");
	player.anchor.set(0.5,0.5);

	floor = game.add.sprite(400,550, "platform");
	floor.width = 700;
	floor.height = 40;
	floor.anchor.set(0.5,0.5);

	//physics engine
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.enable(player, Phaser.Physics.ARCADE);

	player.body.allowGravity = true;
	player.body.gravity.y = PLAYER_GRAVITY;

	floor1 = game.add.sprite(150, 350, "platform");
	floor1.width = 200;
	floor1.height = 40;
	floor1.anchor.set(0.5, 0.5);

	floor2 = game.add.sprite(650, 350, "platform");
	floor2.width = 200;
	floor2.height = 40;
	floor2.anchor.set(0.5, 0.5);
	
	floor3 = game.add.sprite(400, 200, "platform");
	floor3.width = 300;
	floor3.height = 40;
	floor3.anchor.set(0.5, 0.5);

	game.physics.enable(floor, Phaser.Physics.ARCADE);
	floor.body.immovable = true;

	game.physics.enable(floor1, Phaser.Physics.ARCADE);
	floor1.body.immovable = true;

	game.physics.enable(floor2, Phaser.Physics.ARCADE);
	floor2.body.immovable = true;

	game.physics.enable(floor3, Phaser.Physics.ARCADE);
	floor3.body.immovable = true;

	player.body.collideWorldBounds = true;

	rifle = game.add.weapon(20, 'red');
	rifle.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
	rifle.bulletSpeed = 1000;
	rifle.fireRate = 500;

	enemies = game.add.group();
	enemies.enableBody = true;
	enemies.physicsBodyType = Phaser.Physics.ARCADE;

	enemies.createMultiple(25, "player");
	enemies.setAll('anchor.x', 0.5);
	enemies.setAll('anchor.y', 0.5);

	textScore = game.add.text(100,100, "", { font: "30px Arial", fill: "#ff0044", align: "center" });

	//textScore = game.add.text(100, 100, “”, { font: "30px Arial", fill: "#ff0044", align: "center" });

}//create

function update() {
	if (stop === true) {
		return;
	}
	collision();

	speedLimit();

	if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    	rifle.trackSprite(player, player.width, 0);
    	if(player.width > 0) {
      	rifle.fireAngle = 0;
    	}
    	else {
      	rifle.fireAngle = 180;
    	}
    	rifle.fire();
	}

	enemySpawn();

	game.physics.arcade.collide(enemies, floor);
	game.physics.arcade.collide(enemies, floor1);
	game.physics.arcade.collide(enemies, floor2);
	game.physics.arcade.collide(enemies, floor3);

	enemies.forEachExists(enemyMove, this);

	if (game.physics.arcade.collide(enemies, player)) {
		player.kill();
		enemies.killAll();
		stop = true;
	}

	let updatedScore = "Score: " + score.toString();
	textScore.setText(updatedScore);
}//update

function movePlayer()
{
	if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
	{
		player.body.acceleration.x = -PLAYER_SPEED;
		player.width = -Math.abs(player.width);
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
	{
		player.body.acceleration.x = PLAYER_SPEED;
		player.width = Math.abs(player.width);
	}

	if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
	{
		player.body.y += 10;
	}

}//movePlayer


function collision()
{
	if ((game.physics.arcade.collide(player, floor) || game.physics.arcade.collide(player, floor1) ||
	 game.physics.arcade.collide(player, floor2) || game.physics.arcade.collide(player, floor3)) && player.body.touching.down) {
	 	friction();
	 	movePlayer();
		if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
			player.body.velocity.y = PLAYER_JUMP;
		}
	}
	if (player.body.onFloor()) {
		player.body.velocity.y = PLAYER_JUMP;
	}
} //collision

function speedLimit()
{
	if (Math.abs(player.body.velocity.x) > MAXSPEED) {
		if (player.body.velocity.x >= 0) {
			player.body.velocity.x = MAXSPEED;
		}
		if (player.body.velocity.x <= 0) {
			player.body.velocity.x = -MAXSPEED;
		}
	}
} //speedLimit

function friction()
{
	player.body.velocity.x = player.body.velocity.x * PLAYER_FRICTION;
} //friction

function enemySpawn() {
	if( game.time.now >= (lastSpawnTime + ENEMY_SPAWN_RATE) ) {
    
    	lastSpawnTime = game.time.now;

    	var enemy = enemies.getFirstExists(false);

    	if (enemy) {
      		enemy.reset(400, 100);
      		enemy.lifespan = ENEMY_LIFESPAN;
      		game.physics.enable(enemy, Phaser.Physics.ARCADE);
      		enemy.body.allowGravity = true;
      		enemy.body.gravity.y = PLAYER_GRAVITY;
      		enemy.body.collideWorldBounds = true;
    	}
	}
} //enemySpawn

function enemyMove(enemy) {
	if (enemy.body.onWall()) {
		enemy.width *= -1;
	}

	if (enemy.width > 0) {
			enemy.body.velocity.x = ENEMY_SPEED;
	} else {
			enemy.body.velocity.x = -ENEMY_SPEED;

	}

	rifle.bullets.forEachExists(bulletHitEnemy, this, enemy);
} //enemyMove

function bulletHitEnemy(bullet, enemy) {
	if (game.physics.arcade.collide(bullet, enemy)) {
		enemy.kill();
		bullet.kill();
		score += 100;
	}
} //bulletHitEnemy