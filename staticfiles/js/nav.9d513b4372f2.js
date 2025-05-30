import { getAchievements } from './achievements.js';

export const updateTopNavTitle = (event = null) => {
    let newTitle;

    if (event && event.detail && event.detail.newBody) {
        // Si event.detail.newBody est disponible (dans turbo:before-render)
        newTitle = event.detail.newBody.querySelector("#topNav .guide-header h2")?.textContent;
    } else {
        // Sinon, on prend le titre actuel
        newTitle = document.querySelector("#topNav .guide-header h2")?.textContent;
    }

    if (newTitle) {
        const currentTitle = document.querySelector("#topNav .guide-header h2");
        if (currentTitle) {
            currentTitle.textContent = newTitle;
        }
    }
};

export const updateSelectedGuide = () => {
    const currentTitle = document.querySelector("#topNav .guide-header h2")?.textContent;
    const guideItems = document.querySelectorAll(".guide-item");

    guideItems.forEach((item) => {
        const itemTitle = item.textContent.trim().split(" ").slice(7).join(" ");

        if (itemTitle == currentTitle?.trim()) {
            item.classList.add("selected");
        } else {
            item.classList.remove("selected");
        }
    });
};

/**
 * Gère le clique sur l'icone des options.
 */
const handleOptionGearClick = async() => {
    await createOptionsModal()
    addOptionsListeners();
};

const handleGuideHeaderClick = (event) => {
    event.stopPropagation();
    toggleDropdown();
};

const handleGuideItemClick = (e) => {
    e.preventDefault();
    document.querySelectorAll(".guide-item").forEach((i) => i.classList.remove("selected"));
    e.currentTarget.classList.add("selected");
    setTimeout(() => {
        toggleDropdown();
    }, 100);
    Turbo.visit(e.currentTarget.dataset.url, {
        action: "replace",
        frame: "frame_main",
    });
};

const handleDocumentClick = (e) => {
    const topNav = document.getElementById("topNav");
    if (!topNav.contains(e.target) && !e.target.classList.contains("guide-item") && topNav.classList.contains("js-open")) {
        toggleDropdown();
    }
};

export const addNavEventListeners = () => {
    const topNav = document.getElementById("topNav");
    const guideHeader = topNav.querySelector(".guide-header");
    const dropDownContent = topNav.querySelector(".dropdown-content");
    const overflow = dropDownContent.querySelector(".overflow");
    const optionsGear = document.querySelector("#gear");

    if (!guideHeader.hasAttribute("data-initialized")) {
        guideHeader.setAttribute("data-initialized", "true");
        guideHeader.addEventListener("click", handleGuideHeaderClick);
    }

    overflow.querySelectorAll(".guide-item").forEach((item) => {
        item.addEventListener("click", handleGuideItemClick);
    });

    document.addEventListener("click", handleDocumentClick);

    optionsGear.addEventListener("click", handleOptionGearClick)

    // Ajout des écouteurs d'événements pour les boutons de navigation de la page
    addPageNavEventListeners();
};

export const removeNavEventListeners = () => {
    const topNav = document.getElementById("topNav");
    const guideHeader = topNav.querySelector(".guide-header");
    const dropDownContent = topNav.querySelector(".dropdown-content");
    const overflow = dropDownContent.querySelector(".overflow");

    if (guideHeader.hasAttribute("data-initialized")) {
        guideHeader.removeAttribute("data-initialized");
        guideHeader.removeEventListener("click", handleGuideHeaderClick);
    }

    overflow.querySelectorAll(".guide-item").forEach((item) => {
        item.removeEventListener("click", handleGuideItemClick);
    });

    document.removeEventListener("click", handleDocumentClick);

    // Suppression des écouteurs d'événements pour les boutons de navigation de la page
    removePageNavEventListeners();
};

/**
 * Supprime la fenêtre des options.
 */
const closeOptionsModal = () => {
    const modal = document.querySelector('.optionModalBackground');
    if (modal) {
        modal.remove();
    }
}

/**
 * Crée la fenêtre des options.
 */
