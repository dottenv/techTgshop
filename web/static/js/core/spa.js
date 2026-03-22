/**
 * SPA Core - main SPA system with data attributes
 */
class SPAManager {
    constructor(modules) {
        this.modules = modules;
        this.cache = new Map();
        this.abortController = null;
        this.isNavigating = false;
        this.config = {
            enableHistory: true,
            enableCache: true,
            cacheTimeout: 300000,
            showErrorModal: true
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConfig();
    }

    loadConfig() {
        const configEl = document.querySelector('script[data-spa-config]');
        if (configEl) {
            try {
                const config = JSON.parse(configEl.textContent);
                this.config = { ...this.config, ...config };
            } catch (e) {
                console.error('Failed to parse SPA config:', e);
            }
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-spa-link]');
            if (link) {
                e.preventDefault();
                const url = link.getAttribute('href') || link.getAttribute('data-href');
                if (url) this.navigate(url);
                return;
            }

            const clearBtn = e.target.closest('[data-spa-clear]');
            if (clearBtn) {
                const form = clearBtn.closest('form[data-spa-form]');
                if (form) {
                    e.preventDefault();
                    this.clearSearchForm(form);
                }
            }
        });

        document.addEventListener('submit', (e) => {
            const form = e.target.closest('[data-spa-form]');
            if (form) {
                e.preventDefault();
                this.handleFormSubmit(form, e);
            }
        });

