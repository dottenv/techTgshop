/**
 * Events module - automatic event re-binding for dynamic content
 */
class EventsManager {
    constructor() {
        this.globalHandlers = new Map();
        this.delegatedEvents = new Map();
        this.init();
    }

    init() {
        this.setupDelegation();
        this.bindSPAEvents();
    }

    setupDelegation() {
        const eventTypes = ['click', 'change', 'submit', 'focus', 'blur', 'input', 'keydown', 'keyup'];
        
        eventTypes.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                this.handleDelegatedEvent(eventType, e);
            }, true);
        });
    }

    handleDelegatedEvent(eventType, event) {
        const target = event.target;
        const handlers = this.delegatedEvents.get(eventType);
        
        if (!handlers) return;

        handlers.forEach(({ selector, handler }) => {
            const matched = target.closest(selector);
            if (matched) {
                handler.call(matched, event);
            }
        });
    }

    bindSPAEvents() {
        document.addEventListener('spa:content-updated', () => {
            this.rebindEvents();
        });

        document.addEventListener('spa:navigate-success', (e) => {
            this.rebindEvents();
        });
    }

    addGlobalHandler(eventType, selector, handler) {
        if (!this.globalHandlers.has(eventType)) {
            this.globalHandlers.set(eventType, new Map());
        }
        
        this.globalHandlers.get(eventType).set(selector, handler);
        this.delegatedEvents.set(eventType, this.globalHandlers.get(eventType));
    }

    rebindEvents() {
        this.globalHandlers.forEach((handlers, eventType) => {
            handlers.forEach((handler, selector) => {
                this.bindExistingElements(eventType, selector, handler);
            });
        });

        this.initializeComponents();
        this.initializePlugins();
    }

    bindExistingElements(eventType, selector, handler) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (!element.hasAttribute('data-spa-bound')) {
                element.addEventListener(eventType, handler.bind(element));
                element.setAttribute('data-spa-bound', 'true');
            }
        });
    }

    initializeComponents() {
        this.initializeBootstrapComponents();
        this.initializeCustomComponents();
    }

    initializeBootstrapComponents() {
        if (window.bootstrap) {
            const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltips.forEach(el => {
                if (!el.getAttribute('data-bs-original-title')) {
                    new bootstrap.Tooltip(el);
                }
            });

            const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
            popovers.forEach(el => {
                if (!el.getAttribute('data-bs-original-title')) {
                    new bootstrap.Popover(el);
                }
            });

            const modals = document.querySelectorAll('.modal:not([data-spa-initialized])');
            modals.forEach(el => {
                el.setAttribute('data-spa-initialized', 'true');
                new bootstrap.Modal(el);
            });
        }
    }

    initializeCustomComponents() {
        const dataComponents = document.querySelectorAll('[data-spa-component]');
        dataComponents.forEach(el => {
            const componentName = el.getAttribute('data-spa-component');
            if (window[componentName] && typeof window[componentName].init === 'function') {
                if (!el.hasAttribute('data-spa-component-initialized')) {
                    window[componentName].init(el);
                    el.setAttribute('data-spa-component-initialized', 'true');
                }
            }
        });
    }

    initializePlugins() {
        const scripts = document.querySelectorAll('[data-spa-script]');
        scripts.forEach(script => {
            if (!script.hasAttribute('data-spa-executed')) {
                try {
                    eval(script.textContent);
                    script.setAttribute('data-spa-executed', 'true');
                } catch (error) {
                    console.error('Error executing SPA script:', error);
                }
            }
        });
    }

    registerComponent(name, initFunction) {
        window[name] = { init: initFunction };
    }

    cleanup() {
        this.globalHandlers.clear();
        this.delegatedEvents.clear();
    }
}

window.EventsManager = EventsManager;
