/**
 * Content module - manages content block updates
 */
class ContentManager {
    constructor() {
        this.contentSelectors = ['[data-spa-content]', '.page-content', 'main', '#content'];
        this.preserveSelectors = ['[data-spa-preserve]', '.navbar', '.sidebar', 'header', 'footer'];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('spa:navigate-success', (e) => {
            this.updateContent(e.detail.html);
        });

        document.addEventListener('spa:content-update', (e) => {
            this.updateContent(e.detail.html, e.detail.target);
        });
    }

    async updateContent(html, targetSelector = null) {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        if (targetSelector) {
            this.updateSpecificTarget(targetSelector, newDoc);
        } else {
            this.updateMainContent(newDoc);
        }

        this.updateTitle(newDoc);
        this.updateMeta(newDoc);
        this.updateStyles(newDoc);
        await this.updateScripts(newDoc);
        this.closeSidebarOnMobile();
        
        const event = new CustomEvent('spa:content-updated', { 
            detail: { html, target: targetSelector } 
        });
        document.dispatchEvent(event);
    }

    async updateScripts(newDoc) {
        const newScripts = newDoc.querySelectorAll('script[src]');
        const currentScripts = document.querySelectorAll('script[src]');
        const promises = [];
        
        newScripts.forEach(newScript => {
            const src = newScript.getAttribute('src');
            const existing = Array.from(currentScripts).find(s => s.getAttribute('src') === src);
            
            if (!existing) {
                const promise = new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                promises.push(promise);
            }
        });

        return Promise.all(promises);
    }

    closeSidebarOnMobile() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth < 1200) {
            sidebar.classList.remove('active');
        }
    }

    updateSpecificTarget(selector, newDoc) {
        const target = document.querySelector(selector);
        const newContent = newDoc.querySelector(selector);
        
        if (target && newContent) {
            this.preserveElements(target);
            target.innerHTML = newContent.innerHTML;
            this.restorePreservedElements(target);
        }
    }

    async updateMainContent(newDoc) {
        for (const selector of this.contentSelectors) {
            const currentContent = document.querySelector(selector);
            const newContent = newDoc.querySelector(selector);
            
            if (currentContent && newContent) {
                // Плавный переход
                currentContent.style.opacity = '0';
                currentContent.style.transition = 'opacity 0.2s ease';
                
                await new Promise(resolve => setTimeout(resolve, 200));
                
                this.preserveElements(currentContent);
                currentContent.innerHTML = newContent.innerHTML;
                this.restorePreservedElements(currentContent);
                
                currentContent.style.opacity = '1';
                break;
            }
        }
    }

    preserveElements(container) {
        this.preservedElements = new Map();
        
        this.preserveSelectors.forEach(selector => {
            const elements = container.querySelectorAll(selector);
            elements.forEach(el => {
                const id = el.id || `preserve-${Date.now()}-${Math.random()}`;
                el.setAttribute('data-spa-preserve-id', id);
                this.preservedElements.set(id, el.cloneNode(true));
            });
        });
    }

    restorePreservedElements(container) {
        if (!this.preservedElements) return;
        
        this.preservedElements.forEach((originalEl, id) => {
            const targetEl = container.querySelector(`[data-spa-preserve-id="${id}"]`);
            if (targetEl && targetEl.parentNode) {
                targetEl.parentNode.replaceChild(originalEl.cloneNode(true), targetEl);
            }
        });
        
        this.preservedElements.clear();
    }

    updateTitle(newDoc) {
        const newTitle = newDoc.querySelector('title');
        if (newTitle) {
            document.title = newTitle.textContent;
        }
    }

    updateMeta(newDoc) {
        const metaSelectors = ['meta[name="description"]', 'meta[name="keywords"]', 'meta[property^="og:"]'];
        
        metaSelectors.forEach(selector => {
            const currentMeta = document.querySelector(selector);
            const newMeta = newDoc.querySelector(selector);
            
            if (currentMeta && newMeta) {
                Object.keys(newMeta.attributes).forEach(key => {
                    const attr = newMeta.attributes[key];
                    currentMeta.setAttribute(attr.name, attr.value);
                });
            }
        });
    }

    updateStyles(newDoc) {
        const newStyles = newDoc.querySelectorAll('link[rel="stylesheet"]');
        const currentStyles = document.querySelectorAll('link[rel="stylesheet"]');
        
        newStyles.forEach(newStyle => {
            const href = newStyle.getAttribute('href');
            const existing = Array.from(currentStyles).find(s => s.getAttribute('href') === href);
            
            if (!existing) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        });
    }

    updatePartial(html, selector) {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        const newContent = newDoc.querySelector(selector);
        
        if (!newContent) {
            return false;
        }

        const target = document.querySelector(selector);
        if (!target) {
            return false;
        }

        target.innerHTML = newContent.innerHTML;
        
        const event = new CustomEvent('spa:content-partial-updated', { 
            detail: { selector, html: newContent.innerHTML } 
        });
        document.dispatchEvent(event);

        return true;
    }

    scrollToTop() {
        const contentEl = document.querySelector(this.contentSelectors[0]);
        if (contentEl) {
            contentEl.scrollTop = 0;
        } else {
            window.scrollTo(0, 0);
        }
    }

    addContentSelector(selector) {
        if (!this.contentSelectors.includes(selector)) {
            this.contentSelectors.push(selector);
        }
    }

    addPreserveSelector(selector) {
        if (!this.preserveSelectors.includes(selector)) {
            this.preserveSelectors.push(selector);
        }
    }
}

window.ContentManager = ContentManager;