const createOptionsModal = () => {
    return new Promise ((resolve) => {
        const gearIcon = document.querySelector('#gear');
        const createSaveUrl = gearIcon.getAttribute('data-create-save-url');
        const loadSaveUrl = gearIcon.getAttribute('data-load-save-url');
        const isLinux = navigator.userAgent.includes('Linux');
        const winPath = "\\AppData\\Roaming\\GPODofus3\\saves";
        const linuxPath = "/home/.config/GPODofus3/saves";
        let savesPath = winPath;
        if (isLinux) { savesPath = linuxPath };

        // Création du conteneur & background 50% black
        const background = document.createElement('div');
        background.classList.add('optionModalBackground');
        const modal = document.createElement('div');
        modal.classList.add('optionModal')
        const closeButton = document.createElement('div');
        closeButton.classList.add('optionCloseButton');
        closeButton.id = 'optionsCloseBtn';

        const closeIcon = document.createElement('i');
        closeIcon.classList.add('fa-solid', 'fa-xmark');
        
        closeButton.appendChild(closeIcon);
        modal.appendChild(closeButton);
    
        // Création du conteneur des settings
        const containerLeft = document.createElement('div');
        containerLeft.classList.add('optionLeftPanel');
        const leftTitle = document.createElement('h4');
        leftTitle.innerText = "Options";
        const settingsContainer = document.createElement('div');
        settingsContainer.classList.add('settingsContainer');
        
        // Création du setting "Thèmes"
        const settingThemes = document.createElement('button');
        settingThemes.classList.add('optionContainer');
        const iconTheme = document.createElement('i');
        iconTheme.classList.add('fa-solid', 'fa-moon')
        const pThemes = document.createElement('p');
        pThemes.innerText = "Thèmes";
        // Désactivé le temps de l'implémenter
        settingThemes.disabled = true;
        settingThemes.style.background = "#999da1";
        settingThemes.style.cursor = "not-allowed";
        
        settingThemes.appendChild(iconTheme);
        settingThemes.appendChild(pThemes);
        
        // Création du setting "Sauvegarde"
        const settingSave = document.createElement('div');
        settingSave.classList.add('optionContainer', 'active');
        const iconSave = document.createElement('i');
        iconSave.classList.add('fa-solid', 'fa-floppy-disk');
        const pSave = document.createElement('p');
        pSave.innerText = "Sauvegarde";
    
        settingSave.appendChild(iconSave);
        settingSave.appendChild(pSave);
    
        settingsContainer.appendChild(settingThemes);
        settingsContainer.appendChild(settingSave);
    
        containerLeft.appendChild(leftTitle);
        containerLeft.appendChild(settingsContainer);
    
        // Création du conteneur des options des settings
        const containerRight = document.createElement('div');
        containerRight.classList.add('optionRightPanel');
        
        // Création de l'option de sauvegarde du setting sauvegarde
        const settingSaveO1 = document.createElement('a');
        settingSaveO1.id = "option-save";
        settingSaveO1.classList.add("confirmDelete");
        settingSaveO1.setAttribute('data-turbo-stream', '');
        settingSaveO1.setAttribute('data-turbo-method', 'post');
        settingSaveO1.href = createSaveUrl;
        settingSaveO1.target = "blank";
        settingSaveO1.classList.add('settingsContainer');
        const o1Icon = document.createElement('i');
        o1Icon.classList.add('fa-solid', 'fa-upload');
        const o1TextsContainer = document.createElement('div');
        o1TextsContainer.classList.add('settingTextsContainer');
        const o1Title = document.createElement('p');
        o1Title.classList.add('settingTitle');
        o1Title.innerText = "Créer un fichier de sauvegarde";
        const o1UnderTitle = document.createElement('p');
        o1UnderTitle.classList.add('settingDescription');
        
        o1UnderTitle.innerHTML = `Créer un fichier dans ${savesPath} qui sauvegarde la progression générale.<br/>À utiliser avant de mettre à jour l’application. Chaque nouvelle sauvegarde remplace l'ancienne mais l'avant dernière est gardée en étant renommée old_save. En cas de problèmes avec la dernière sauvegarde, rennomez le fichier de sauvegarde '<em>old_save-</em>' en '<em>save-</em>' pour revenir en arrière.`;;
    
        o1TextsContainer.appendChild(o1Title);
        o1TextsContainer.appendChild(o1UnderTitle);
        
        settingSaveO1.appendChild(o1Icon);
        settingSaveO1.appendChild(o1TextsContainer);
    
        containerRight.appendChild(settingSaveO1);
        
        // Création de l'option de chargement du setting sauvegarde
        const settingSaveO2 = document.createElement('a');
        settingSaveO2.id = "option-load";
        settingSaveO2.setAttribute('data-turbo-stream', '');
        settingSaveO2.setAttribute('data-turbo-method', 'post');
        settingSaveO2.href = loadSaveUrl;
        settingSaveO2.target = "blank";
        settingSaveO2.classList.add('settingsContainer');
        const o2Icon = document.createElement('i');
        o2Icon.classList.add('fa-solid', 'fa-download');
        const o2TextsContainer = document.createElement('div');
        o2TextsContainer.classList.add('settingTextsContainer');
        const o2Title = document.createElement('p');
        o2Title.classList.add('settingTitle');
        o2Title.innerText = "Charger la sauvegarde";
        const o2UnderTitle = document.createElement('p');
        o2UnderTitle.classList.add('settingDescription');
        o2UnderTitle.innerHTML = `Charge le fichier de sauvegarde situé à l’emplacement ${savesPath}.<br/>À utiliser une fois l’application mise à jour.`;
    
        o2TextsContainer.appendChild(o2Title);
        o2TextsContainer.appendChild(o2UnderTitle);
        
        settingSaveO2.appendChild(o2Icon);
        settingSaveO2.appendChild(o2TextsContainer);
    
        containerRight.appendChild(settingSaveO2);
    
        modal.appendChild(containerLeft);
        modal.appendChild(containerRight);
    
        background.appendChild(modal);

        document.body.appendChild(background);
        resolve();
    })
}

