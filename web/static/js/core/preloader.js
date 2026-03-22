/**
 * Preloader module - manages loading states using existing DOM elements
 */
class Preloader {
    constructor() {
        this.overlay = document.getElementById('app-initial-preloader');
        this.spaSpinner = document.getElementById('spa-mini-spinner');
        this.isVisible = false;
        this.init();
    }

    init() {
        // Проверяем наличие элементов
        if (!this.overlay) {
            this.logError('Initial preloader element not found');
        }
        if (!this.spaSpinner) {
            this.logError('SPA mini spinner element not found');
        }
    }

    /**
     * Показывает компактный индикатор в углу (для SPA)
     */
    showProgress(percent) {
        if (this.spaSpinner) {
            this.spaSpinner.classList.add('active');
        }
    }

    /**
     * Скрывает компактный индикатор
     */
    hideProgress() {
        if (this.spaSpinner) {
            this.spaSpinner.classList.remove('active');
        }
    }

    /**
     * Показывает полный оверлей (для начальной загрузки или критических ошибок)
     */
    show(message = null) {
        if (!this.overlay) return;

        if (message) {
            const messageEl = this.overlay.querySelector('.h4');
            if (messageEl) messageEl.textContent = message;
        }
        
        this.overlay.style.display = 'flex';
        setTimeout(() => {
            this.overlay.style.opacity = '1';
            this.overlay.style.visibility = 'visible';
        }, 10);
        
        this.isVisible = true;
        document.body.style.overflow = 'hidden';
    }

    /**
     * Скрывает полный оверлей
     */
    hide() {
        if (!this.overlay) return;

        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
        
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 500);

        this.isVisible = false;
        document.body.style.overflow = '';
    }

    toggle() {
        this.isVisible ? this.hide() : this.show();
    }

    logError(message) {
        console.error(`[Preloader Error] ${message}`);
    }
}

window.Preloader = Preloader;
