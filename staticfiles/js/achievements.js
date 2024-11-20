export const Achievements = {
    clickFirstAchievementNotCompleted: function() {
        const percentages = document.querySelectorAll(".js-achievementPercent");
        let notCompletedAchievements = [];
        
        percentages.forEach((item) => {
            const completionPercentage = Number(item.textContent);
            const button = item.parentElement?.parentElement;
    
            if (completionPercentage < 100) {
                notCompletedAchievements.push(button);
            } 
        });
        notCompletedAchievements[0] ? notCompletedAchievements[0].querySelector(".achievementName a").click() : null;
    },

    saveLastAchievement: function(achievement) {
        const achievementId = Number(achievement.dataset.achievementId);
        
        // Enregistrer dans le localStorage classique
        localStorage.setItem("lastAchievement", achievementId);
        
        // Enregistrer dans le stockage Electron via IPC
        if (window.electronAPI && window.electronAPI.saveLastAchievement) {
            window.electronAPI.saveLastAchievement(achievementId)
                .then(response => {
                    if (response.status === 'success') {
                        console.log('Dernier achievement sauvegardé.');
                    } else {
                        console.error('Erreur lors de la sauvegarde.');
                    }
                })
                .catch(error => {
                    console.error('Erreur IPC:', error);
                });
        }
    },

    clickLastAchievement: function() {
        const lastAchievementId = localStorage.getItem("lastAchievement");
        const achievements = this.getAchievements();
        let achievement;

        if (!achievements) return;

        if (!lastAchievementId) {
            achievement = achievements[0].querySelector(".achievementName a");
        } else {
            achievement = document.querySelector(".achievementName #achievement_" + lastAchievementId);
        }

        if(!achievement) {
            this.clickFirstAchievementNotCompleted();
            return;
        }
        achievement?.click();
    },

    listenToAchievementClick: function() {
        const achievements = this.getAchievements();

        achievements.forEach((achievement) => {
            achievement.addEventListener("click", () => {
                this.saveLastAchievement(achievement);
            });
        });
    },

    clickNextAchievementBtn: function() {
        const questsAchievementId = document.querySelector(".js-quest").dataset.achievementId;
        const achievements = this.getAchievements();
        let nextAchievement;
    
        achievements.forEach((achievement) => {
            const currentAchievementId = achievement.dataset.achievementId;
            if (currentAchievementId === questsAchievementId) {
                nextAchievement = achievement.parentElement.nextElementSibling?.querySelector(".achievementName a");
            }
            return; 
        });
    
        setTimeout(() => {
            if (!nextAchievement) {
                this.clickCurrentAchievementBtn();
                this.toggleActiveStateOnAchievements();
            } else {
                nextAchievement.click();
            }
        }, 100);
    },

    toggleActiveStateOnAchievements: function() {
        const buttons = document.querySelectorAll(".achievement-button");
        const jsAchievements = this.getAchievements();
        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                jsAchievements.forEach((e) => {
                    e.classList.remove("active");
                })
                button.parentElement.parentElement.classList.add("active");
            });
        });
    },

    clickCurrentAchievementBtn: function() {
        const questsAchievementId = document.querySelector(".js-quest").dataset.achievementId;
        const achievements = this.getAchievements();
        let currentAchievement;
        
        achievements.forEach((achievement) => {
            const currentAchievementId = achievement.dataset.achievementId;
            if (currentAchievementId === questsAchievementId) {
                currentAchievement = achievement.parentElement.querySelector(".achievementName a");
            }
            return; 
        });
        
        setTimeout(() => {
            currentAchievement.click();
        }, 100);
    },

    getAchievements: function() {
        return document.querySelectorAll(".js-achievement");
    }
};