/**
 * Supprime les messages de confirmation de réussite ou d'échec.
 */
export const removeMessages = () => {
    const messages = document.querySelector('#messages');
    let timeout;

    messages.classList.contains('failure') ? timeout = 10000 : timeout = 6000

    setTimeout(() => {
        messages.classList.add('hidden');
    }, timeout);
}

const toggleDropdown = () => {
    const topNav = document.getElementById("topNav");
    const overflow = document.querySelector('.overflow');
    const dropDownContent = topNav.querySelector(".dropdown-content");

    if (!topNav.classList.contains("js-open")) {
        topNav.classList.remove('js-close');
        topNav.classList.add('js-open');
        overflow.classList.remove('hidden');
        dropDownContent.classList.remove('hidden');
        overflow.offsetHeight;
        overflow.classList.add('overflowOpen');
        overflow.classList.remove('overflowClose');

        // Assurer que l'élément sélectionné est visible
        const selected = document.querySelector('.guide-item.selected');
        if (selected) {
            selected.scrollIntoView({  block: 'nearest' });
        }
    } else {
        topNav.classList.remove('js-open');
        topNav.classList.add('js-close');
        overflow.classList.remove('overflowOpen');
        overflow.classList.add('overflowClose');
        setTimeout(() => {
            overflow.classList.add('hidden');
            dropDownContent.classList.add('hidden');
        }, 100);
    }
    toggleCaret();
};

const toggleCaret = () => {
    const caret = document.querySelector("#topNav i");
    caret.classList.toggle("caretClose");
    caret.classList.toggle("caretOpen");
};

const handlePageNavButtonClick = (e) => {
    const button = e.currentTarget;
    const url = button.getAttribute('data-url');
    const frame = button.getAttribute('data-frame');
    const action = button.getAttribute('data-action');

    if (url) {
        Turbo.visit(url, { 
            frame: frame,
            action: action
        });
    }
};

let shiftActivated = false;
let ctrlActivated = false;
let altActivated = false;

