import { getAchievements } from "./achievements.js";


const openLinksOfQuests = async () => {
    const links = getLinksOfQuests();
    if (!links) return;
    let delay = 0;

    for (const link of links) {
        await new Promise((resolve) => {
            setTimeout(() => {
                window.open(link, "_blank");
                resolve();
            }, delay);
        });
        delay += 0;
    }
};

const getLinksOfQuests = () => {
    const jsQuest = document.querySelectorAll(".js-quest");
    if (jsQuest.length === 0) return;
    const links = [];

    jsQuest.forEach((quest) => {
        const anchor = quest.querySelector("a");
        const link = anchor.href;
        links.push(link);
    });
    return links;
};

const handleOpenAllBtnClick = async () => {
    const openAll = document.querySelector("#openAll");
    if (openAll && openAll.disabled) {
        return;
    }
    openAll.disabled = true; 
    await openLinksOfQuests();
    openAll.disabled = false;
};

const handleValidateAllBtnClick = async () => {
    const validateAll = document.querySelector("#validateAll");
    if (validateAll && validateAll.disabled) {
        return;
    }
    await clickValidateAll();
};

export const addQuestEventListeners = () => {
    const openAll = document.querySelector("#openAll");
    if (openAll) {
        openAll.addEventListener("click", handleOpenAllBtnClick);
    }

    const validateAll = document.querySelector("#validateAll");
    if (validateAll) {
        validateAll.addEventListener("click", handleValidateAllBtnClick);
    }

    toggleBtnBackgroundStyle();
    validateAllBtnStyle();
    updateQuestsAchievementTitle();
};

export const removeQuestEventListeners = () => {
    const openAll = document.querySelector("#openAll");
    if (openAll) {
        openAll.removeEventListener("click", handleOpenAllBtnClick);
    }

    const validateAll = document.querySelector("#validateAll");
    if (validateAll) {
        validateAll.removeEventListener("click", handleValidateAllBtnClick);
    }
};

export const validateAllBtnStyle = async () => {
    const validateAll = document.querySelector("#validateAll");
    if (!validateAll) return;

    const icon = validateAll.querySelector("i");
    let buttons = getButtons();
    const newIcon = document.createElement("i");

    if (buttons.length > 0 && buttons[0].classList.contains("uncheck")) {
        newIcon.classList.add("fa-solid", "fa-xmark");
        if (icon) {
            validateAll.removeChild(icon);
        }
        validateAll.textContent = "Dévalider tout";
        validateAll.appendChild(newIcon);
    } else {
        newIcon.classList.add("fa-solid", "fa-check-double");
        if (icon) {
            validateAll.removeChild(icon);
        }
        validateAll.textContent = "Valider tout";
        validateAll.appendChild(newIcon);
    }
};

export const toggleBtnBackgroundStyle = async () => {
    const validateAll = document.querySelector("#validateAll");
    let buttons = getButtons();

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
};

const getButtons = () => {
    const checkBtns = document.querySelectorAll(".js-quest .check");
    const uncheckBtns = document.querySelectorAll(".js-quest .uncheck");
    let tglCompletionBtns = [];

    if (checkBtns.length === 0) {
        tglCompletionBtns = uncheckBtns;
    } else if (checkBtns.length > 0) {
        tglCompletionBtns = checkBtns;
    }
    return tglCompletionBtns;
};

const toggleBtn = async (button) => {
    return new Promise((resolve) => {
        if (document.body.contains(button)) {
            setTimeout(() => {
                button.click();
                resolve();
            }, 50);
        }
    });
}

const clickValidateAll = async () => {
    const validateAll = document.querySelector("#validateAll");
    if (validateAll) {
        validateAll.disabled = true;
    }

    let tglCompletionBtns = getButtons();

    if (!Array.isArray(tglCompletionBtns)) {
        tglCompletionBtns = Array.from(tglCompletionBtns);
    }

    for (const button of tglCompletionBtns) {
        await toggleBtn(button);
    }

    if (validateAll) {
        validateAll.disabled = false; 
    }
};

export const updateQuestsAchievementTitle = async () => {
    const questsAchievementId = document.querySelector(".js-quest")?.dataset.achievementId;
    if (questsAchievementId === undefined) return;
    const questsAchievementTitle = document.querySelector(
        "#quest_frame_achievement_title h4"
    );

    const achievements = await getAchievements();

    let currentAchievement;

    achievements.forEach((achievement) => {
        const currentAchievementId = achievement.dataset.achievementId;
        if (currentAchievementId === questsAchievementId) {
            currentAchievement = achievement.parentElement.querySelector("p");
        }
    });

    if (currentAchievement) {
        questsAchievementTitle.textContent = currentAchievement.textContent;
    }
};