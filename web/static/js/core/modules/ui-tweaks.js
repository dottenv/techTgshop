/**
 * UI Tweaks module - various UI improvements and enhancements
 */
class UITweaks {
    constructor() {
        this.config = {
            enableSmoothScroll: true,
            enableAutoHide: true,
            enableAnimations: true,
            enableTooltips: true,
            enableBackToTop: true
        };
        this.init();
    }

    init() {
        this.setupSmoothScroll();
        this.setupAutoHideElements();
        this.setupBackToTop();
        this.setupFormEnhancements();
        this.setupTableEnhancements();
        this.setupButtonLoading();
        this.bindEvents();
    }

    setupSmoothScroll() {
        if (!this.config.enableSmoothScroll) return;

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }

    setupAutoHideElements() {
        if (!this.config.enableAutoHide) return;

        this.setupAutoHideHeader();
        this.setupAutoHideScrollToTop();
    }

    setupAutoHideHeader() {
        if (this._headerScrollBound) return;
        this._headerScrollBound = true;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const header = document.querySelector('header, .navbar, .app-header');
            if (!header) return;

            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    setupAutoHideScrollToTop() {
        if (this.scrollToTopButton) return;

        const button = document.createElement('button');
        button.className = 'btn btn-primary position-fixed bottom-0 end-0 m-3 rounded-circle';
        button.style.cssText = 'width: 50px; height: 50px; display: none; z-index: 1000; opacity: 0.8;';
        button.innerHTML = '<i class="bi bi-arrow-up"></i>';
        button.setAttribute('aria-label', 'Наверх');
        button.setAttribute('data-ui-back-to-top-button', 'true');

        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(button);
        this.scrollToTopButton = button;

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            if (window.scrollY > 300) {
                button.style.display = 'block';
                scrollTimeout = setTimeout(() => {
                    button.style.opacity = '0.8';
                }, 100);
            } else {
                button.style.opacity = '0';
                scrollTimeout = setTimeout(() => {
                    button.style.display = 'none';
                }, 300);
            }
        });
    }

    setupBackToTop() {
        if (!this.config.enableBackToTop) return;

        const backToTopLinks = document.querySelectorAll('[data-ui-back-to-top]');
        backToTopLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    setupFormEnhancements() {
        this.setupFloatingLabels();
        this.setupFormValidation();
        this.setupCharacterCounters();
        this.setupAutoResize();
    }

    setupFloatingLabels() {
        const floatingInputs = document.querySelectorAll('.form-floating input, .form-floating textarea');
        floatingInputs.forEach(input => {
            const updateLabel = () => {
                const label = input.nextElementSibling;
                if (label && label.tagName === 'LABEL') {
                    if (input.value || input === document.activeElement) {
                        label.style.transform = 'scale(0.85) translateY(-0.5rem)';
                    } else {
                        label.style.transform = '';
                    }
                }
            };

            input.addEventListener('focus', updateLabel);
            input.addEventListener('blur', updateLabel);
            input.addEventListener('input', updateLabel);
            updateLabel();
        });
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('[data-ui-validate]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const invalidInputs = form.querySelectorAll(':invalid');
                    if (invalidInputs.length > 0) {
                        invalidInputs[0].focus();
                    }
                }
                
                form.classList.add('was-validated');
            });
        });
    }

    setupCharacterCounters() {
        const textareas = document.querySelectorAll('textarea[data-ui-max-chars]');
        textareas.forEach(textarea => {
            const maxChars = parseInt(textarea.getAttribute('data-ui-max-chars'));
            const counter = document.createElement('div');
            counter.className = 'form-text text-muted';
            counter.textContent = `0 / ${maxChars}`;
            
            textarea.parentNode.appendChild(counter);
            
            const updateCounter = () => {
                const current = textarea.value.length;
                counter.textContent = `${current} / ${maxChars}`;
                
                if (current > maxChars) {
                    counter.classList.add('text-danger');
                    counter.classList.remove('text-muted');
                } else {
                    counter.classList.remove('text-danger');
                    counter.classList.add('text-muted');
                }
            };
            
            textarea.addEventListener('input', updateCounter);
            updateCounter();
        });
    }

    setupAutoResize() {
        const textareas = document.querySelectorAll('textarea[data-ui-auto-resize]');
        textareas.forEach(textarea => {
            const resize = () => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            };
            
            textarea.addEventListener('input', resize);
            resize();
        });
    }

    setupTableEnhancements() {
        this.setupTableSorting();
        this.setupTableSearch();
        this.setupTablePagination();
    }

    setupTableSorting() {
        const sortableTables = document.querySelectorAll('[data-ui-sortable]');
        sortableTables.forEach(table => {
            const headers = table.querySelectorAll('th[data-sort]');
            headers.forEach(header => {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => this.sortTable(table, header));
            });
        });
    }

    sortTable(table, header) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        const isAscending = !header.classList.contains('sort-asc');
        
        rows.sort((a, b) => {
            const aValue = a.children[columnIndex].textContent.trim();
            const bValue = b.children[columnIndex].textContent.trim();
            
            if (!isNaN(aValue) && !isNaN(bValue)) {
                return isAscending ? aValue - bValue : bValue - aValue;
            }
            
            return isAscending ? 
                aValue.localeCompare(bValue) : 
                bValue.localeCompare(aValue);
        });
        
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
        
        table.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
    }

    setupTableSearch() {
        const searchableTables = document.querySelectorAll('[data-ui-search]');
        searchableTables.forEach(table => {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'form-control mb-3';
            searchInput.placeholder = 'Поиск...';
            
            table.parentNode.insertBefore(searchInput, table);
            
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            });
        });
    }

    setupTablePagination() {
        const paginatedTables = document.querySelectorAll('[data-ui-pagination]');
        paginatedTables.forEach(table => {
            const rowsPerPage = parseInt(table.getAttribute('data-ui-pagination')) || 10;
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            if (rows.length <= rowsPerPage) return;
            
            this.createPagination(table, rows, rowsPerPage);
        });
    }

    createPagination(table, rows, rowsPerPage) {
        const tbody = table.querySelector('tbody');
        const totalPages = Math.ceil(rows.length / rowsPerPage);
        let currentPage = 1;
        
        const showPage = (page) => {
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            
            rows.forEach((row, index) => {
                row.style.display = (index >= start && index < end) ? '' : 'none';
            });
            
            currentPage = page;
            this.updatePaginationButtons(paginationContainer, page, totalPages);
        };
        
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'd-flex justify-content-center mt-3';
        
        table.parentNode.appendChild(paginationContainer);
        showPage(1);
    }

    updatePaginationButtons(container, currentPage, totalPages) {
        container.innerHTML = '';
        
        const nav = document.createElement('nav');
        const ul = document.createElement('ul');
        ul.className = 'pagination';
        
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            
            const button = document.createElement('button');
            button.className = 'page-link';
            button.textContent = i;
            button.addEventListener('click', () => showPage(i));
            
            li.appendChild(button);
            ul.appendChild(li);
        }
        
        nav.appendChild(ul);
        container.appendChild(nav);
    }

    setupButtonLoading() {
        const buttons = document.querySelectorAll('[data-btn-loading]');
        buttons.forEach(button => {
            if (!button.getAttribute('data-btn-loading-initialized')) {
                button.setAttribute('data-btn-loading-initialized', 'true');
            }
        });
    }

    bindEvents() {
        if (this._spaBound) return;
        this._spaBound = true;

        document.addEventListener('spa:content-updated', () => {
            this.setupFormEnhancements();
            this.setupTableEnhancements();
            this.setupButtonLoading();
        });
    }

    static setButtonLoading(button) {
        if (!button || button.getAttribute('data-btn-loading-active')) return;

        const spinnerClass = button.getAttribute('data-btn-loading') || 'spinner-border spinner-border-sm me-2';
        const spinner = document.createElement('span');
        spinner.className = spinnerClass;
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-hidden', 'true');
        spinner.setAttribute('data-btn-spinner', 'true');

        button.disabled = true;
        button.setAttribute('data-btn-loading-active', 'true');
        button.insertBefore(spinner, button.firstChild);
    }

    static clearButtonLoading(button) {
        if (!button || !button.getAttribute('data-btn-loading-active')) return;

        const spinner = button.querySelector('[data-btn-spinner]');
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
        button.removeAttribute('data-btn-loading-active');
        button.disabled = false;
    }

    configure(config) {
        this.config = { ...this.config, ...config };
    }
}

window.UITweaks = UITweaks;
