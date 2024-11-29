/**
 * Clique sur le succès suivant de la liste des succès du guide.
 */
// export const clickNextAchievementBtn = async() => {
//     const questsAchievementId = document.querySelector(".js-quest").dataset.achievementId;
//     if (!questsAchievementId) return;
//     const achievements = await getAchievements();
//     let nextAchievement;

//     nextAchievement = [...achievements].find(
//         achievement => achievement.dataset.achievementId === questsAchievementId)
//         .parentElement.nextElementSibling?.querySelector(".achievementName a")
//     ;
    
//     nextAchievement.click();
// }

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
        button.addEventListener("click", () => {
            handleAchievementButtonClick(button, achievements);
        });
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
 * Clique sur le succès actuel qui a la classe "active".
 */
// export const clickCurrentAchievementBtn = async () => {
//     const achievements = await getAchievements();
//     const currentAchievement = [...achievements].find(achievement => achievement.classList.contains("active"));
//     if (!currentAchievement) return;
//     currentAchievement.querySelector(".achievementName a").click();
// }

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