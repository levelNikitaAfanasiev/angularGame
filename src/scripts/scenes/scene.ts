import { threadId } from "worker_threads";
import { on } from "cluster";

export class Scene extends Phaser.Scene {
    star:Phaser.Physics.Arcade.Sprite;
    midleStar:Phaser.GameObjects.Sprite;
    finaleStar:Phaser.GameObjects.Sprite;
    mouse:Phaser.Input.Pointer;
    keyA: Phaser.Input.Keyboard.Key;
    dudeMoves: Phaser.Types.Input.Keyboard.CursorKeys;
    tween:Phaser.Tweens.Tween;
    platforms:Phaser.Physics.Arcade.StaticGroup;
    player:Phaser.Physics.Arcade.Sprite;
    coins:Phaser.Physics.Arcade.Group;
    bombtexture: string[];
    dangerousPath: Phaser.Curves.Path;
    dangerousFollower: Phaser.GameObjects.PathFollower;
    dangerousGraphic: Phaser.GameObjects.Graphics;
    bomb: Phaser.Physics.Arcade.Image;
    finalZone: Phaser.GameObjects.Zone;
    finalgraphics: Phaser.GameObjects.Graphics;
    graphics: Phaser.GameObjects.Graphics;
    arrow: Phaser.GameObjects.Image;
    middleZone: Phaser.GameObjects.Zone;
    events:Phaser.Events.EventEmitter;
    finalStarTween: Phaser.Tweens.Tween;
    text: Phaser.GameObjects.Text;
    lineWidth:number = 2;
    constructor(){
        super({key:'startGame'});
    }
    private preload(): void {
        this.load.image('star','src/assets/star.png');
        this.load.image('arrow','src/assets/arrow.png');
        this.load.image('ground','src/assets/ground.png');
        this.load.spritesheet('dude','src/assets/dude.png',{frameWidth:102,frameHeight:215});
        this.load.image('coin','src/assets/coin.png');
        this.bombtexture = [
            '.3.',
            '333',
            '.3.'
        ];
        this.textures.generate('bombTexture',{data:this.bombtexture,   pixelWidth: 6 });
    }
    private create(): void{
       
        
        this.bomb = this.physics.add.image(400,300, 'bombTexture');
       

        this.dangerousGraphic = this.add.graphics({x:20,y:289,});
        this.dangerousPath = new Phaser.Curves.Path();
        this.dangerousPath.lineTo(650, 0);
        this.dangerousGraphic.lineStyle(2, 0xffff00);
        this.dangerousFollower = this.add.follower(this.dangerousPath, 20, 289, 'bombTexture');
        this.dangerousFollower.startFollow({yoyo: true,repeat:-1,duration:3000});
        this.player = this.physics.add.sprite(300, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(400);  
        
        this.dangerousPath.draw(this.dangerousGraphic);
        
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(250,900, 'ground').setScale(1.5).refreshBody();

        this.platforms.create(600, 400, 'ground').setScale(0.5).refreshBody();
        this.platforms.create(20, 400, 'ground').setScale(0.5).refreshBody();
        this.arrow = this.add.image(70,70,'arrow');
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.dudeMoves = this.input.keyboard.createCursorKeys();
        this.star = this.physics.add.sprite(60,60,'star').setScale(3).setInteractive();
        this.finaleStar = this.physics.add.sprite(500,300,'star').setInteractive();
        this.midleStar = this.physics.add.sprite(250,300,'star').setInteractive();
        this.physics.add.overlap(this.player, this.dangerousFollower, this.bombExplode, null, this)
        
        this.star.setCollideWorldBounds(true);
        

        this.player.once('pointerdown',function(){
            this.player.disableBody(true,true);
        }, this);


        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude',{start:0, end:8}),
            repeat: -1,
            frameRate:15
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude',{start:8, end:0}),
            repeat: -1,
            frameRate:15
        });
        this.anims.create({
            key: 'stay',
            frames: [{key: 'dude', frame:0}]
        });


        this.physics.add.collider(this.player, this.platforms);

        let path = new Phaser.Curves.Path();
        path.lineTo(this.midleStar.x - this.star.x, this.midleStar.y - this.star.y);
        
       this.arrow.rotation = 0.9;
       this.mouse=this.input.mousePointer;
       var r = this.input.setDraggable(this.star);
        r.setHitAreaRectangle(this.star,20,30,40,50)
        