        document.addEventListener('input', (e) => {
            const field = e.target;
            const form = field.closest('form[data-spa-form][data-spa-live-search="true"]');
            if (form && field.name) {
                if (this.searchTimer) {
                    clearTimeout(this.searchTimer);
                }
                this.searchTimer = setTimeout(() => {
                    this.handleSearchForm(form);
                }, 300);
            }
        });

        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname, 'GET', false);
        });
    }

    async navigate(url, method = 'GET', updateHistory = true) {
        // Отменяем предыдущий запрос, если он еще идет
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();

        const preloader = this.modules.get('preloader');
        const userCache = this.modules.get('user-cache');
        
        if (preloader) preloader.showProgress(10);
        this.isNavigating = true;

        // Проверка кэша (только для GET)
        if (method === 'GET' && this.config.enableCache) {
            const cachedHtml = userCache ? userCache.get(`page_${url}`) : this.cache.get(url)?.html;
            if (cachedHtml) {
                if (preloader) preloader.showProgress(100);
                await this.handleNavigationSuccess(cachedHtml, url, updateHistory);
                this.isNavigating = false;
                if (preloader) preloader.hideProgress();
                return;
            }
        }

        try {
            const options = {
                method,
                headers: { 
                    'X-SPA-Request': 'true',
                    'Accept': 'text/html'
                },
                signal: this.abortController.signal
            };

            if (preloader) preloader.showProgress(40);

            const response = await fetch(url, options);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            if (preloader) preloader.showProgress(80);
            
            const html = await response.text();

            // Сохраняем в кэш
            if (method === 'GET' && this.config.enableCache) {
                if (userCache) {
                    userCache.set(`page_${url}`, html, this.config.cacheTimeout);
                } else {
                    this.cache.set(url, { html, timestamp: Date.now() });
                }
            }

            if (preloader) preloader.showProgress(100);
            await this.handleNavigationSuccess(html, url, updateHistory);
        } catch (error) {
            if (error.name === 'AbortError') {
                this.log('Navigation aborted');
                return;
            }
            this.handleNavigationError(error, url);
        } finally {
            this.isNavigating = false;
            this.abortController = null;
            if (preloader) preloader.hideProgress();
        }
    }

    async handleNavigationSuccess(html, url, updateHistory) {
        if (updateHistory && this.config.enableHistory) {
            history.pushState({ spa: true }, '', url);
        }

        const contentManager = this.modules.get('content');
        if (contentManager) {
            await contentManager.updateContent(html);
        }

        this.updateActiveLinks();
        
        const event = new CustomEvent('spa:navigate-success', { 
            detail: { html, url } 
        });
        document.dispatchEvent(event);
    }

    handleNavigationError(error, url) {
        console.error(`Navigation failed for ${url}:`, error);
        
        if (this.config.showErrorModal) {
            const app = window.app;
            if (app && typeof app.showError === 'function') {
                app.showError('Ошибка навигации', `Не удалось загрузить страницу: ${url}`);
            }
        }
        
        const event = new CustomEvent('spa:navigate-error', { 
            detail: { error, url } 
        });
        document.dispatchEvent(event);
    }

    async handleFormSubmit(form, event) {
        const rawMethod = form.getAttribute('method') || 'POST';
        const method = rawMethod.toUpperCase();
        const submitter = event && event.submitter instanceof HTMLElement ? event.submitter : null;

        if (method === 'GET') {
            try {
                if (submitter && submitter.hasAttribute('data-btn-loading') && window.UITweaks) {
                    window.UITweaks.setButtonLoading(submitter);
                }
                await this.handleSearchForm(form);
            } finally {
                if (submitter && submitter.hasAttribute('data-btn-loading') && window.UITweaks) {
                    window.UITweaks.clearButtonLoading(submitter);
                }
            }
            return;
        }

        const url = form.getAttribute('action') || window.location.pathname;
        const formData = new FormData(form);
        const target = form.getAttribute('data-spa-target');

        const preloader = this.modules.get('preloader');
        if (preloader) preloader.showProgress(10);

        if (submitter && submitter.hasAttribute('data-btn-loading') && window.UITweaks) {
            window.UITweaks.setButtonLoading(submitter);
        }

        try {
            const response = await fetch(url, {
                method,
                body: formData,
                headers: { 'X-SPA-Request': 'true' }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();

            const contentManager = this.modules.get('content');

            if (target && contentManager) {
                const updated = contentManager.updatePartial(html, target);
                if (!updated) {
                    await this.handleNavigationSuccess(html, url, true);
                }
            } else {
                await this.handleNavigationSuccess(html, url, true);
            }
        } catch (error) {
            this.handleNavigationError(error, url);
        } finally {
            if (preloader) preloader.hideProgress();
            if (submitter && submitter.hasAttribute('data-btn-loading') && window.UITweaks) {
                window.UITweaks.clearButtonLoading(submitter);
            }
        }
    }

    async handleSearchForm(form, clear = false) {
        const baseUrl = form.getAttribute('action') || window.location.pathname;
        let url = baseUrl;

        if (!clear) {
            const formData = new FormData(form);
            const params = new URLSearchParams();

            for (const [key, value] of formData.entries()) {
                if (value !== null && String(value).trim() !== '') {
                    params.append(key, value);
                }
            }

            const query = params.toString();
            url = query ? `${baseUrl}?${query}` : baseUrl;
        }

        const target = form.getAttribute('data-spa-target');
        const preloader = this.modules.get('preloader');
        const contentManager = this.modules.get('content');

        if (preloader) preloader.showProgress(10);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-SPA-Request': 'true',
                    'Accept': 'text/html'
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const html = await response.text();

            if (target && contentManager) {
                const updated = contentManager.updatePartial(html, target);
                if (!updated) {
                    await this.handleNavigationSuccess(html, url, false);
                }
            } else {
                await this.handleNavigationSuccess(html, url, false);
            }

            if (this.config.enableHistory) {
                history.replaceState({ spa: true }, '', url);
            }
        } catch (error) {
            this.handleNavigationError(error, url);
        } finally {
            if (preloader) preloader.hideProgress();
        }
    }

    clearSearchForm(form) {
        const elements = form.querySelectorAll('input, select, textarea');
        elements.forEach((el) => {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = false;
            } else if (el.tagName === 'SELECT') {
                el.value = '';
            } else if (el.name) {
                el.value = '';
            }
        });

        this.handleSearchForm(form, true);
    }

    updateActiveLinks() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('[data-spa-link]').forEach(link => {
            const href = link.getAttribute('href') || link.getAttribute('data-href');
            const sidebarItem = link.closest('.sidebar-item');
            
            if (href === currentPath) {
                link.classList.add('active');
                if (sidebarItem) sidebarItem.classList.add('active');
            } else {
                link.classList.remove('active');
                if (sidebarItem) sidebarItem.classList.remove('active');
            }
        });
    }

    log(message) {
        if (this.config.debug) {
            console.log(`[SPA] ${message}`);
        }
    }
}

window.SPAManager = SPAManager;
