document.addEventListener('DOMContentLoaded', function() {

    const style = document.createElement('style');
    style.innerHTML = `
        [contenteditable="true"] { 
            cursor: text; 
            transition: all 0.2s ease; 
            outline: 2px solid transparent; 
            border-radius: 4px; 
        }
        [contenteditable="true"]:hover { 
            background-color: rgba(0, 0, 0, 0.05);
        }
        .is-editing { 
            outline: 2px solid #555555;
            box-shadow: 0 0 8px rgba(85, 85, 85, 0.4);
            background-color: #FFFFFF !important;
            color: #000000 !important;
        }
    `;
    document.head.appendChild(style);

    const editableElements = document.querySelectorAll('.info-card__greeting, .info-card__name, .info-card__title, .languages-card__title, .languages-card__lang-name, .section-title, .experience-card__date, .experience-card__badge-text, .experience-card__job-title, .experience-card__meta, .experience-card__duties li, .tools__title, .tool-group__tag-text, .education-card__year, .education-card__subject, .education-card__tags, .education-card__institution, .interests__tag-text, .contact-card__title, .contact-card__email');
    
    const classIndices = {};
    editableElements.forEach(element => {
        const classList = Array.from(element.classList).join('-') || element.tagName.toLowerCase();
        const baseKey = classList;
        if (classIndices[baseKey] === undefined) { classIndices[baseKey] = 0; } else { classIndices[baseKey]++; }
        
        const storageKey = `${baseKey}-${classIndices[baseKey]}`;
        const savedValue = localStorage.getItem(storageKey);
        
        if (savedValue) {
            element.innerHTML = savedValue;
        }
        
        element.contentEditable = true;
        
        element.addEventListener('focus', () => element.classList.add('is-editing'));
        
        element.addEventListener('blur', () => {
            element.classList.remove('is-editing');
            localStorage.setItem(storageKey, element.innerHTML);
            element.classList.add('is-saved');
            element.addEventListener('animationend', () => {
                element.classList.remove('is-saved');
            }, { once: true });
        });
        
        element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                element.blur();
            }
        });
    });

    const resetButton = document.querySelector('.action-button:not(.action-button--primary)');
    if (resetButton) {
        resetButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (confirm("Вы уверены, что хотите сбросить все изменения? Они будут удалены навсегда.")) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    const downloadButton = document.getElementById('download-btn');
    const resumeElement = document.querySelector('.page-container');
    const footerElement = document.querySelector('.actions-footer');

    if (downloadButton && resumeElement && footerElement) {
        downloadButton.addEventListener('click', () => {
            const focusedElement = document.querySelector('.is-editing');
            if (focusedElement) {
                focusedElement.blur();
            }
            const originalButtonText = downloadButton.querySelector('span').textContent;
            const name = document.querySelector('.info-card__name').textContent.trim() || 'Resume';
            downloadButton.disabled = true;
            downloadButton.querySelector('span').textContent = 'Генерация...';
            footerElement.style.display = 'none';
            const options = { scale: 3, useCORS: true, backgroundColor: '#FFFFFF' };
            html2canvas(resumeElement, options).then(canvas => {
                footerElement.style.display = '';
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'pt', 'a4');
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasAspectRatio = canvas.height / canvas.width;
                let finalImgWidth = pdfWidth;
                let finalImgHeight = pdfWidth * canvasAspectRatio;
                if (finalImgHeight > pdfHeight) {
                    finalImgHeight = pdfHeight;
                    finalImgWidth = pdfHeight / canvasAspectRatio;
                }
                const xOffset = (pdfWidth - finalImgWidth) / 2;
                pdf.addImage(imgData, 'PNG', xOffset, 0, finalImgWidth, finalImgHeight);
                pdf.save(`${name} Resume.pdf`);
                downloadButton.disabled = false;
                downloadButton.querySelector('span').textContent = originalButtonText;
            }).catch(error => {
                footerElement.style.display = '';
                downloadButton.disabled = false;
                downloadButton.querySelector('span').textContent = originalButtonText;
                console.error('Ошибка при создании PDF:', error);
                alert('Не удалось создать PDF. Проверьте консоль разработчика (F12) на наличие ошибок.');
            });
        });
    }

    function createRipple(event) {
        const element = event.currentTarget;
        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        element.appendChild(ripple);
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    const rippleElements = document.querySelectorAll('.action-button, .header__card, .experience__card, .tool-group__card, .education-card, .interests, .contact-card');
    
    rippleElements.forEach(element => {
        element.addEventListener("click", createRipple);
    });

});