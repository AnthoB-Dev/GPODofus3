import { Achievements } from "./achievements.js";

export const Quests = {
    openLinksOfQuests: function() {
        const links = Quests.getLinksOfQuests();
        let delay = 0;

        links.forEach((link) => {
            setTimeout(() => {
                window.open(link, "_blank");
            }, delay);
            delay += 300;
        });
    },

    getLinksOfQuests: function() {
        const jsQuest = document.querySelectorAll(".js-quest");
        const links = [];

        jsQuest.forEach((quest) => {
            const anchor = quest.querySelector("a");
            const link = anchor.href;
            links.push(link);
        });
        return links;
    },

    listenToOpenAllBtn: function() {
        const openAll = document.querySelector("#openAll");
        openAll.addEventListener("click", () => {
            Quests.openLinksOfQuests();
        });
    },

    validateAllBtnStyle: function() {
        const validateAll = document.querySelector("#validateAll");
        const icon = validateAll.querySelector("i");
        let buttons = Quests.getButtons();
        const newIcon = document.createElement("i");

        if (buttons.length > 0 && buttons[0].classList.contains("uncheck")) {
            newIcon.classList.add("fa-solid", "fa-xmark");
            validateAll.removeChild(icon);
            validateAll.textContent = "Dévalider tout";
            validateAll.appendChild(newIcon);
        } else {
            newIcon.classList.add("fa-solid", "fa-check-double");
            validateAll.removeChild(icon);
            validateAll.textContent = "Valider tout";
            validateAll.appendChild(newIcon);
        }
    },

    toggleBtnBackgroundStyle: function() {
        const validateAll = document.querySelector("#validateAll");
        let buttons = Quests.getButtons();

        if (buttons.length === 0) return;

        const color = buttons[0].classList.contains("check")
        ? "#23dc3c91"
        : "#f37f81";

        validateAll.addEventListener("mouseover", () => {
            buttons.forEach((button) => {
                button.style.backgroundColor = color;
            });
        });
        validateAll.addEventListener("mouseout", () => {
            buttons.forEach((button) => {
                button.style.backgroundColor = "";
            });
        });
    },

    listenToValidateAllBtn: function() {
        const validateAll = document.querySelector("#validateAll");
        validateAll.addEventListener("click", () => {
            Quests.clickValidateAll();
        });
    },

    getButtons: function() {
        const cButtons = document.querySelectorAll(".js-quest .check");
        const uButtons = document.querySelectorAll(".js-quest .uncheck");
        let buttonsType = [];

        if (cButtons.length === 0) {
            buttonsType = uButtons;
        } else if (cButtons.length > 0) {
            buttonsType = cButtons;
        }
        return buttonsType;
    },

    clickValidateAll: function() {
        let buttonsType = Quests.getButtons();

        if (!Array.isArray(buttonsType)) {
            buttonsType = Array.from(buttonsType);
        }

        let delay = 0;
        const promises = buttonsType.map((button) => {
            return new Promise((resolve) => {
                if (document.body.contains(button)) {
                button.click();
                }
                resolve();
            }, (delay += 100));
        });

        Promise.all(promises).then(() => {
            Achievements.clickNextAchievementBtn();
        });
    },

    updateQuestsAchievementTitle: function() {
        const questsAchievementId = document.querySelector(".js-quest")?.dataset.achievementId;
        if (questsAchievementId === undefined) return;
        const questsAchievementTitle = document.querySelector(
            "#quest_frame_achievement_title h4"
        );

        const achievements = Achievements.getAchievements();
        let currentAchievement;

        achievements.forEach((achievement) => {
            const currentAchievementId = achievement.dataset.achievementId;
            if (currentAchievementId === questsAchievementId) {
                currentAchievement = achievement.parentElement.querySelector("p");
            }
            return;
        });
        questsAchievementTitle.textContent = currentAchievement.textContent;
    },
};
