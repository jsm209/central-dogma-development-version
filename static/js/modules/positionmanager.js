import Nucleotide from "./nucleotide.js";
import AudioPlayer from "./audioplayer.js";

/**
 * Class representing the manager that will manipulate nucleotide positions
 */

// Some symbolic constants
let PATH_POINTS_FACTOR = 30;
let VERT_PATH_POINTS_FACTOR = 7;
let PADDING_COMP_FACTOR = 22;
let LT_DNA_REPLICATION = 'dna_replication';
let LT_CODON_TRANSCRIPTION = 'codon_transcription';
let UNSHIFT_FACTOR = {
    LT_DNA_REPLICATION: 3, LT_CODON_TRANSCRIPTION: 1
};

// Color constants
let CYAN = 0x22F2DD;
let PURPLE = 0xFF74F8;
let LIME = 0xA6FF4D;

class PositionManager {
    /**
     * Creates a position manager
     * @param {LevelStage} level - The level that the position belong to
     * @param {number} defaultTimerDelay - The delay that the position get updated a tick, smaller is faster
     */
    constructor (level, defaultTimerDelay) {
        this.autoMoveTimer = null;
        this.pathPointsFactor = PATH_POINTS_FACTOR;
        this.level = level;
        this.defaultTimerDelay = defaultTimerDelay;
        this.gameObj = level.gameObj;
        this.game = level;
        this.audioplayer = new AudioPlayer();

        // this is the list of nucleotide objects that are the main game elements of the game
        this.levelNucleotides = [];
        this.compLevelNucleotides = [];
        this.selectedNucleotides = [];
        this.hasFrozenHead = false;

        this.initLevelNucleotides();
        this.initCompLevelNucleotides();

        // Top, incoming, input row/line

        // input line (change this color to change input line color)
        this.level.graphics.lineStyle(3, this.getCorrectInputLineColor(), 1.0); 
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
           
            this.inputRowPath = new Phaser.Curves.Path(0, 140);
            this.inputRowPath.lineTo(175, 140);
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            this.inputRowPath = new Phaser.Curves.Path(740, 140);
            // the y value used to be 140, but I changed it to -100 to hide
            // the incoming input path. Leaving note incase someone wants to
            // make input path visible again.
            this.inputRowPath.lineTo(150, -100); 
        }
        this.inputRowPath.draw(this.level.graphics);
        this.initRectPathPts = this.inputRowPath.getSpacedPoints(26 * this.pathPointsFactor);
        this.inputComplRowPath = new Phaser.Curves.Path(0, 126);
        this.inputComplRowPath.lineTo(363.46153846153845, 126);
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            this.inputComplRowPath.draw(this.level.graphics);
        }
        this.inputCompRectPathPts = this.inputComplRowPath.getSpacedPoints(54 * this.pathPointsFactor);
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            this.inputVertPath = new Phaser.Curves.Path(182, 147);
            this.inputVertPath.cubicBezierTo(25, 640, 320, 320, 15, 440);
        // Vertical path that codons follow
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            // changed input path start point from 140 to -100 to
            // make codons come from off screen.
            // doesn't change appearence of line.
            this.inputVertPath = new Phaser.Curves.Path(150, -100);
            this.inputVertPath.lineTo(150, 785);
            
        }
        // this.inputVertPath.draw(this.level.graphics);
        let numVertPathPts = VERT_PATH_POINTS_FACTOR * this.pathPointsFactor;

        // VERTICAL PATH
        // Change the getPoints below to alter the points on the main incoming path. Will change speed traveled along path.
        // For some reason, changing this allows nucleotides to drift beyond the binding pocket.
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            this.initVertPathPts = this.inputVertPath.getPoints(numVertPathPts + this.pathPointsFactor).slice(0, numVertPathPts - this.pathPointsFactor);
            this.inputVertPathDispl = new Phaser.Curves.Path(175, 140);
            this.inputVertPathDispl.cubicBezierTo(-20, 640, 320, 320, -80, 440);
        // Actual vertical line drawn
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            this.initVertPathPts = this.inputVertPath.getPoints(numVertPathPts + this.pathPointsFactor).slice(0, numVertPathPts - this.pathPointsFactor);
            // y start point for path used to be 140 changed it to -100 so that
            // line comes from off the screen
            this.inputVertPathDispl = new Phaser.Curves.Path(150, -100); // start
            this.inputVertPathDispl.cubicBezierTo(150, 785, 150, 160, 150, 440); // end
            //this.inputVertPathDispl.z = 1;
        }
        this.inputVertPathDispl.draw(this.level.graphics);

        // output line (change this color to change output line color)
        this.level.graphics.lineStyle(3, this.getCorrectOutputLineColor(), 1.0);
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            this.outputVertPath = new Phaser.Curves.Path(245, 450);
            this.outputVertPath.cubicBezierTo(145, 710, 180, 600, 100, 700);
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            this.outputVertPath = new Phaser.Curves.Path(170, 450);
            this.outputVertPath.cubicBezierTo(200, 710, 170, 600, 170, 700);
        }

        this.outputVertPathPts = this.outputVertPath.getPoints(5 * this.pathPointsFactor);
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            this.outputVertPathDispl = new Phaser.Curves.Path(285, 500);
            this.outputVertPathDispl.cubicBezierTo(155, 710, 250, 600, 130, 670);
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            this.outputVertPathDispl = new Phaser.Curves.Path(170, 450);
            this.outputVertPathDispl.cubicBezierTo(200, 710, 170, 600, 170, 700);
        }

        // Drawing the actual curve
        this.outputVertPathDispl.draw(this.level.graphics);
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            this.outputRowPath = new Phaser.Curves.Path(155, 710);
            this.outputRowPath.lineTo(400, 710);
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            this.outputRowPath = new Phaser.Curves.Path(200, 710);
            this.outputRowPath.lineTo(400, 710);
        }
        this.outputRowPath.draw(this.level.graphics);

        // Determines the amount of points on the output path line
        this.outputRowPathPts = this.outputRowPath.getPoints(30 * this.pathPointsFactor);
    }

    /**
     * Initializes a level's nucleotides/codons depending on the level config type.
     */
    initLevelNucleotides() {
        // One of the many if special cases to distinguish codon and dna levels
        // All this code below is for path line drawing
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            this.initDNAReplication();
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            this.initCodonTranscription();
        }

    }

    /**
     * Initializes a nucleotide level's nucleotides.
     */
    initDNAReplication() {

        // Initial spacing before first codon.
        for (let i = 0; i < 120; i++) {
            this.levelNucleotides.push(null);
        }

        // This loop is important, says how many total "spots" along line.
        // Controls the spacing between codons as they travel the path.
        for (let i = 0; i < this.level.nucleotides.length * this.pathPointsFactor; i++) {
            let prevIdx = Math.floor((i - 1) / this.pathPointsFactor);
            let currIdx = Math.floor(i / this.pathPointsFactor);
            let nextIdx = Math.floor((i + 1) / this.pathPointsFactor);

            if (currIdx === nextIdx) {
                // Spaces out nucleotides
                this.levelNucleotides.push(null);
                this.levelNucleotides.push(null);
                continue;
            }
            this.levelNucleotides.push(this.level.nucleotides[currIdx]);
        }
    }

    /**
     * Initializes a ncodon level's codons.
     */
    initCodonTranscription() {
        // Initial spacing before first codon.
        for (let i = 0; i < 120; i++) {
            this.levelNucleotides.push(null);
        }

        // Fills up the rest of the level sequence.
        let spacing = 35;
        for (let i = 0; i < this.level.nucleotides.length; i++) {
            // How much spacing to add between each codon.
            for (let j = 0; j < spacing; j++) {
                this.levelNucleotides.push(null);
            }
            // Sets initial depth of codons (to go behind UI and to weave correctly between binding pockets)
            this.level.nucleotides[i].setDepth(5);
            this.levelNucleotides.push(this.level.nucleotides[i]);
        }
    }

     /**
     * Initializes the nucleotides that appear after completing a level.
     */
    initCompLevelNucleotides() {
        let paddingComp = PADDING_COMP_FACTOR * this.pathPointsFactor;
        for (let i = 0; i < paddingComp; i++) {
            this.compLevelNucleotides.push(null);
        }
        for (let i = 0; i < this.levelNucleotides.length; i++) {
            let nucleotide = this.levelNucleotides[i];
            if (nucleotide && this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
                
                // edge case: on transcription levels, we need to check that any instance of an
                // adenine is actually being matched by a uracil, not a thymine.
                /*
                let newcleotide;
                if (this.level.gameObj.levels[this.level.level].process == "transcription" && nucleotide.rep == "A") {
                    newcleotide = new Nucleotide(this.level, nucleotide.matches[1], this.level.ntType);
                } else {
                    newcleotide = new Nucleotide(this.level, nucleotide.matches[0], this.level.ntType);
                }
                */
               let newcleotide;
               newcleotide = new Nucleotide(this.level, nucleotide.matches[0], this.level.ntType);
                this.compLevelNucleotides.push(newcleotide);
            } else {
                this.compLevelNucleotides.push(null);
            }
        }

        let unshiftFactor = UNSHIFT_FACTOR[this.level.levelConfig.lvlType];

        for (let i = 0; i < this.pathPointsFactor * unshiftFactor; i++) {
            this.levelNucleotides.unshift(null);
            this.compLevelNucleotides.unshift(null);
        }

    }

    // CONSTRUCTOR STUFF END
    /**
     * Update the nucleotides position
     * @param {boolean} [animate=true] - Whether the positions should animate to make a smoother transition
     */
    setPositions(animate=true) {
        let inputCompRectPathPts = this.inputCompRectPathPts.slice().reverse();
        for (let i = 0; i < inputCompRectPathPts.length; i++) {
            let x = inputCompRectPathPts[i].x;
            let y = inputCompRectPathPts[i].y;
            let nucleotide = this.compLevelNucleotides[i];
            if (!nucleotide) {
                continue;
            }
            nucleotide.setVisible(true);
            if (animate) {
                this._animatePosition(nucleotide, x, y);
            } else {
                nucleotide.setPosition(x, y);
            }
        }
        let initVertPathPts = this.initVertPathPts.slice().reverse();
        for (let i = 0; i < initVertPathPts.length; i++) {
            let x = initVertPathPts[i].x;
            let y = initVertPathPts[i].y;
            let nucleotide = this.levelNucleotides[i];
            if (!nucleotide) {
                continue;
            }
            //nucleotide.setDepth(2999 - i);
            if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
                nucleotide.setDisplay("nucleotide");
            } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
                x = x - 70;
                nucleotide.setPosition(x, y);
                nucleotide.setDisplay("codon");
                nucleotide.removeCodonDisplay("amminoacid");
            }
            nucleotide.setVisible(true);
            nucleotide.showLetter(true);
            if (animate) {
                this._animatePosition(nucleotide, x, y);
            } else {
                nucleotide.setPosition(x, y);
            }
            let modifier = 0;
            if (i < this.pathPointsFactor * 10) {
                modifier = 0.045;
            }
            let modifier1 = 0;
            let modifier2 = 0;
            if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
                modifier1 = 0.51;
                modifier2 = 0.51;
            }
            let scale = 0;
            let scalePrev = 0;

            // Handles scaling of nucleotides/codons
            if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
                scale = this.calcInScale(i, modifier, modifier1, modifier2);
                scalePrev = this.calcInScale(i - 1, modifier, modifier1, modifier2);
            } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
                scale = 0.8;
                scalePrev = 0.8;
                if (i == initVertPathPts.length - 1) {
                    scalePrev = 0.1;
                }
            }
            if (animate) {
                nucleotide.setScale(scalePrev);
                this._animateScale(nucleotide, scale);
            } else {
                nucleotide.setScale(scale);
            }
        }
        let initRectPathPts = this.initRectPathPts.slice().reverse();
        for (let i = 0; i < initRectPathPts.length; i++) {
            let x = initRectPathPts[i].x;
            let y = initRectPathPts[i].y;
            let nucleotide = this.levelNucleotides[initVertPathPts.length + i];
            if (!nucleotide) {
                continue;
            }
            nucleotide.setDisplay("rectangle");
            if (animate) {
                this._animatePosition(nucleotide, x, y);
            } else {
                nucleotide.setPosition(x, y);
            }
            nucleotide.setVisible(true);
        }
        let selectedNucleotides = this.selectedNucleotides.slice().reverse();
        let outputVertPathPts = this.outputVertPathPts.slice(2, this.outputVertPathPts.length);
        for (let i = 0; i < outputVertPathPts.length; i++) {
            let nucleotide = selectedNucleotides[i];
            if (!nucleotide) {
                continue;
            }
            let x = outputVertPathPts[i].x;
            let y = outputVertPathPts[i].y;
            if (animate) {
                this._animatePosition(nucleotide, x, y);
            } else {
                nucleotide.setPosition(x, y);
            }
            let idx = Math.floor(i / this.pathPointsFactor);
            // (0, 0.2) (299, 0.07) len(outputVertPathPts)=299
            let scale = 0.2 - (1/2300) * i;
            let scalePrev = 0.2 - (1/2300) * (i - 1);
            if (animate) {
                nucleotide.setScale(scalePrev);
                this._animateScale(nucleotide, scale);
            } else {
                nucleotide.setScale(scale);
            }
        }
        let outputRectPathsPts = this.outputRowPathPts.slice();
        for (let i = 0; i < outputRectPathsPts.length; i++) {
            let nucleotide = selectedNucleotides[outputVertPathPts.length + i];
            if (!nucleotide) {
                continue;
            }
            let x = outputRectPathsPts[i].x;
            let y = outputRectPathsPts[i].y;
            if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
                nucleotide.setDisplay("rectangle");
            } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
                nucleotide.setDisplay("circle");
            }
            if (animate) {
                this._animatePosition(nucleotide, x, y);
            } else {
                nucleotide.setPosition(x, y);
            }
        }
    }

    /**
     * Calculates the scale that comes in on the vertical path
     * @param {number} idx - The index of the nucleotide
     * @param {number} modifier - The number to influence in the size
     * @returns {number} the resulting answer
     */
    calcInScale(idx, modifier=0, modifier1=0, modifier2=0) {
        //  x1 y1    x2   y2
        // (0, 17/50) (180, 11/100)
        const x1 = 0;
        const y1 = 17 / 50 + modifier + modifier1;
        const x2 = 180;
        const y2 = 45 / 500 + modifier + modifier2;
        return this.calcExponential(x1, y1, x2, y2, idx);
    }

    /**
     * Calculates an exponential curve and uses the passed in X to determine the Y value.
     * @param {number} x1 - The starting X. is always 0
     * @param {number} y1 - Starting Y
     * @param {number} x2 - Ending X
     * @param {number} y2 - Ending Y
     * @param {number} x - The x position
     * @returns {number} The resulting answer
     */
    calcExponential(x1, y1, x2, y2, x) {
        if (y2 == 0) {
            y2 = 0.00001;
        }
        x1 = 0; // assuming this is always 0
        let a = y1;
        let b = Math.pow(Math.E, Math.log(y2 / y1) / x2);
        return a * Math.pow(b, x);
    }

    /**
     * Start the timer at default delay
     */
    start() {
        // Gets the speed attriute from the level object in the config file.
        this.startNTMoveTimer(this.defaultTimerDelay);
    }

    /**
     * Start the nucleotides move timer
     * @param {number} delay - timer delay
     */
    startNTMoveTimer(delay) {
        if (this.autoMoveTimer) {
            return;
        }
        let that = this;
        this.autoMoveTimer = this.game.time.addEvent({
            delay: delay,
            callback: function () {
                that.next();
            },
            loop: true
        });
    }

    /**
     * Stop nucleotides move timer
     */
    stopNTMoveTimer() {
        if (this.autoMoveTimer) {
            this.autoMoveTimer.remove();
            this.autoMoveTimer = null;
        }
    }

    tempPauseNTMoveTime(delay=1000) {
        if (this.autoMoveTimer) {
            let nextdelay = this.autoMoveTimer.delay;
            this.autoMoveTimer.remove();
            this.autoMoveTimer = null;
            let that = this;
            this.game.time.addEvent({
                delay: delay,
                callback: function () {that.startNTMoveTimer(nextdelay)},
                loop: false
            });
        }
    }

    /**
     * Restarts the timer with a new delay
     * @param {number} newDelay - The new delay
     */
    updateNTMoveTimer(newDelay) {
        this.stopNTMoveTimer();
        this.startNTMoveTimer(newDelay);
    }

    /**
     * Move nucleotide to a position and animate it along the way
     * @param {Nucleotide} nucleotide - Nucleotide to move
     * @param {number} x - X to move to
     * @param {number} y - Y to move to
     * @param {function} callback - Function to call when done moving
     */
    _animatePosition(nucleotide, x, y, callback=null) {
        let fromX = nucleotide.getObject().x;
        let toX = x;
        let fromY = nucleotide.getObject().y;
        let toY = y;
        if (Math.abs(fromX - toX) < 1 && Math.abs(fromY - toY) < 1) {
            nucleotide.setPosition(toX, toY);
            if (callback != null) {
                callback(nucleotide);
            }
        } else {
            let that = this;
            this.game.time.addEvent({
                delay: 10,
                callback: function () {
                    let midX = (fromX + toX) / 2;
                    let midY = (fromY + toY) / 2;
                    nucleotide.setPosition(midX, midY);
                    that._animatePosition(nucleotide, x, y, callback);
                },
                loop: false
            });
        }
    }

    /**
     * Animate the nucleotides scale
     * @param {Nucleotide} nucleotide - Nucleotide to animate the scale
     * @param {number} scale - The scale it should go to
     * @param {function} callback - Function to be called when done scaling
     */
    _animateScale(nucleotide, scale, callback=null) {
        let fromScale = nucleotide.getObject().scale;
        let toScale = scale;
        if (fromScale === undefined) {
            fromScale = nucleotide.getObject().scaleX;
        }
        if (Math.abs(fromScale - toScale) < 0.001) {
            nucleotide.setScale(scale);
            if (callback != null) {
                callback(nucleotide);
            }
        } else {
            let that = this;
            this.game.time.addEvent({
                delay: 10,
                callback: function () {
                    let midScale = (fromScale + toScale) / 2;
                    nucleotide.setScale(midScale);
                    that._animateScale(nucleotide, scale, callback);
                },
            });
        }
    }

    /**
     * Fade out nucleotide
     * Note: Currently this function is used for the player's swiped nucleotide.
     * @param {Nucleotide} nucleotide - nucleotide to fade
     * @param {function} [callback=null] - function to be called after done fading
     */
    _fadeOut(nucleotide, callback=null) {
        let currentAlpha = nucleotide.getObject().alpha;
        let newAlpha = currentAlpha / 1.5;
        if (newAlpha < 0.1) {
            nucleotide.getObject().clearAlpha();
            nucleotide.setVisible(false);
            nucleotide.updateErrorDisplay();
            nucleotide.updateLetterDisplay();
            if (callback != null) {
                callback(nucleotide);
            }
        } else {
            nucleotide.getObject().setAlpha(newAlpha);

            // In order to fade out the letters as well, we need to access the 
            // text in different ways depending on if it's a codon or a nucleotide.
            if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
                nucleotide.letterText.setAlpha(newAlpha);
            } /*else {
                for (let i = 0; i < nucleotide.nucleotides.length; i++) {
                    nucleotide.nucleotides[i].setAlpha(newAlpha);
                }
            }*/

            
            nucleotide.updateErrorDisplay();
            let that = this;
            this.game.time.addEvent({
                delay: 40,
                callback: function () {
                    that._fadeOut(nucleotide, callback);
                },
                loop: false
            });
        }
    }

    /**
     * Increments the nucleotides position by one
     */
    next() {

        let head = this.levelNucleotides[0];
        if (head) {
            this.processIncorrectNucleotide(head);
            //this.removeHeadNucleotide();
        }
        // levelNucleotides is a collection of all nucleotides and null objects along the line.
        // It shortens the array each tick by 1.
        this.levelNucleotides = this.levelNucleotides.slice(1, this.levelNucleotides.length);
        this.compLevelNucleotides = this.compLevelNucleotides.slice(1, this.compLevelNucleotides.length);

        this.selectedNucleotides.push(null);
        this.setPositions(true);

        // If we try next and find that we have no more objects, end the game.
        if (this.getLevelNTCount() == 0) {
            let that = this;
            this.level.time.addEvent({
                delay: 300,
                loop: false,
                callback: function () {
                    that.level.endGame();
                }
            });
        // If we're in a codon level and 
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION &&
                   !this.hasFrozenHead &&
                   this.getHeadNucleotide() && this.getHeadNucleotide().getObject().y > 490) {
            this.hasFrozenHead = true;


            /*
            Recall that these are the speed constants in the main.js file.
            let SPEED_SLOW = 50;
            let SPEED_MEDIUM = 33;
            let SPEED_FAST = 1;
            */
            // Setting appropriate wait times
            if (this.level.levelConfig.speed >= 50) {
                this.tempPauseNTMoveTime(5000);
            } else if (this.level.levelConfig.speed <= 1) {
                this.tempPauseNTMoveTime(1000);
            } else {
                this.tempPauseNTMoveTime(3000);
            }
        }
    }

    /**
     * Given the nucleotide the player just missed,
     * will add on to the DNA output the correct nucleotide.
     * @param {Nucleotide} missedNucleotide - Nucleotide player got wrong.
     */
    processIncorrectNucleotide(missedNucleotide) {
        this.level.scorekeeping.incrementIncorrectSequences();
        this.audioplayer.playIncorrectSound();



        // Find that correct option and process it to output stack
        let cloned = this.getValidMatchNT(missedNucleotide);
        if (this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            cloned.setDisplay("nucleotide");
        } else if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            cloned.setDisplay("codon");
        }
        cloned.setPosition(missedNucleotide.getObject().x, missedNucleotide.getObject().y);
        cloned.setVisible(true);
        cloned.setScale(0.18);
        cloned.setAngle(180);
        cloned.setMissing(true);
        this.addToDNAOutput(cloned);
        this.level.shuffleNTBtnAngle();

        this.removeHeadNucleotide();

         // Regen buttons (one wuill have correct option)
        if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            this.level.shuffleNTBtnOpts();
        }
    }

    /**
     * From the given nucleotide, find the matching NT pair that works
     * @param {Nucleotide} nucleotide - Nucleotide to reference from
     * @returns {Nucleotide} matching nucleotide
     */
    getValidMatchNT(nucleotide) {
        let btns = this.level.buttons;
        let cloned = null;
        for (let i = 0; i < btns.length; i++) {
            let btn = btns[i];
            // cloned is null because it's not being matched here
            // (never a validMatchWith(btn) so cloned stays null)
            // And in-game, this occurs when you miss a codon
            // AFTER doing nothing and missing it naturally.
            
            // we know that the nucleotide passed all the way into
            // here is the "head" nucleotide we just missed.
            // (head is passed to processIncorrectNucleotide() to getValidMatchNT())
            
            if (nucleotide.validMatchWith(btn)) {
                cloned = btn.clone();
            }
        }
        return cloned;
    }

    /**
     * Removes the head nucleotide from the incoming call stack.
     * Doesn't add anything to the DNA output.
     */
    removeHeadNucleotide() {
        for (let i = 0; i < this.levelNucleotides.length; i++) {
            let removed = this.levelNucleotides[i];
            if (removed) {
                this.hasFrozenHead = false;
                this.levelNucleotides[i] = null;
                
                if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
                    // In codon levels, we want the codon to animate downwards into exit area.
                    this._animatePosition(removed, removed.getObject().x, removed.getObject().y + 130);
                } else {
                    // In nucleotide levels, we want the nucleotide to animate left downward.
                    this._animatePosition(removed, removed.getObject().x - 40, removed.getObject().y + 130);
                }
               
                this._fadeOut(removed, function () {
                    removed.destroy();
                });
                return true;
            }
        }
        return false;
    }

    /**
     * Get the head nucleotide from the imcoming stack.
     * @returns {Nucleotide} the head nucleotide
     */
    getHeadNucleotide(ignorePocket=false) {
        for (let i = 0; i < this.levelNucleotides.length; i++) {
            if (this.levelNucleotides[i]) {
                return this.levelNucleotides[i];
            }
        }
        return null;
    }

    /**
     * Adds a nucleotide to the output stack
     * @param {Nucleotide} nucleotide - The nucleotide that should be added to the output stack
     */
    addToDNAOutput(nucleotide) {
        var retval = false;
        //this.hasFrozenHead = false;
        nucleotide.setScale(0.3);
        let firstPoint;
        let secPoint;
        let point;

        if (this.level.levelConfig.lvlType != LT_CODON_TRANSCRIPTION) {
            let yOffset = -140;
            let xOffset = 30;
            
            firstPoint = {x: 245 + xOffset, y: 450 + yOffset}
            secPoint = {x: 205.32 + xOffset, y: 533.68 + yOffset}
            point = {x: 168.76 + xOffset, y: 603.44 + yOffset}

        } else {
            firstPoint = this.outputVertPathPts[0];
            secPoint = this.outputVertPathPts[1 * this.pathPointsFactor];
            point = this.outputVertPathPts[2 * this.pathPointsFactor];  
        }




        nucleotide.setPosition(firstPoint.x, firstPoint.y);
        if (nucleotide.errorNT || nucleotide.missingNT) {
            // Shakes screen and flashes red upon a wrong match
            if (this.level.gameObj.GLOBAL.ACTIVE_EFFECTS) {
                this.level.camera.flash(300, 255, 30, 30);
                this.level.camera.shake(400, 0.02);
            }
        }
        //this.updateNTMoveTimer(this.defaultTimerDelay);
        let that = this;
        this._animatePosition(nucleotide, secPoint.x, secPoint.y, function () {
            that._animatePosition(nucleotide, point.x, point.y);
            if (that.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
                nucleotide.removeCodonDisplay("codon");
            }
            that.selectedNucleotides.push(nucleotide);
            for (let i = 0; i < (that.pathPointsFactor * 2); i++) {
                that.selectedNucleotides.push(null);
            }
            //that.updateNTMoveTimer(that.defaultTimerDelay);
            that.level.ntBtnsEnabled = true;
            if (!nucleotide.missingNT) {
                retval = that.removeHeadNucleotide();
                if (that.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
                    that.level.shuffleNTBtnOpts();
                }
            }
        });
    }

    /**
     * Rejects the given nucleotide. Comes with animation and everything
     * @param {Nucleotide} nucleotide - to be rejected
     */
    doRejectNT(nucleotide) {
        nucleotide.setScale(0.3);
        let firstPoint = this.outputVertPathPts[0];
        let secPoint = this.outputVertPathPts[1 * this.pathPointsFactor];
        nucleotide.setPosition(firstPoint.x, firstPoint.y);

        // Shakes screen and flashes red upon a wrong match
        if(this.level.gameObj.GLOBAL.ACTIVE_EFFECTS) {
            this.level.camera.flash(300, 255, 30, 30);
            this.level.camera.shake(400, 0.02);
        }

        let that = this;
        this._animatePosition(nucleotide, secPoint.x, secPoint.y, function () {
            that._fadeOut(nucleotide);
            that._animatePosition(nucleotide, firstPoint.x, firstPoint.y, function () {
                that.level.ntBtnsEnabled = true;
                nucleotide.destroy();
            });
        });
    }

    /**
     * Get the number of nucleotides in the level
     * @returns {number} Num of nt in lvl
     */
    getLevelNTCount() {
        let lvlNTs = this.levelNucleotides;
        let cnt = 0;
        for (let i = 0; i < lvlNTs.length; i++) {
            if (lvlNTs[i]) {
                cnt++;
            }
        }
        return cnt;
    }

    /**
     * Is the head nucleotide touching the binding pocket?
     * @returns {boolean} if the head nucleotide touch the binding pocket
     */
    ntTouchingBindingPocket() {
        let nucleotide = null;
        let nucDispObj = null;

        // Loops over all the nucleotide array, which contains 
        // either nucleotide objects or null objects.
        for (let i = 0; i < this.levelNucleotides.length; i++) {
            nucleotide = this.levelNucleotides[i];
            if (nucleotide) {
                nucDispObj = nucleotide.getObject();

                // Codon Levels
                if (this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
                    let wrapped = nucDispObj;
                    nucDispObj = {
                        getX: function() {
                            return wrapped.x - (wrapped.displayWidth * wrapped.originX);
                        },
                        getY: function() {
                            return wrapped.y - (wrapped.displayHeight * wrapped.originY);
                        },
                        getTopLeft: function () {
                            return new Phaser.Math.Vector2(this.getX(), this.getY());
                        },
                        getBottomRight: function () {
                            return new Phaser.Math.Vector2(this.getX() + wrapped.displayWidth,
                                                           this.getY() + wrapped.displayHeight);
                        },
                        getCenter: function () {
                            return new Phaser.Math.Vector2(this.getX() + wrapped.displayWidth / 2,
                                                           this.getY() + wrapped.displayHeight / 2);
                        },
                        getBounds: function() {
                            return new Phaser.Geom.Rectangle(this.getX(), this.getY(),
                                                             wrapped.displayWidth,
                                                             wrapped.displayHeight);
                        },
                        x: wrapped.x,
                        y: wrapped.y,
                        angle: wrapped.angle,
                    };
                }
                break;
            }
        }

        if (nucDispObj && this.level.levelConfig.lvlType == LT_DNA_REPLICATION) {
            // actually make correct bounding boxes for binding pocket and nucleotide
            let bindingPocket = this.level.bindingPocket;
            var bbBinding = new Phaser.Geom.Rectangle(bindingPocket.x, bindingPocket.y,
                                                      bindingPocket.width * bindingPocket.scale,
                                                      bindingPocket.height * bindingPocket.scale);
            // Pay attention here what the actual bounds are !!!
            // x = e.g. 76.56
            // y = e.g. 556.319
            // height: 300
            // width: 600
            // scale is 0.3195576875552662
            // so if we take the lower value (300 of these)
            // 300 * 0.319 = 95.7
            // WW: These are some hacked in values that seem to work, but we need to find out
            // WHY !!!!
            //var bottomLeft = new Phaser.Math.Vector2(nucDispObj.x + 50,
            //                                         nucDispObj.y + 70);
            var offset = (nucDispObj.height * nucDispObj.scale) - 10;
            var bottomLeft = new Phaser.Math.Vector2(nucDispObj.x + offset,
                                                     nucDispObj.y + offset);

            var cont = Phaser.Geom.Rectangle.ContainsPoint(bbBinding, bottomLeft);
            return cont;
        } else if (nucDispObj && this.level.levelConfig.lvlType == LT_CODON_TRANSCRIPTION) {
            let offset = 100;
            let bindingPocket = this.level.ntHighlightEllipse;
            return (bindingPocket.getTopLeft().y + offset < nucDispObj.getBottomRight().y &&
                    bindingPocket.getBottomRight().y > nucDispObj.getTopLeft().y);
        }
        return false;
    }


    /**
     * Rotates the given coordinate about the object angle
     * @param {Phaser.GameObjects} obj - Object that has been rotated
     * @param {Phaser.Math.Vector2} cornerCoord - The corner coordinate that should be rotated
     */
    getRotatedRectCoordinates(obj, cornerCoord) {
        let center = obj.getCenter();
        let tempX = cornerCoord.x - center.x;
        let tempY = cornerCoord.y - center.y;

        let theta = 360 - obj.angle;
        theta = theta * Math.PI / 180; // radians

        let rotatedX = tempX * Math.cos(theta) - tempY * Math.sin(theta);
        let rotatedY = tempX * Math.sin(theta) + tempY * Math.cos(theta);

        let x = rotatedX + center.x;
        let y = rotatedY + center.y;

        return new Phaser.Math.Vector2(x, y);
    }

    /**
     * Will check the current level's "process" and return the appropriate 
     * color hexcode for drawing a line for sequence input.
     * @returns {String} Appropriate color hexcode
     */
    getCorrectInputLineColor() {
        if (this.level.levelConfig.process == "dna replication" || this.level.levelConfig.process == "transcription") {
            return CYAN;
        } else { // "the only other process left is translation, which has an incoming line of RNA."
            return PURPLE;
        }
    }

    /**
     * Will check the current level's "process" and return the appropriate 
     * color hexcode for drawing a line for sequence output.
     * @returns {String} Appropriate color hexcode
     */
    getCorrectOutputLineColor() {
        if (this.level.levelConfig.process == "dna replication") {
            return CYAN;
        } else if (this.level.levelConfig.process == "transcription") {
            return PURPLE;
        } else { // "the only other process left is translation, which has an outoing line of protein."
            return LIME;
        }
    }
}

export default PositionManager;
