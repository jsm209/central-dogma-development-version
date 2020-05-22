# Central Dogma Game Readme

## Summary of files

### Main Files
These are the main top level files that are essential for the game.
- **js/central_dogma_api** - The API for the game
- **js/main.js** - Initializes a phaser game with level data


### Modules
These are classes for the various objects in the game.
- **js/modules/audioplayer.js** - Class representing an audio player to play music and sounds.
- **js/modules/backgroundfloater.js** - Class that creates background floating particles. It's used for the main menu and in-game levels.
- **js/modules/codon.js** - Class representing a single codon triplet
- **js/modules/game.js** - Main game class, responsible for importing all assets and initial phaser config. Used in main.js for starting a phaser instance.
- **js/modules/gamescore.js** - Class representing the scoring in a level
- **js/modules/nucleotide.js** - Class representing a single nucleotide.
- **js/modules/popupmanager.js** - Class to manage in-game popups. It grabs config data from the level data in main.js.
- **js/modules/positionmanager.js** - Manages all the movement and its timing for the game.

### Scenes
These are the various screen which contain and organize UI and graphic elements.

- **js/modules/scene/about.js** - An about page, it's currently empty and unused.
- **js/modules/scene/countdownResume.js** - The screen used for countdowns, which appear after dialog popups and resuming the game after pausing.
- **js/modules/scene/levelcomplete.js** - The screen that appears after a level is completed. Responsible for some fun animations and submitting the score/level performance with the API.
- **js/modules/scene/levelstage.js**- The main game screen. Has a ton of conditional rendering depending on the level config data from main.js. All the levels use this screen.
- **js/modules/scene/listlevels.js** - The level selection screen. Also responsible for displaying the leaderboard.
- **js/modules/scene/loginscreen.js** - The login screen. The user is also taken back here if they click "sign in" on the main menu when not already signed in.
- **js/modules/scene/logoscreen.js** - Short scene for showing off the game's logo and ISB logo.
- **js/modules/scene/pause.js** - The pause screen.
- **js/modules/scene/popupdisplayscene.js** - The scene that overlays the main gameplay, responsible for handling dialog popups.
- **js/modules/scene/prelevelstage.js** - A scene that briefly appears after selecting the level from the level select screen and before loading into the actual level stage. Responsible for priming the player with some pre-level text (also defined in the main.js level data) and fading in/out.
- **js/modules/scene/quiz.js** - Quiz screen that overlays the main gameplay. Handles all the logic for layout and selecting choices. At the end, will submit quiz performance via API.
- **js/modules/scene/titlescreen.js** - The main menu screen.


## General workflow and tips
- Adjusting the game's speed, object movement, path, and generally how movement occurs in this game in general is done in the positionmanger.js file.
- The codon object uses the nucleotide object to construct itself.
- Both nucleotide and codon classes have functions to render themselves as the small colored blocks that are seen in game before they grow to their actual size.
- Moving between scenes means passing all the game data around and initializing the new scenes with it, and this is necessary to preserve global variables like SCORE and level performance. These global variables are initially found in game.js.
- The quiz data is submitted right after the player finishes a quiz, and the level performance data is submitted right after the player reaches the level complete screen.

## Common objects

### Global
*Found in game.js*

```
        this.GLOBAL = {
            SCORE: 0, // Overall score as an Int,
            ACTIVE_MUSIC: true, // Boolean to indicate whether music should be played or not.
            ACTIVE_EFFECTS: true, // Boolean to indicate whether the player is playing with effects (screen shake/flash)
            ACTIVE_EDUCATION: true, // Boolean to indicate whether the player is playing with quizzes enabled
            QUIZ_RESULTS: [], // Array of "quiz" objects
            LEVEL_PERFORMANCE: [] // Array of "level" objects
        };
        this.sessionID = ""; // sessionID is stored after login
        this.userName = ""; // built username is stored after login
        this.questionPool = {
            beginning: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            middle: [9, 10],
            end: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
        }; // Question pool is inialized here, and also on the login screen (because it is a guaranteed screen that will happen first on every playthrough.)
```


### Level data

