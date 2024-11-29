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
        updateSelectedGuide();
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

    if (!guideHeader.hasAttribute("data-initialized")) {
        guideHeader.setAttribute("data-initialized", "true");
        guideHeader.addEventListener("click", handleGuideHeaderClick);
    }

    overflow.querySelectorAll(".guide-item").forEach((item) => {
        item.addEventListener("click", handleGuideItemClick);
    });

    document.addEventListener("click", handleDocumentClick);

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

let shiftPressed = false;
let ctrlPressed = false;
let altPressed = false;

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
    const guideTitle= document.querySelector('#guide h3');
    const achievementTitle = document.querySelector('#achievements h3');

    document.removeEventListener('keyup', handleKeys);

    // Mettre à jour l'état des touches modificateurs
    if (e.type === 'keydown') {
        if (e.key === 'Shift') {
            if (!shiftPressed) {
                shiftPressed = true;
                achievementTitle.classList.add('keyboardFocusedElement');
                guideTitle.classList.remove('keyboardFocusedElement');
                topNav.classList.contains("js-open") ? toggleDropdown() : null;
                ctrlPressed = false;
            } else {
                shiftPressed = false;
                achievementTitle.classList.remove('keyboardFocusedElement');
            }
        } 
        if (e.key === 'Control') {
            if (!ctrlPressed) {
                ctrlPressed = true;
                guideTitle.classList.add('keyboardFocusedElement');
                achievementTitle.classList.remove('keyboardFocusedElement');
                topNav.classList.contains("js-open") ? toggleDropdown() : null;
                shiftPressed = false;
            } else {
                ctrlPressed = false;
                guideTitle.classList.remove('keyboardFocusedElement');
            }
        };
        if (e.key === 'Tab') {
            e.preventDefault();
            if (ctrlPressed || shiftPressed) {
                ctrlPressed = false;
                shiftPressed = false
            }
        };
        if (e.key === 'Alt') altPressed = true;
    } else if (e.type === 'keyup') {
        if (e.key === 'Alt') altPressed = false;
    }

    const notCtrl = !ctrlPressed && shiftPressed;
    const notShift = ctrlPressed && !shiftPressed;
    const neitherCtrlNorShift = !ctrlPressed && !shiftPressed;

    const arrowDown = e.type === 'keydown' && e.key === 'ArrowDown';
    const arrowUp = e.type === 'keydown' && e.key === 'ArrowUp';
    const arrowLeft = e.type === 'keydown' && e.key === 'ArrowLeft';
    const arrowRight = e.type === 'keydown' && e.key === 'ArrowRight';

    if (neitherCtrlNorShift && arrowLeft) {
        pageNavLeft.click();
    } else if (neitherCtrlNorShift && arrowRight) {
        pageNavRight.click();
    } else if (neitherCtrlNorShift && arrowDown) {
        if (!topNav.classList.contains('js-open')) {
            toggleDropdown();
        } else {
            if (selected.nextElementSibling) {
                selected.nextElementSibling.classList.add('selected');
                selected.classList.remove('selected');
                selected.nextElementSibling.scrollIntoView({ block: 'nearest' });
            }
        }
    } else if (neitherCtrlNorShift && arrowUp) {
        if (topNav.classList.contains('js-open')) {
            if (selected.previousElementSibling) {
                selected.previousElementSibling.classList.add('selected');
                selected.classList.remove('selected');
                selected.previousElementSibling.scrollIntoView({ block: 'nearest' });
            } else if (selected.previousElementSibling === null) {
                toggleDropdown();
            }
        }
    } else if (notCtrl && arrowDown) {
        activeAchievement.parentElement.nextElementSibling.querySelector('.achievementName a').click();
    } else if (notCtrl && arrowUp) {
        activeAchievement.parentElement.previousElementSibling.querySelector('.achievementName a').click();
    } else if (neitherCtrlNorShift && e.key === 'Enter' && topNav.classList.contains('js-open')) {
        selected.click();
    } else if (e.key === 'Escape' && topNav.classList.contains('js-open')) {
        if (topNav.classList.contains('js-open')) {
            toggleDropdown();
        }
    } else if (neitherCtrlNorShift && e.key === 'o') {
        openAllbtn.click();
    } else if (neitherCtrlNorShift && e.key === 'v') {
        validateAllBtn.click();
    } else if (notShift && arrowDown) {
        if (guideScrollable) {
            guideScrollable.scrollBy({ top: 250, behavior: 'smooth' });
        }
    } else if (notShift && arrowUp) {
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
