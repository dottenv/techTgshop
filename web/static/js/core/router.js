/**
 * Router module - manages SPA navigation
 */
class Router {
    constructor() {
        this.routes = new Map();
        this.currentPath = window.location.pathname;
        this.basePath = '';
        this.init();
    }

    init() {
        this.setupBasePath();
        this.bindEvents();
        this.captureCurrentLinks();
    }

    setupBasePath() {
        const metaBase = document.querySelector('meta[name="spa-base"]');
        this.basePath = metaBase ? metaBase.getAttribute('content') : '';
    }

    bindEvents() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.spa) {
                this.navigate(window.location.pathname, false);
            }
        });
    }

    captureCurrentLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-spa-link]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href') || link.getAttribute('data-href');
                if (href) {
                    this.navigate(href);
                }
            }
        });
    }

    async navigate(path, pushState = true) {
        if (path === this.currentPath && pushState) return;

        const event = new CustomEvent('spa:navigate-start', { 
            detail: { from: this.currentPath, to: path } 
        });
        document.dispatchEvent(event);

        try {
            const response = await fetch(path, {
                headers: { 'X-SPA-Request': 'true' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const html = await response.text();
            
            if (pushState) {
                history.pushState({ spa: true }, '', path);
            }

            this.currentPath = path;
            
            const successEvent = new CustomEvent('spa:navigate-success', { 
                detail: { html, path } 
            });
            document.dispatchEvent(successEvent);

        } catch (error) {
            const errorEvent = new CustomEvent('spa:navigate-error', { 
                detail: { error, path } 
            });
            document.dispatchEvent(errorEvent);
        } finally {
            const endEvent = new CustomEvent('spa:navigate-end', { 
                detail: { path: this.currentPath } 
            });
            document.dispatchEvent(endEvent);
        }
    }

    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    getRoute(path) {
        return this.routes.get(path);
    }

    getCurrentPath() {
        return this.currentPath;
    }
}

window.Router = Router;
