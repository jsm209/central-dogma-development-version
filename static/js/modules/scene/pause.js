/**
 * Represents the level stage scene
 * @extends Phaser.Scene
 */
class PauseScreen extends Phaser.Scene {

    /**
     * Creates a pause screen scene.
     * @param {Phaser.Types.Scenes.SettingsConfig} config 
     */
    constructor (config) {
        super(config);
    }

    /**
     * Initalizes the level.
     * @param {JSON} data 
     */
    init(data) {
        console.log(this);
        var gra = this.add.graphics();
        gra.fillStyle(0x000000, 0.50);
        gra.fillRect(0, 0, 360, 740);
        this.add.text(120, 150, "PAUSED", 
        {fontFamily: 'Teko, sans-serif', fontSize: '40pt', color: '#FFFFFF'}).setDepth(1);
        
        let homeBtn = this.add.image(180, 400, "home_btn").setScale(0.5).setInteractive();
        homeBtn.addListener("pointerdown", this.bindFn(this.onButtonClickHold));
        homeBtn.addListener("pointerup", this.bindFn(this.onButtonClickRelease));
        homeBtn.addListener("dragend", this.bindFn(this.onButtonClickRelease));
        /*
        homeBtn.addListener("pointerup", this.bindFn(function(){
            this.scene.stop("level" + data.level);
            this.scene.stop();
            this.scene.start("titlescreen", {skipToLevelsList: true, gameObj: data.gameObj, fadeIn: true});
        }));
        */
        
        let resumeBtn = this.add.image(180, 500, "resume_btn").setScale(0.5).setInteractive();
        resumeBtn.addListener("pointerdown", this.bindFn(this.onButtonClickHold));
        resumeBtn.addListener("pointerup", this.bindFn(this.onButtonClickRelease));
        resumeBtn.addListener("dragend", this.bindFn(this.onButtonClickRelease));
        resumeBtn.addListener("pointerup", this.bindFn(function(){
            this.scene.resume("level" + data.level);
            this.scene.stop();
        }));
        console.log(data);
        
        
    }
    /**
     * Make button smaller
     * @param {Phaser.GameObjects.Image} img - the play button
     */
    onButtonClickHold(img) {
        img.setScale(0.45);
    }

    /**
     * Make button regular sized
     * @param {Phaser.GameObjects.Image} img - the play button
     */
    onButtonClickRelease(img) {
        img.setScale(0.50);
    }

    /**
     * Changes the context of the function `this` keyword to the class. Moves the `this` reference to the first parameter instead.
     * @param {function} fn - The function used to bind to the class
     */
    bindFn(fn) {
        let clas = this;
        return function (...args) {
            let event = this;
            fn.bind(clas, event, ...args)();
        };
    }
}

export default PauseScreen;