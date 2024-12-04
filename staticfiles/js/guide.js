const createModal = (image) => {
    const modal = document.createElement('div');
    const img = document.createElement('img');
    
    img.src = image.src;
    img.classList.add('is-open');

    modal.classList.add('modalImage');
    modal.classList.remove('modal-close');

    document.body.appendChild(modal);

    if (img.naturalWidth < 600) {
        img.style.zoom = 1.5;
    } else if (img.naturalWidth < 800) {
        img.style.zoom = 1.2;
    }

    setTimeout(() => {
        modal.classList.add('modal-open');
    }, 30);
    setTimeout(() => {
        modal.appendChild(img);
    }, 300);

    modal.addEventListener('click', removeModal);
}

const removeModal = () => {
    const modal = document.querySelector('.modalImage');
    if (modal) {
        modal.classList.remove('modal-open');
        modal.classList.add('modal-close');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    modal.removeEventListener('click', removeModal);
}

const toggleSummary = async (button) => {
    const summaryBtns = await getSummaryBtns();
    
    let summary;
    summaryBtns.forEach(btn => {
        if (btn !== button) {
            btn.textContent = "Afficher";
            summary = btn.nextElementSibling;
            summary.style="";
            summary.classList.remove('open');
        } else {
            summary = btn.nextElementSibling;
            if (summary.classList.contains('open')) {
                btn.textContent = "Afficher";
                summary.style="";
            } else {
                btn.textContent = "Masquer";
                summary.style="display: block";
            }
            summary.classList.toggle('open');
        }
    })
}

const getSummaryBtns = () => {
    return new Promise((resolve) => {
        const summaryBtns = document.querySelectorAll('.jsToggleSummaryBtn');
        resolve(summaryBtns);
    })
}

const getImages = () => {
    return new Promise((resolve) => {
        const images = document.querySelectorAll('.guide_element img');
        resolve(images);
    })
}

const getGuideId = () => {
    return new Promise((resolve) => {
        const guideId = document.querySelector('main').dataset.guide;
        resolve(guideId);
    })
}


export const addGuideAlignmentFormEventListener = () => {
    const alignmentForm = document.querySelector('#alignment_form');
    if (!alignmentForm) return;
    const select = alignmentForm.querySelector('#alignment_select');

    if (select) {
        select.addEventListener('change', () => {
            alignmentForm.requestSubmit();
        });
    }
}

export const removeGuideAlignmentFormEventListener = () => {
    const alignmentForm = document.querySelector('#alignment_form');
    if (!alignmentForm) return;
    const select = alignmentForm.querySelector('#alignment_select');

    if (select) {
        select.removeEventListener('change', () => {
            alignmentForm.requestSubmit();
        });
    }
}

export const addGuideEventListeners = async () => {
    const images = await getImages();
    images.forEach(image => {
        image.addEventListener('click', () => {
            createModal(image);
        })
    })
    const summaryBtns = await getSummaryBtns();
    summaryBtns.forEach(button => {
        button.addEventListener('click', () => {
            toggleSummary(button);
        });
    });
    const choseAlignmentGuideId = 1;
    const guideId = await getGuideId();
    if (guideId === choseAlignmentGuideId) {
        addGuideAlignmentFormEventListener();
    }
}

export const removeGuideEventListeners = async () => {
    const images = await getImages();
    images.forEach(image => {
        image.removeEventListener('click', () => {
            createModal(image);
        })
    })
    const buttons = await getSummaryBtns();
    buttons.forEach(button => {
        button.removeEventListener('click', () => {
            toggleSummary(button);
        });
    });
    removeGuideAlignmentFormEventListener();
}