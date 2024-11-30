import * as nav from "./nav.js";
import * as quests from "./quests.js";
import * as achievements from "./achievements.js";
import * as guide from "./guide.js";

let eventsInitialized = false;

// Fonction pour initialiser les événements
const initializeEvents = () => {
    // Toujours purger les événements avant de les réinitialiser
    purgeEvents();

    nav.updateTopNavTitle();
    nav.addNavEventListeners();
    quests.addQuestEventListeners();
    achievements.addAchievementEventListeners();
    guide.addGuideEventListeners();
    guide.addGuideAlignmentFormEventListener();
    quests.toggleBtnBackgroundStyle();
    quests.validateAllBtnStyle();
    nav.addKeysEventListeners();

    eventsInitialized = true;
};

// Fonction pour purger les événements
const purgeEvents = () => {
    if (!eventsInitialized) return;
    nav.removeNavEventListeners();
    quests.removeQuestEventListeners();
    achievements.removeAchievementEventListeners();
    guide.removeGuideEventListeners();

    eventsInitialized = false;
};

// Écouteur pour `turbo:load`
document.addEventListener("turbo:load", () => {
    initializeEvents();
});

// Écouteur pour `turbo:before-render`
document.addEventListener("turbo:before-render", (event) => {
    nav.updateTopNavTitle(event);
});

document.addEventListener("turbo:frame-load", () => {
    quests.updateQuestsAchievementTitle();
    quests.toggleBtnBackgroundStyle();
    quests.validateAllBtnStyle();
})

document.addEventListener("turbo:submit-end", (e) => {
    setTimeout(() => {
        quests.toggleBtnBackgroundStyle();
        quests.validateAllBtnStyle();
    }, 10);
})