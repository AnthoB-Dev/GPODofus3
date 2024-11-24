/**
 * Clique sur le succès suivant de la liste des succès du guide.
 */
export const clickNextAchievementBtn = async() => {
    const questsAchievementId = document.querySelector(".js-quest").dataset.achievementId;
    if (!questsAchievementId) return;
    const achievements = await getAchievements();
    let nextAchievement;

    achievements.forEach((achievement) => {
        const currentAchievementId = achievement.dataset.achievementId;
        if (currentAchievementId === questsAchievementId) {
            nextAchievement = achievement.parentElement.nextElementSibling?.querySelector(".achievementName a");
        }
        return; 
    });
    nextAchievement.click();
}

/**
 * Met en surbrillance le succès cliqué.
 */
const handleAchievementButtonClick = (button, achievements) => {
    return () => {
        achievements.forEach((e) => {
            e.classList.remove("active");
        });
        button.parentElement.parentElement.classList.add("active");
    };
};

export const addAchievementEventListeners = async () => {
    const buttons = document.querySelectorAll(".achievement-button");
    const achievements = await getAchievements();
    buttons.forEach((button) => {
        button.addEventListener("click", handleAchievementButtonClick(button, achievements));
    });
};

export const removeAchievementEventListeners = async () => {
    const buttons = document.querySelectorAll(".achievement-button");
    const achievements = await getAchievements();
    buttons.forEach((button) => {
        button.removeEventListener("click", handleAchievementButtonClick(button, achievements));
    });
};

/**
 * Clique sur le succès actuel (sert surtout lors du validateAll clickNextAchievementBtn() pour refocus le dernier succès de la liste)
 */
export const clickCurrentAchievementBtn = async () => {
    try {
        const [...achievements] = await getAchievements();
        const lastAchievement = achievements.slice(-1)[0].querySelector(".achievementName a");
        lastAchievement.click();
    } catch (error) {
        console.log("error", error);
    }
}

/**
 * Récupère les succès du guide.
 * @returns {Promise<HTMLElement[]>}
 */
export const getAchievements = () => {
    return new Promise((resolve, reject) => {
        const achievements = document.querySelectorAll(".js-achievement");
        if (!achievements) {
            reject("No achievements found");
        }
        resolve(achievements);
    });
};