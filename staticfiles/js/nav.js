import { Achievements } from "./achievements.js";

export const Nav = {
    init: function() {
        document.addEventListener("turbo:before-render", this.updateTitle.bind(this));
        document.addEventListener("turbo:load", this.onTurboLoad.bind(this));
    },

    onTurboLoad: function() {
        this.topNavHandler();
        this.pageNavHandler();
        setTimeout(() => {
            Achievements.clickLastAchievement();
        }, 200);
    },

    updateTitle(event) {
        const newTitle = event.detail.newBody.querySelector("#topNav .guide-header h2")?.textContent;

        if (newTitle) {
            const currentTitle = document.querySelector("#topNav .guide-header h2");
            if (currentTitle) {
                currentTitle.textContent = newTitle;
            }
        this.updateSelectedGuide();
      }
    },

    updateSelectedGuide: function() {
        const currentTitle = document.querySelector("#topNav .guide-header h2")?.textContent;
        const guideItems = document.querySelectorAll(".guide-item");

        guideItems.forEach((item) => {
            if (item.textContent.trim() === currentTitle?.trim()) {
                item.classList.add("selected");
            } else {
                item.classList.remove("selected");
            }
        });
    },

    topNavHandler: function() {
        const topNav = document.getElementById("topNav");
        const guideHeader = topNav.querySelector(".guide-header");
        const dropDownContent = topNav.querySelector(".dropdown-content");
        const overflow = dropDownContent.querySelector(".overflow");

        if (!guideHeader.hasAttribute("data-initialized")) {
            guideHeader.setAttribute("data-initialized", "true");
            
            guideHeader.addEventListener("click", (event) => {
                event.stopPropagation();

                if (!topNav.classList.contains("js-open")) {
                    this.toggleDropdown();
                    setTimeout(() => {
                        const selectedItem = overflow.querySelector(".guide-item.selected");
                        if (selectedItem) {
                            selectedItem.scrollIntoView({
                                behavior: "auto",
                                block: "center",
                            });
                        }
                    }, 10);
                } else {
                    this.toggleDropdown();
                }
            });
        };

        overflow.querySelectorAll(".guide-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelectorAll(".guide-item").forEach((i) => i.classList.remove("selected"));
                item.classList.add("selected");
                setTimeout(() => {
                    this.toggleDropdown();
                }, 100);
                Turbo.visit(item.dataset.url, {
                    action: "replace",
                    frame: "frame_main",
                });
            });
        });

        document.addEventListener("click", (e) => {
            if (!topNav.contains(e.target) && !e.target.classList.contains("guide-item") && topNav.classList.contains("js-open")) {
                this.toggleDropdown();
            }
        });
    },

    toggleDropdown: function() {
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
        this.toggleCaret();
    },

    toggleCaret: function() {
        const caret = document.querySelector("#topNav i");
        caret.classList.toggle("caretClose");
        caret.classList.toggle("caretOpen");
    },

    pageNavHandler: function() {
        const navButtons = document.querySelectorAll('.page-nav-button');
    
        navButtons.forEach(function(button) {
            button.addEventListener('click', (e) => {
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
            });
        });
    }
};