       this.middleZone = this.add.zone(this.midleStar.x,this.midleStar.y,this.midleStar.width,this.midleStar.height).setRectangleDropZone(this.midleStar.width,this.midleStar.height);
        
        
       this.graphics = this.add.graphics(this.middleZone);
       this.graphics.lineStyle(2, 0xffff00);

        var follower = this.add.follower(path, 60, 60, 'star');
        follower.startFollow({yoyo: true,repeat:-1});

       var graphics2 = this.add.graphics(this.star);
       graphics2.lineStyle(2, 0xffff00);
       path.draw(graphics2);
       
       this.coins = this.physics.add.group({
        key: 'coin',
        repeat: 4,
        setXY: { x: 50, y:250, stepX: 150 }
        });  
    
        this.physics.add.collider(this.platforms, this.coins);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        this.bomb.setCollideWorldBounds(true);
        this.physics.add.collider(this.bomb,this.platforms);
        this.bomb.setGravityY(500);
        
        this.physics.add.overlap(this.player, this.bomb, this.bombExplode, null, this);    

       this.tween = this.tweens.add({
        targets: this.arrow,
        x:this.midleStar.x,
        y:this.midleStar.y,
        ease: 'Linear',
        duration: 3000,
        repeat: -1
        });
        this.text = this.add.text(100, 200, '', { fontFamily: '"Roboto Condensed"',fontSize: 20, color: '#2d2d2d' });
       this.graphics.strokeRect(0 - this.middleZone.input.hitArea.width / 2, 0 - this.middleZone.input.hitArea.height / 2, this.middleZone.input.hitArea.width, this.middleZone.input.hitArea.height);
    this.input.on('dragstart', function (pointer, gameObject) {
        this.children.bringToTop(gameObject);
        }, this);
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        if(dragX > 50 && dragX < 600)
        {
              gameObject.x = dragX;
        }
        if(dragY > 50 && dragY < 300)
        {
              gameObject.y = dragY;
        }
           
    });
    this.input.once('dragenter', this.firstDragEnter ,this);
    //this.input.once('dragenter', this.secondDragEnter,this);
    this.bomb.setVisible(false);
   // this.input.on('dragleave', function (pointer, gameObject, dropZone) {

      //  this.graphics.clear();
     //   this.graphics.lineStyle(2, 0xffff00);
       // this.graphics.strokeRect(0 - this.zone.input.hitArea.width / 2, 0 - this.zone.input.hitArea.height / 2, this.zone.input.hitArea.width, this.zone.input.hitArea.height);

  //  },this);
  //  this.input.on('drop', function (pointer, gameObject, dropZone) {
//
//        gameObject.x = dropZone.x;
 //       gameObject.y = dropZone.y;

 //       gameObject.input.enabled = false;
     
