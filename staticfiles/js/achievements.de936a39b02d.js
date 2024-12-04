/**
 * Met en surbrillance le succès cliqué.
 */
export const handleAchievementButtonClick = async (event) => {
    const button = event.currentTarget;
    const achievements = await getAchievements();
    achievements.forEach((achievement) => {
        achievement.classList.remove("active");
    });
    button.parentElement.parentElement.classList.add("active");
};

export const addAchievementBtnClickEventListeners = async () => {
    const buttons = document.querySelectorAll(".achievement-button");
    buttons.forEach((button) => {
        button.addEventListener("click", handleAchievementButtonClick);
    });
};

export const removeAchievementBtnClickEventListeners = async () => {
    const buttons = document.querySelectorAll(".achievement-button");
    buttons.forEach((button) => {
        button.removeEventListener("click", handleAchievementButtonClick);
    });
};

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