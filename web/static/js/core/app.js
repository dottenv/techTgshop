/**
 * Main App Orchestrator - главный оркестратор загрузки всех модулей
 */
class App {
    constructor() {
        this.version = '1.0.0';
        this.modules = new Map();
        this.isReady = false;
        this.startTime = Date.now();
        this.config = {
            debug: false,
            enableSPA: true,
            enablePreloader: true,
            enableErrorHandling: true,
            modulesPath: '/static/js/core/modules/'
        };
        this.init();
    }

    async init() {
        try {
            this.setupGlobalErrorHandling();
            this.detectEnvironment();
            this.setupConfiguration();
            
            if (this.config.enablePreloader) {
                this.showInitialPreloader();
            }

            await this.loadCoreModules();
            await this.initializeSystem();
            
            this.finalizeInitialization();
            
        } catch (error) {
            this.handleCriticalError(error);
        }
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            this.logError('Global Error', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.logError('Unhandled Promise Rejection', e.reason);
        });
    }

    detectEnvironment() {
        const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        this.environment = {
            isDevelopment: isDevelopment,
            isProduction: !isDevelopment,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            supportsHistory: !!(window.history && history.pushState),
            supportsFetch: !!window.fetch,
            supportsIntersection: 'IntersectionObserver' in window
        };

        if (this.environment.isDevelopment) {
            this.config.debug = true;
        }
    }

    setupConfiguration() {
        const configScript = document.querySelector('script[data-app-config]');
        if (configScript) {
            try {
                const userConfig = JSON.parse(configScript.textContent);
                this.config = { ...this.config, ...userConfig };
            } catch (e) {
                this.logError('Invalid app configuration', e);
            }
        }
    }

    showInitialPreloader() {
        const preloader = document.getElementById('app-initial-preloader');
        if (preloader) {
            preloader.style.opacity = '1';
            preloader.style.visibility = 'visible';
        }
    }

    async loadCoreModules() {
        const coreModules = [
            { name: 'preloader', path: '/static/js/core/preloader.js', class: 'Preloader' },
            { name: 'router', path: '/static/js/core/router.js', class: 'Router' },
            { name: 'events', path: '/static/js/core/events.js', class: 'EventsManager' },
            { name: 'content', path: '/static/js/core/content.js', class: 'ContentManager' },
            { name: 'user-cache', path: '/static/js/core/modules/user-cache.js', class: 'UserCache' },
            { name: 'prefetch', path: '/static/js/core/modules/prefetch.js', class: 'PrefetchManager' },
            { name: 'spa', path: '/static/js/core/spa.js', class: 'SPAManager' }
        ];

        for (const module of coreModules) {
            try {
                await this.loadModuleScript(module.name, module.path);
                if (window[module.class]) {
                    const instance = new window[module.class](this.modules);
                    this.modules.set(module.name, instance);
                    this.log(`Initialized core module: ${module.name}`);
                }
            } catch (error) {
                this.logError(`Failed to load core module: ${module.name}`, error);
                throw error;
            }
        }
    }

    async loadModuleScript(name, path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = path;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${path}`));
            document.head.appendChild(script);
        });
    }

    async initializeSystem() {
        this.initializeUtilityFunctions();
        
        // Дополнительные модули UI
        const uiModules = [
            { name: 'ui-tweaks', path: '/static/js/core/modules/ui-tweaks.js' }
        ];

        for (const module of uiModules) {
            this.loadModuleScript(module.name, module.path).then(() => {
                if (module.name === 'ui-tweaks' && window.UITweaks && !this.uiTweaks) {
                    this.uiTweaks = new window.UITweaks();
                }
            }).catch(err => {
                this.logError(`Failed to load UI module: ${module.name}`, err);
            });
        }
    }

    initializeUtilityFunctions() {
        window.app = this;
        
        window.appNavigate = (url) => {
            const spa = this.modules.get('spa');
            if (spa) {
                spa.navigate(url);
            } else {
                window.location.href = url;
            }
        };

        window.appReload = () => {
            const spa = this.modules.get('spa');
            if (spa) {
                spa.navigate(window.location.pathname);
            } else {
                location.reload();
            }
        };

        window.appShowError = (message, title = 'Ошибка') => {
            this.showUserError(message, title);
        };
    }

    finalizeInitialization() {
        this.isReady = true;
        const loadTime = Date.now() - this.startTime;
        
        this.hideInitialPreloader();
        this.log(`App initialized in ${loadTime}ms`);
        
        document.dispatchEvent(new CustomEvent('app:ready', { 
            detail: { loadTime, version: this.version } 
        }));
    }

    hideInitialPreloader() {
        const preloader = document.getElementById('app-initial-preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => preloader.remove(), 500);
        }
    }

    showUserError(message, title = 'Ошибка') {
        alert(`${title}: ${message}`);
    }

    handleCriticalError(error) {
        console.error('Critical initialization error:', error);
        document.body.innerHTML = `
            <div class="d-flex align-items-center justify-content-center vh-100">
                <div class="text-center">
                    <div class="text-danger mb-3">
                        <i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i>
                    </div>
                    <h3>Критическая ошибка</h3>
                    <p class="text-muted">Не удалось инициализировать приложение</p>
                    <button class="btn btn-primary" onclick="location.reload()">Обновить страницу</button>
                </div>
            </div>
        `;
    }

    log(message) {
        if (this.config.debug) {
            console.log(`[App] ${message}`);
        }
    }

    logError(message, error) {
        console.error(`[App Error] ${message}`, error);
    }
}

// Автоматический запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new App();
});