const handleKeys = async (e) => {
    const pageNavLeft = document.querySelector('#pageNavLeft');
    const pageNavRight = document.querySelector('#pageNavRight');
    const topNav = document.getElementById("topNav");
    const selected = document.querySelector('.selected');
    const openAllbtn = document.querySelector('#openAll');
    const validateAllBtn = document.querySelector('#validateAll');
    const achievements = await getAchievements();
    const activeAchievement = [...achievements].find(achievement => achievement.classList.contains("active"));
    const guideScrollable = document.querySelector('#guide .content');
    const achievementsScrollable = document.querySelector('#achievements .content');
    const guideTitle= document.querySelector('#guide h3');
    const achievementTitle = document.querySelector('#achievements h3');

    document.removeEventListener('keyup', handleKeys);

    // Mettre à jour l'état des touches modificateurs
    if (e.type === 'keydown') {
        if (e.key === 'Shift') {
            if (!shiftActivated) {
                shiftActivated = true;
                achievementTitle.classList.add('keyboardFocusedElement');
                guideTitle.classList.remove('keyboardFocusedElement');
                topNav.classList.contains("js-open") ? toggleDropdown() : null;
                ctrlActivated = false;
            } else {
                shiftActivated = false;
                achievementTitle.classList.remove('keyboardFocusedElement');
            }
        } 
        if (e.key === 'Control') {
            if (!ctrlActivated) {
                ctrlActivated = true;
                guideTitle.classList.add('keyboardFocusedElement');
                achievementTitle.classList.remove('keyboardFocusedElement');
                topNav.classList.contains("js-open") ? toggleDropdown() : null;
                shiftActivated = false;
            } else {
                ctrlActivated = false;
                guideTitle.classList.remove('keyboardFocusedElement');
            }
        };
        if (e.key === 'Tab') {
            e.preventDefault();
            if (ctrlActivated || shiftActivated) {
                ctrlActivated = false;
                shiftActivated = false
            }
        };
        if (e.key === 'Alt') altActivated = true;
    } else if (e.type === 'keyup') {
        if (e.key === 'Alt') altActivated = false;
    }

    const shiftIsActivated = !ctrlActivated && shiftActivated;
    const ctrlIsActivated = ctrlActivated && !shiftActivated;
    const nothingActivated = !ctrlActivated && !shiftActivated;

    const arrowDown = e.type === 'keydown' && e.key === 'ArrowDown';
    const arrowUp = e.type === 'keydown' && e.key === 'ArrowUp';
    const arrowLeft = e.type === 'keydown' && e.key === 'ArrowLeft';
    const arrowRight = e.type === 'keydown' && e.key === 'ArrowRight';
    const enterKey = e.key === 'Enter';
    const escapeKey = e.key === 'Escape';
    const oKey = e.key === 'o';
    const vKey = e.key === 'v';

    if (nothingActivated && arrowLeft) {
        pageNavLeft.click();
    } else if (nothingActivated && arrowRight) {
        pageNavRight.click();
    } else if (nothingActivated && arrowDown) {
        if (!topNav.classList.contains('js-open')) {
            toggleDropdown();
        } else {
            if (selected.nextElementSibling) {
                selected.nextElementSibling?.classList.add('selected');
                selected.classList.remove('selected');
                selected.nextElementSibling?.scrollIntoView({ block: 'nearest' });
            }
        }
    } else if (nothingActivated && arrowUp) {
        if (topNav.classList.contains('js-open')) {
            if (selected.previousElementSibling) {
                selected.previousElementSibling.classList.add('selected');
                selected.classList.remove('selected');
                selected.previousElementSibling.scrollIntoView({ block: 'nearest' });
            } else if (selected.previousElementSibling === null) {
                toggleDropdown();
            }
        }
    } else if (shiftIsActivated && arrowDown) {
        if (achievementsScrollable) {
            achievementsScrollable.scrollBy({ top: 30, behavior: 'smooth' });
        }
        activeAchievement.parentElement.nextElementSibling?.querySelector('.achievementName a').click();
    } else if (shiftIsActivated && arrowUp) {
        if (achievementsScrollable) {
            achievementsScrollable.scrollBy({ top: -30, behavior: 'smooth' });
        }
        activeAchievement.parentElement.previousElementSibling?.querySelector('.achievementName a').click();
    } else if (nothingActivated && enterKey && topNav.classList.contains('js-open')) {
        selected.click();
    } else if (escapeKey && topNav.classList.contains('js-open')) {
        if (topNav.classList.contains('js-open')) {
            toggleDropdown();
        }
    } else if (nothingActivated && oKey) {
        openAllbtn.click();
    } else if (nothingActivated && vKey) {
        validateAllBtn.click();
    } else if (ctrlIsActivated && arrowDown) {
        if (guideScrollable) {
            guideScrollable.scrollBy({ top: 250, behavior: 'smooth' });
        }
    } else if (shiftIsActivated && arrowUp) {
        if (guideScrollable) {
            guideScrollable.scrollBy({ top: -250, behavior: 'smooth' });
        }
    }
}

export const addKeysEventListeners = () => {
    document.addEventListener('keydown', handleKeys);
    document.addEventListener('keyup', handleKeys);
};

export const removeKeysEventListeners = () => {
    document.removeEventListener('keydown', handleKeys);
    document.removeEventListener('keyup', handleKeys);
};

const addPageNavEventListeners = () => {
    const navButtons = document.querySelectorAll('.page-nav-button');

    navButtons.forEach(function(button) {
        button.addEventListener('click', handlePageNavButtonClick);
    });
};

const removePageNavEventListeners = () => {
    const navButtons = document.querySelectorAll('.page-nav-button');

    navButtons.forEach(function(button) {
        button.removeEventListener('click', handlePageNavButtonClick);
    });
};

/**
 * Gère le clique sur la X de fermeture des options.
 * TODO - Gérer la fermeture en cliquant en dehors de la fenêtre
 */
const addOptionsListeners = () => {
    const optionsCloseBtn = document.querySelector('#optionsCloseBtn');
    const confirmDelete = document.querySelector('#option-save');
    // const backgroundModal = document.querySelector('.optionModalBackground');

    optionsCloseBtn.addEventListener('click', () => {
        closeOptionsModal();
    });

    confirmDelete.addEventListener('click', (e) => {
        const confirmSave = confirm("Êtes-vous sûr de vouloir créer un fichier de sauvegarde ? Le fichier précédent sera renommé en old_save.");
        if (!confirmSave) {
            e.preventDefault();
        }
    })

    // backgroundModal.addEventListener('click', () => {
    //     closeOptionsModal();
    // });
}
