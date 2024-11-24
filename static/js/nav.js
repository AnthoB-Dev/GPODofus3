export const updateTopNavTitle = (event) => {
    const newTitle = event.detail.newBody.querySelector(
        "#topNav .guide-header h2"
    )?.textContent;

    if (newTitle) {
        const currentTitle = document.querySelector(
            "#topNav .guide-header h2"
        );
        if (currentTitle) {
            currentTitle.textContent = newTitle;
        }
        updateSelectedGuide();
    }
};

const updateSelectedGuide = () => {
    const currentTitle = document.querySelector("#topNav .guide-header h2")?.textContent;
    const guideItems = document.querySelectorAll(".guide-item");

    guideItems.forEach((item) => {
        if (item.textContent.trim() === currentTitle?.trim()) {
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

    // Ajouter les écouteurs d'événements pour les boutons de navigation de la page
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

    // Supprimer les écouteurs d'événements pour les boutons de navigation de la page
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