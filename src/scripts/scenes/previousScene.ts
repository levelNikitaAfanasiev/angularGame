export class PreviousScene extends Phaser.Scene {
    private preload(){

    }
    private create(){
        var title = this.add.text(100, 200, 'Press Enter to start', { fontFamily: 'Arial', fontSize: 64, color: '#00ff00' });

        let chick = [
            '......33....',
            '.....5......',
            '...7888887..',
            '..788888887.',
            '..888088808.',
            '..888886666.',
            '..8888644444',
            '..8888645555',
            '888888644444',
            '88788776555.',
            '78788788876.',
            '56655677776.',
            '456777777654',
            '.4........4.'
        ];
        
        let playButton: string[] = [
            '333..3......3....3.3',
            '3.3..3.....3.3...3.3',
            '333..3.....333...333',
            '3....3.....3.3....3.',
            '3....333...3.3...33.'
        ];

        this.textures.generate('chick', { data: chick, pixelWidth: 6 });
        this.add.image(50,500, 'chick').setOrigin(0, 1);
      

        this.textures.generate('playButton', { data: playButton, pixelWidth: 12 });
        var play = this.add.image(200,500, 'playButton').setOrigin(0, 1);
        play.setInteractive();
        play.once('pointerup', function (pointer, gameObject) {

            this.scene.start('startGame');

        }, this);

        this.input.keyboard.on('keydown', this.changeScene,this);
    }
    public changeScene(button): void{
        if(button.code == 'Enter'){
            this.scene.start("startGame");
        }
    }
}
