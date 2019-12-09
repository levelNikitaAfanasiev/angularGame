import * as Phaser from "phaser";
import { Scene } from "./scenes/scene";
import {PreviousScene} from "./scenes/previousScene";

new Phaser.Game({
    type: Phaser.AUTO,
    parent: "",
    width: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {},
            debug: false
        }
    },
    height: 700,
    backgroundColor: "#A0EFEF",
    scene: [PreviousScene, Scene]
});