//    });
    
 

        
    this.createSpeechBubble(150, 400, 150, 50, '“Just test”')
    this.createSpeechBubbleWithoutArrow(150, 100, 150, 50, '“Just test 2”')
    
    this.children.bringToTop(this.player);

    }
    
    public update():void{
        this.star.rotation += 0.02;
       // this.graphics.clear();
        if(this.lineWidth >= 2 && this.lineWidth < 4)
        {
            this.lineWidth -=1;
        }
        else if(this.lineWidth >= 1 && this.lineWidth < 2)
        {
             this.lineWidth +=1;
        }
        this.graphics.lineStyle(this.lineWidth, 0xffff00)
        //console.log(this.lineWidth);
        if(!this.player.body.enable)
        {
            this.bomb.setVisible(true);
            this.text.setFontSize(100);
            this.text.text = 'Game Over';
            this.input.setDraggable(this.star,false);
        }
      //  if (!this.tween.isPlaying())
       // {
       //     this.tween.restart();
        //}
        if(this.keyA.isDown)
        {
            this.scene.restart();
        }
        if(this.dudeMoves.right.isDown)
        {
            this.player.setVelocityX(50);
            this.player.anims.play('right', true);
        }else if(this.dudeMoves.left.isDown){
            this.player.setVelocityX(-50);
            this.player.anims.play('left',true);
        }else{
            this.player.setVelocityX(0);
            this.player.anims.play('stay',true);
        }
        if (this.dudeMoves.up.isDown && this.player.body.touching.down)
        {
              this.player.setVelocityY(-500);
        }
    }
    collectCoin(player, coin){
        coin.disableBody(true, true);
    }
    bombExplode(player,bomb){
        player.disableBody(true, true);
    }

    createSpeechBubble (x, y, width, height, quote){
        var bubbleWidth = width;
        var bubbleHeight = height;
        var bubblePadding = 10;
        var arrowHeight = bubbleHeight / 4;

        var bubble = this.add.graphics({ x: x, y: y });

    //  Bubble shadow
        bubble.fillStyle(0x222222, 0.5);
        bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

    //  Bubble color
        bubble.fillStyle(0xffffff, 1);

    //  Bubble outline line style
        bubble.lineStyle(4, 0x565656, 1);

    //  Bubble shape and outline
        bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
        bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    //  Calculate arrow coordinates
        var point1X = Math.floor(bubbleWidth / 7);
        var point1Y = bubbleHeight;
        var point2X = Math.floor((bubbleWidth / 7) * 2);
        var point2Y = bubbleHeight;
        var point3X = Math.floor(bubbleWidth / 7);
        var point3Y = Math.floor(bubbleHeight + arrowHeight);

    //cloud arrow
        bubble.lineStyle(4, 0x222222, 0.5);
        bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);
        bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
        bubble.lineStyle(2, 0x565656, 1);
        bubble.lineBetween(point2X, point2Y, point3X, point3Y);
        bubble.lineBetween(point1X, point1Y, point3X, point3Y);

        var content = this.add.text(0, 0, quote, { fontFamily: 'Arial', fontSize: 20, color: '#000000', align: 'center', wordWrap: { width: bubbleWidth - (bubblePadding * 2) } });

        var bounds = content.getBounds();

        content.setPosition(bubble.x + (bubbleWidth / 2) - (bounds.width / 2), bubble.y + (bubbleHeight / 2) - (bounds.height / 2));
    }
    createSpeechBubbleWithoutArrow(x, y, width, height, quote){
        var bubbleWidth = width;
        var bubbleHeight = height;
        var bubblePadding = 10;
        var arrowHeight = bubbleHeight / 4;

        var bubble = this.add.graphics({ x: x, y: y });

    //  Bubble shadow
        bubble.fillStyle(0x222222, 0.5);
        bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

    //  Bubble color
        bubble.fillStyle(0xffffff, 1);

    //  Bubble outline line style
        bubble.lineStyle(4, 0x565656, 1);

    //  Bubble shape and outline
        bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
        bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
        var content = this.add.text(0, 0, quote, { fontFamily: 'Arial', fontSize: 20, color: '#000000', align: 'center', wordWrap: { width: bubbleWidth - (bubblePadding * 2) } });

        var bounds = content.getBounds();

        content.setPosition(bubble.x + (bubbleWidth / 2) - (bounds.width / 2), bubble.y + (bubbleHeight / 2) - (bounds.height / 2));
    }
    secondDragEnter(pointer, gameObject, dropZone) {
        this.finalgraphics.clear();
        this.finalgraphics.lineStyle(2, 0x00ffff);
        this.finalgraphics.strokeRect(0 - this.finalZone.input.hitArea.width / 2, 0 - this.finalZone.input.hitArea.height / 2, this.finalZone.input.hitArea.width, this.finalZone.input.hitArea.height);
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;  
        this.tweens.remove(this.finalStarTween);
        this.arrow.destroy();
    }
    firstDragEnter(pointer, gameObject, dropZone) {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0x00ffff);
        this.graphics.strokeRect(0 - this.middleZone.input.hitArea.width / 2, 0 - this.middleZone.input.hitArea.height / 2, this.middleZone.input.hitArea.width, this.middleZone.input.hitArea.height);
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        this.tweens.remove(this.tween);
       
        this.arrow.rotation -=0.9;
        
        this.arrow.x = this.middleZone.x;
        this.arrow.y = this.middleZone.y;
        this.finalStarTween  = this.tweens.add({
            targets: this.arrow,
            x:this.finaleStar.x,
            y:this.finaleStar.y,
            ease: 'Linear',
            duration: 3000,
            repeat: -1
        });
        this.events.removeListener('dragenter');
        this.events.removeListener('dragleave');
        dropZone.destroy();
        this.graphics.clear();
        this.finalZone = this.add.zone(this.finaleStar.x,this.finaleStar.y,this.finaleStar.width,this.finaleStar.height).setRectangleDropZone(this.finaleStar.width,this.finaleStar.height);
        this.finalgraphics = this.add.graphics(this.finalZone);
        this.finalgraphics.strokeRect(0 - this.finalZone.input.hitArea.width / 2, 0 - this.finalZone.input.hitArea.height / 2, this.finalZone.input.hitArea.width, this.finalZone.input.hitArea.height);
        this.input.once('dragenter', this.secondDragEnter,this);
    }
}