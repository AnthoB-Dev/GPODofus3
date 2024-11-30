/**
 * Met en surbrillance le succès cliqué.
 */
export const handleAchievementButtonClick = (button, achievements) => {
    return () => {
        achievements.forEach((e) => {
            e.classList.remove("active");
        });
        button.parentElement.parentElement.classList.add("active");
    };
}

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