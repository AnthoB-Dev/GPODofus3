import * as nav from "./nav.js";
import * as quests from "./quests.js";
import * as achievements from "./achievements.js";
import * as guide from "./guide.js";

// Fonction pour initialiser les événements
const initializeEvents = () => {
    console.log("Initializing events");

    nav.addNavEventListeners();
    quests.addQuestEventListeners();
    achievements.addAchievementEventListeners();
    guide.addGuideEventListeners();
    quests.toggleBtnBackgroundStyle();
    quests.validateAllBtnStyle();
    quests.updateQuestsAchievementTitle();
};

// Fonction pour purger les événements
const purgeEvents = () => {
    console.log("Purging events");

    nav.removeNavEventListeners();
    quests.removeQuestEventListeners();
    achievements.removeAchievementEventListeners();
    guide.removeGuideEventListeners();
};

// Écouteur pour `turbo:before-render`
document.addEventListener("turbo:before-render", (event) => {
    console.log("turbo:before-render");
    nav.updateTopNavTitle(event);
    purgeEvents();
});

// Écouteur pour `turbo:load`
document.addEventListener("turbo:load", () => {
    console.log("turbo:load");
    initializeEvents();
});

// Écouteur pour `turbo:frame-render`
document.addEventListener("turbo:frame-render", () => {
    console.log("turbo:frame-render");
    purgeEvents();
    initializeEvents();
});