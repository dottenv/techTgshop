/**
 * Prefetch module - intelligent content prefetching
 */
class PrefetchManager {
    constructor(modules) {
        this.modules = modules;
        this.prefetchedPages = new Set();
        this.observer = null;
        this.prefetchQueue = [];
        this.isPrefetching = false;
        this.config = {
            enabled: true,
            threshold: 0.2, // Порог видимости для начала загрузки
            maxPrefetchPages: 20,
            prefetchDelay: 500, // Задержка перед загрузкой при наведении
            hoverDelay: 200
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupHoverPrefetch();
        this.bindEvents();
        this.observeLinks();
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    const href = this.getHref(link);
                    if (href && this.shouldPrefetch(href)) {
                        this.prefetchPage(href);
                    }
                }
            });
        }, {
            threshold: this.config.threshold
        });
    }

    setupHoverPrefetch() {
        let hoverTimer = null;
        
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[data-spa-link]');
            if (!link) return;

            const href = this.getHref(link);
            if (href && this.shouldPrefetch(href)) {
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(() => {
                    this.prefetchPage(href);
                }, this.config.hoverDelay);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('a[data-spa-link]')) {
                clearTimeout(hoverTimer);
            }
        });
    }

    bindEvents() {
        document.addEventListener('spa:content-updated', () => {
            this.observeLinks();
        });
    }

    observeLinks() {
        if (!this.observer) return;

        // Находим все SPA ссылки, которые еще не были префетчены
        const links = document.querySelectorAll('a[data-spa-link]');
        links.forEach(link => {
            const href = this.getHref(link);
            if (href && !this.prefetchedPages.has(href)) {
                this.observer.observe(link);
            }
        });
    }

    getHref(link) {
        return link.getAttribute('href') || link.getAttribute('data-href');
    }

    shouldPrefetch(url) {
        // Не префетчим внешние ссылки, текущую страницу и уже префетченные
        if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('#')) return false;
        if (url === window.location.pathname) return false;
        if (this.prefetchedPages.has(url)) return false;
        if (this.prefetchedPages.size >= this.config.maxPrefetchPages) return false;
        
        return true;
    }

    async prefetchPage(url) {
        if (this.prefetchedPages.has(url)) return;

        const userCache = this.modules.get('user-cache');
        
        // Если уже есть в кэше, помечаем как префетченное
        if (userCache && userCache.has(`page_${url}`)) {
            this.prefetchedPages.add(url);
            return;
        }

        try {
            const response = await fetch(url, {
                headers: { 
                    'X-SPA-Request': 'true',
                    'X-SPA-Prefetch': 'true'
                }
            });

            if (response.ok) {
                const html = await response.text();
                if (userCache) {
                    // Сохраняем в кэш на 5 минут
                    userCache.set(`page_${url}`, html, 300000);
                }
                this.prefetchedPages.add(url);
                this.log(`Prefetched: ${url}`);
            }
        } catch (error) {
            // Ошибки префетча не критичны, просто игнорируем
        }
    }

    log(message) {
        console.log(`[Prefetch] ${message}`);
    }
}

window.PrefetchManager = PrefetchManager;