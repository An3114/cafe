// ========================================
// APP PRINCIPAL - Mi Barista Imusa
// ========================================

(function() {
    'use strict';

    // ========================================
    // ESTADO DE LA APLICACIÓN
    // ========================================
    const AppState = {
        currentSection: 'home',
        theme: 'light',
        favorites: JSON.parse(localStorage.getItem('imusaFavorites')) || [],
        history: JSON.parse(localStorage.getItem('imusaHistory')) || [],
        currentRecipe: null,
        timer: {
            seconds: 0,
            interval: null,
            running: false,
            currentPreset: 0
        },
        calculator: {
            water: 250,
            strength: 'normal'
        }
    };

    // ========================================
    // DOM REFERENCIAS
    // ========================================
    const DOM = {
        sections: {},
        navItems: {},
        modals: {},
        // ... se llenan en init
    };

    // ========================================
    // UTILIDADES
    // ========================================
    const Utils = {
        // Debounce para búsquedas
        debounce: (fn, delay = 300) => {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn(...args), delay);
            };
        },

        // Guardar en localStorage
        saveToStorage: (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.warn('Storage save error:', e);
            }
        },

        // Cargar de localStorage
        loadFromStorage: (key, defaultValue) => {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },

        // Formatear tiempo
        formatTime: (seconds) => {
            const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
            const secs = String(seconds % 60).padStart(2, '0');
            return { mins, secs };
        },

        // Obtener receta por ID
        getRecipeById: (id) => {
            return RECIPES.find(r => r.id === id) || null;
        },

        // Obtener recetas populares (top 6)
        getPopularRecipes: () => {
            // Simulamos popularidad con las primeras 6 recetas
            return RECIPES.slice(0, 6);
        },

        // Filtrar recetas
        filterRecipes: (query, category = 'all', filter = 'all') => {
            let results = RECIPES;

            // Búsqueda por texto
            if (query && query.trim()) {
                const q = query.toLowerCase().trim();
                results = results.filter(r => 
                    r.name.toLowerCase().includes(q) ||
                    r.ingredients.some(i => i.toLowerCase().includes(q)) ||
                    r.tags.some(t => t.toLowerCase().includes(q))
                );
            }

            // Categoría
            if (category !== 'all') {
                results = results.filter(r => r.category === category);
            }

            // Filtros
            if (filter !== 'all') {
                results = results.filter(r => r.tags.includes(filter));
            }

            return results;
        },

        // Calcular café para la Imusa
        calculateCoffee: (water, strength) => {
            const ratios = {
                suave: 0.0075,    // 7.5g por 1000ml
                normal: 0.009,    // 9g por 1000ml
                fuerte: 0.012     // 12g por 1000ml
            };

            const ratio = ratios[strength] || ratios.normal;
            const grams = Math.round(water * ratio * 100) / 100;
            // 1 cuchara Imusa ≈ 6g
            const spoons = grams / 6;
            
            // Redondear a fracciones de cuchara (1/4, 1/2, 3/4, 1, etc.)
            const roundedSpoons = Math.round(spoons * 4) / 4;
            
            // Formatear fracciones para mostrar
            const spoonStr = formatSpoon(roundedSpoons);

            return {
                grams: Math.round(grams * 10) / 10,
                spoons: roundedSpoons,
                spoonDisplay: spoonStr,
                caffeine: Math.round(grams * 8), // 8mg por gramo aprox
                brewTime: Math.round(water / 100) + 2 // minutos estimados
            };
        },

        // Calcular café instantáneo
        calculateInstantCoffee: (water, brand) => {
            // 1 cucharadita por cada 100ml (base)
            const base = water / 100;
            // Ajustes por marca
            const adjustments = {
                nescafe: 0.9,
                colcafe: 1.0,
                juanvaldez: 0.8,
                buendia: 1.1
            };
            const adj = adjustments[brand] || 1.0;
            const spoons = base * adj;
            const rounded = Math.round(spoons * 2) / 2;
            return {
                teaspoons: rounded,
                display: formatSpoon(rounded)
            };
        },

        // Calcular azúcar
        calculateSugar: (water, sweetness) => {
            const levels = {
                none: 0,
                little: water * 0.004,
                medium: water * 0.008,
                much: water * 0.012
            };
            const tsp = levels[sweetness] || 0;
            return Math.round(tsp * 4) / 4;
        },

        // Calcular leche
        calculateMilk: (water, type) => {
            const ratios = {
                classic: 1,
                latte: 1.5,
                cappuccino: 1,
                flatwhite: 1.2,
                cortado: 0.5,
                mocha: 1.5
            };
            return Math.round(water * (ratios[type] || 1));
        },

        // Conversor de medidas
        convert: (value, from, to) => {
            // Primero convertir a ml
            let ml = value;
            const conversions = {
                ml: 1,
                g: 1, // asumimos 1g ≈ 1ml para café
                tbsp: 14.79,
                tsp: 4.93,
                oz: 29.57,
                cup: 236.59
            };
            
            if (from !== 'ml') {
                ml = value * conversions[from];
            }
            
            // Convertir de ml a la unidad destino
            if (to === 'ml') return ml;
            return ml / conversions[to];
        }
    };

    // ========================================
    // FORMATO DE FRACCIONES PARA CUCHARAS
    // ========================================
    function formatSpoon(value) {
        const whole = Math.floor(value);
        const frac = value - whole;
        
        if (frac === 0) return `${whole}`;
        if (frac === 0.25) return whole > 0 ? `${whole}¼` : '¼';
        if (frac === 0.5) return whole > 0 ? `${whole}½` : '½';
        if (frac === 0.75) return whole > 0 ? `${whole}¾` : '¾';
        if (frac === 0.125) return whole > 0 ? `${whole}⅛` : '⅛';
        if (frac === 0.375) return whole > 0 ? `${whole}⅜` : '⅜';
        if (frac === 0.625) return whole > 0 ? `${whole}⅝` : '⅝';
        if (frac === 0.875) return whole > 0 ? `${whole}⅞` : '⅞';
        
        // Si no es una fracción común, redondear a 2 decimales
        return (whole + frac).toFixed(2);
    }

    // ========================================
    // RENDERIZADO DE VISTAS
    // ========================================
    const Renderer = {
        // Renderizar recetas populares en el home
        renderPopularRecipes: () => {
            const container = document.getElementById('popularRecipes');
            if (!container) return;
            
            const popular = Utils.getPopularRecipes();
            container.innerHTML = popular.map(recipe => `
                <div class="recipe-card" onclick="App.openRecipe('${recipe.id}')" role="button" tabindex="0" aria-label="Ver ${recipe.name}">
                    <div class="recipe-card-image">${recipe.image || '☕'}</div>
                    <div class="recipe-card-content">
                        <h4>${recipe.name}</h4>
                        <p>${recipe.time} • ${recipe.difficulty}</p>
                    </div>
                    <button class="favorite-btn ${AppState.favorites.includes(recipe.id) ? 'active' : ''}" 
                            onclick="event.stopPropagation(); App.toggleFavorite('${recipe.id}')" 
                            aria-label="${AppState.favorites.includes(recipe.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                        ♥
                    </button>
                </div>
            `).join('');
        },

        // Renderizar recetas recientes
        renderRecentRecipes: () => {
            const container = document.getElementById('recentRecipes');
            if (!container) return;
            
            const recent = AppState.history.slice(0, 4).map(id => Utils.getRecipeById(id)).filter(Boolean);
            if (recent.length === 0) {
                container.innerHTML = '<p class="text-muted" style="padding: 12px;">No has visto recetas recientemente</p>';
                return;
            }
            
            container.innerHTML = recent.map(recipe => `
                <div class="recipe-card" onclick="App.openRecipe('${recipe.id}')" role="button" tabindex="0">
                    <div class="recipe-card-image">${recipe.image || '☕'}</div>
                    <div class="recipe-card-content">
                        <h4>${recipe.name}</h4>
                        <p>${recipe.time} • ${recipe.difficulty}</p>
                    </div>
                </div>
            `).join('');
        },

        // Renderizar marcas
        renderBrands: () => {
            const container = document.getElementById('brandsList');
            if (!container) return;
            
            container.innerHTML = BRANDS.slice(0, 8).map(brand => `
                <div class="brand-chip" role="button" tabindex="0" onclick="App.showBrand('${brand.id}')">
                    <span class="brand-name">${brand.name}</span>
                    <span class="brand-intensity">${brand.intensity}</span>
                </div>
            `).join('');
        },

        // Renderizar recetas (grid)
        renderRecipes: (recipes) => {
            const container = document.getElementById('recipeGrid');
            if (!container) return;
            
            if (recipes.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span style="font-size: 3rem;">🔍</span>
                        <p>No se encontraron recetas</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = recipes.map(recipe => `
                <div class="recipe-card" onclick="App.openRecipe('${recipe.id}')" role="button" tabindex="0">
                    <div class="recipe-card-image">${recipe.image || '☕'}</div>
                    <div class="recipe-card-content">
                        <h4>${recipe.name}</h4>
                        <p>${recipe.time} • ${recipe.difficulty}</p>
                    </div>
                    <button class="favorite-btn ${AppState.favorites.includes(recipe.id) ? 'active' : ''}" 
                            onclick="event.stopPropagation(); App.toggleFavorite('${recipe.id}')" 
                            aria-label="${AppState.favorites.includes(recipe.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                        ♥
                    </button>
                </div>
            `).join('');
        },

        // Mostrar detalle de receta en modal
        showRecipeDetail: (recipe) => {
            const modal = document.getElementById('recipeModal');
            const detail = document.getElementById('recipeDetail');
            
            if (!modal || !detail || !recipe) return;
            
            const isFavorite = AppState.favorites.includes(recipe.id);
            
            detail.innerHTML = `
                <div class="recipe-detail">
                    <div class="recipe-detail-header">
                        <span class="recipe-detail-icon">${recipe.image || '☕'}</span>
                        <h2>${recipe.name}</h2>
                        <div class="recipe-meta">
                            <span>⏱ ${recipe.time}</span>
                            <span>📊 ${recipe.difficulty}</span>
                            <span>🍽 ${recipe.servings || '1 taza'}</span>
                        </div>
                    </div>
                    
                    <div class="recipe-detail-section">
                        <h3>📋 Ingredientes</h3>
                        <ul>
                            ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="recipe-detail-section">
                        <h3>👨‍🍳 Preparación</h3>
                        <ol>
                            ${recipe.steps.map(s => `<li>${s}</li>`).join('')}
                        </ol>
                    </div>
                    
                    ${recipe.tips ? `
                    <div class="recipe-detail-section">
                        <h3>💡 Consejo del Barista</h3>
                        <p>${recipe.tips}</p>
                    </div>
                    ` : ''}
                    
                    ${recipe.variants ? `
                    <div class="recipe-detail-section">
                        <h3>🔄 Variantes</h3>
                        <p>${recipe.variants}</p>
                    </div>
                    ` : ''}
                    
                    <div class="recipe-actions">
                        <button class="btn-primary" onclick="App.toggleFavorite('${recipe.id}')">
                            ${isFavorite ? '❤️ Quitar de favoritos' : '🤍 Agregar a favoritos'}
                        </button>
                        <button class="btn-secondary" onclick="window.print()">🖨️ Imprimir</button>
                        <button class="btn-secondary" onclick="App.shareRecipe('${recipe.id}')">📤 Compartir</button>
                    </div>
                </div>
            `;
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Agregar al historial
            App.addToHistory(recipe.id);
        },

        // Actualizar calculadora
        updateCalculator: () => {
            const water = AppState.calculator.water;
            const strength = AppState.calculator.strength;
            
            const result = Utils.calculateCoffee(water, strength);
            const sugar = Utils.calculateSugar(water, 'medium');
            
            document.getElementById('coffeeSpoons').textContent = result.spoonDisplay + ' cucharas';
            document.getElementById('coffeeGrams').textContent = result.grams + ' g';
            document.getElementById('caffeineAmount').textContent = `~${result.caffeine} mg`;
            document.getElementById('sugarAmount').textContent = sugar > 0 ? `${sugar} cucharadita${sugar > 1 ? 's' : ''}` : 'Sin azúcar';
            document.getElementById('brewTime').textContent = `~${result.brewTime} min`;
            document.getElementById('waterDisplay').textContent = `${water} ml`;
        },

        // Actualizar calculadora instantánea
        updateInstantCalculator: () => {
            const water = parseInt(document.getElementById('instantWater').value) || 200;
            const brand = document.getElementById('instantBrand').value || 'nescafe';
            
            const result = Utils.calculateInstantCoffee(water, brand);
            document.getElementById('instantResult').textContent = `${result.display} cucharaditas`;
            document.getElementById('instantWaterDisplay').textContent = `${water} ml`;
        },

        // Actualizar temporizador
        updateTimer: () => {
            const { mins, secs } = Utils.formatTime(AppState.timer.seconds);
            document.getElementById('timerMinutes').textContent = mins;
            document.getElementById('timerSeconds').textContent = secs;
        },

        // Renderizar guías
        renderGuides: () => {
            const container = document.getElementById('guidesGrid');
            if (!container) return;
            
            container.innerHTML = GUIDES.map(guide => `
                <div class="guide-card" onclick="App.openGuide('${guide.id}')" role="button" tabindex="0">
                    <h3>${guide.icon} ${guide.title}</h3>
                    <p>${guide.content.substring(0, 80)}${guide.content.length > 80 ? '...' : ''}</p>
                </div>
            `).join('');
        },

        // Renderizar conversor
        updateConverter: () => {
            // Los selectores ya están en el HTML
        },

        // Renderizar todo
        renderAll: () => {
            Renderer.renderPopularRecipes();
            Renderer.renderRecentRecipes();
            Renderer.renderBrands();
            Renderer.renderGuides();
            Renderer.updateCalculator();
            Renderer.updateInstantCalculator();
            Renderer.updateTimer();
            
            // Renderizar recetas iniciales
            const allRecipes = Utils.filterRecipes('', 'all', 'all');
            Renderer.renderRecipes(allRecipes);
        }
    };

    // ========================================
    // CONTROLADOR DE LA APLICACIÓN
    // ========================================
    const App = {
        // Inicializar app
        init: function() {
            // DOM references
            DOM.sections = {
                home: document.getElementById('home'),
                calculator: document.getElementById('calculator'),
                recipes: document.getElementById('recipes'),
                timer: document.getElementById('timer'),
                guides: document.getElementById('guides'),
                converter: document.getElementById('converter')
            };
            
            DOM.navItems = document.querySelectorAll('.nav-item');
            
            // Configurar tema
            this.loadTheme();
            
            // Event listeners
            this.bindEvents();
            
            // Renderizar todo
            Renderer.renderAll();
            
            // Registrar service worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                    .catch(() => console.log('SW registration failed'));
            }
            
            // Inicializar timer display
            Renderer.updateTimer();
            
            console.log('☕ Mi Barista Imusa iniciado correctamente');
            console.log(`📚 ${RECIPES.length} recetas cargadas`);
            console.log(`🏷️ ${BRANDS.length} marcas disponibles`);
            console.log(`📖 ${GUIDES.length} guías de preparación`);
        },

        // ========================================
        // EVENT BINDING
        // ========================================
        bindEvents: function() {
            // Navegación
            DOM.navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const section = item.dataset.section;
                    if (section) this.navigateTo(section);
                });
            });

            // Tema
            document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));

            // Menú (mobile)
            document.getElementById('menuToggle').addEventListener('click', () => {
                // Para mobile podemos desplegar un menú lateral
                // Por simplicidad, mostramos/ocultamos la navegación
                const nav = document.querySelector('.main-nav');
                nav.style.display = nav.style.display === 'none' ? 'block' : 'none';
            });

            // Calculadora
            // Presets de agua
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    AppState.calculator.water = parseInt(btn.dataset.value);
                    document.getElementById('waterSlider').value = AppState.calculator.water;
                    Renderer.updateCalculator();
                });
            });

            // Slider de agua
            document.getElementById('waterSlider').addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                AppState.calculator.water = val;
                document.querySelectorAll('.preset-btn').forEach(b => {
                    b.classList.toggle('active', parseInt(b.dataset.value) === val);
                });
                Renderer.updateCalculator();
            });

            // Fuerza
            document.querySelectorAll('.strength-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.strength-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    AppState.calculator.strength = btn.dataset.value;
                    Renderer.updateCalculator();
                });
            });

            // Calculadora personalizada
            document.getElementById('calculateCustom').addEventListener('click', () => {
                const input = document.getElementById('customWater');
                const val = parseInt(input.value);
                if (val >= 100 && val <= 600) {
                    const result = Utils.calculateCoffee(val, AppState.calculator.strength);
                    document.getElementById('customResult').innerHTML = `
                        <p>✅ <strong>${val} ml</strong> → <strong>${result.spoonDisplay}</strong> cucharas (${result.grams} g)</p>
                        <p style="font-size:0.85rem;color:var(--text-muted)">⏱ ${result.brewTime} min • ☕ ~${result.caffeine} mg cafeína</p>
                    `;
                } else {
                    document.getElementById('customResult').innerHTML = `
                        <p style="color:var(--danger-color)">⚠️ Ingresa un valor entre 100 y 600 ml</p>
                    `;
                }
            });

            // Instantánea
            document.getElementById('instantWater').addEventListener('input', Renderer.updateInstantCalculator);
            document.getElementById('instantBrand').addEventListener('change', Renderer.updateInstantCalculator);

            // Búsqueda de recetas
            const searchInput = document.getElementById('recipeSearch');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const categoryTabs = document.querySelectorAll('.category-tab');

            const filterRecipes = Utils.debounce(() => {
                const query = searchInput.value;
                const activeFilter = document.querySelector('.filter-btn.active');
                const filter = activeFilter ? activeFilter.dataset.filter : 'all';
                const activeCategory = document.querySelector('.category-tab.active');
                const category = activeCategory ? activeCategory.dataset.category : 'all';
                
                const results = Utils.filterRecipes(query, category, filter);
                Renderer.renderRecipes(results);
            }, 300);

            searchInput.addEventListener('input', filterRecipes);
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filterRecipes();
                });
            });

            categoryTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    categoryTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    filterRecipes();
                });
            });

            // Temporizador
            document.getElementById('timerStart').addEventListener('click', this.startTimer.bind(this));
            document.getElementById('timerPause').addEventListener('click', this.pauseTimer.bind(this));
            document.getElementById('timerReset').addEventListener('click', this.resetTimer.bind(this));

            document.querySelectorAll('.timer-preset').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    AppState.timer.seconds = parseInt(btn.dataset.seconds);
                    Renderer.updateTimer();
                });
            });

            // Modal
            document.querySelector('.modal-close').addEventListener('click', this.closeModal.bind(this));
            document.getElementById('recipeModal').addEventListener('click', (e) => {
                if (e.target === e.currentTarget) this.closeModal();
            });

            // Convertidor
            document.getElementById('converterBtn').addEventListener('click', () => {
                const value = parseFloat(document.getElementById('converterValue').value);
                const from = document.getElementById('converterFrom').value;
                const to = document.getElementById('converterTo').value;
                
                if (isNaN(value) || value <= 0) {
                    document.getElementById('converterResult').innerHTML = `
                        <p style="color:var(--danger-color)">⚠️ Ingresa un valor válido</p>
                    `;
                    return;
                }
                
                const result = Utils.convert(value, from, to);
                document.getElementById('converterResult').innerHTML = `
                    <p><strong>${value}</strong> ${from} = <strong>${result.toFixed(2)}</strong> ${to}</p>
                `;
            });

            // Teclado (accesibilidad)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeModal();
            });
        },

        // ========================================
        // NAVEGACIÓN
        // ========================================
        navigateTo: function(section) {
            // Ocultar todas las secciones
            Object.values(DOM.sections).forEach(el => {
                if (el) el.classList.remove('active');
            });
            
            // Mostrar la sección seleccionada
            const target = DOM.sections[section];
            if (target) {
                target.classList.add('active');
                // Scroll al inicio
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Actualizar navegación
            DOM.navItems.forEach(item => {
                item.classList.toggle('active', item.dataset.section === section);
            });
            
            AppState.currentSection = section;
        },

        // ========================================
        // TEMA
        // ========================================
        loadTheme: function() {
            const saved = localStorage.getItem('imusaTheme') || 'light';
            this.setTheme(saved);
        },

        setTheme: function(theme) {
            AppState.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('imusaTheme', theme);
            
            // Actualizar icono
            const icon = document.querySelector('#themeToggle svg');
            if (icon) {
                if (theme === 'dark') {
                    icon.innerHTML = `
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    `;
                } else {
                    icon.innerHTML = `
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    `;
                }
            }
        },

        toggleTheme: function() {
            const next = AppState.theme === 'light' ? 'dark' : 'light';
            this.setTheme(next);
        },

        // ========================================
        // RECETAS - FAVORITOS
        // ========================================
        toggleFavorite: function(recipeId) {
            const index = AppState.favorites.indexOf(recipeId);
            if (index > -1) {
                AppState.favorites.splice(index, 1);
            } else {
                AppState.favorites.push(recipeId);
            }
            Utils.saveToStorage('imusaFavorites', AppState.favorites);
            
            // Re-renderizar
            Renderer.renderPopularRecipes();
            
            // Si el modal está abierto, actualizarlo
            const modal = document.getElementById('recipeModal');
            if (modal && modal.classList.contains('active')) {
                const recipe = Utils.getRecipeById(recipeId);
                if (recipe) Renderer.showRecipeDetail(recipe);
            }
        },

        addToHistory: function(recipeId) {
            AppState.history = AppState.history.filter(id => id !== recipeId);
            AppState.history.unshift(recipeId);
            if (AppState.history.length > 20) AppState.history.pop();
            Utils.saveToStorage('imusaHistory', AppState.history);
            Renderer.renderRecentRecipes();
        },

        openRecipe: function(recipeId) {
            const recipe = Utils.getRecipeById(recipeId);
            if (recipe) {
                Renderer.showRecipeDetail(recipe);
            }
        },

        shareRecipe: function(recipeId) {
            const recipe = Utils.getRecipeById(recipeId);
            if (!recipe) return;
            
            const text = `☕ ${recipe.name}\n\nIngredientes:\n${recipe.ingredients.join('\n')}\n\n¡Preparado con mi Imusa Café City!`;
            
            if (navigator.share) {
                navigator.share({
                    title: recipe.name,
                    text: text,
                }).catch(() => {});
            } else {
                // Fallback: copiar al portapapeles
                navigator.clipboard.writeText(text).then(() => {
                    alert('📋 Receta copiada al portapapeles');
                }).catch(() => {
                    // Fallback final
                    prompt('Copia esta receta:', text);
                });
            }
        },

        closeModal: function() {
            const modal = document.getElementById('recipeModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        // ========================================
        // MARCAS
        // ========================================
        showBrand: function(brandId) {
            const brand = BRANDS.find(b => b.id === brandId);
            if (!brand) return;
            
            alert(`🏷️ ${brand.name}\n\n${brand.description}\n\n📌 Tipo: ${brand.type}\n🔄 Molienda: ${brand.grind}\n⚡ Intensidad: ${brand.intensity}\n\n💡 ${brand.recommendations}`);
        },

        // ========================================
        // GUÍAS
        // ========================================
        openGuide: function(guideId) {
            const guide = GUIDES.find(g => g.id === guideId);
            if (!guide) return;
            
            alert(`📚 ${guide.title}\n\n${guide.content}`);
        },

        // ========================================
        // TEMPORIZADOR
        // ========================================
        startTimer: function() {
            if (AppState.timer.running) return;
            if (AppState.timer.seconds <= 0) {
                // Usar el preset seleccionado o 3 min por defecto
                const activePreset = document.querySelector('.timer-preset.active');
                if (activePreset) {
                    AppState.timer.seconds = parseInt(activePreset.dataset.seconds);
                } else {
                    AppState.timer.seconds = 180; // 3 min
                }
                Renderer.updateTimer();
            }
            
            AppState.timer.running = true;
            AppState.timer.interval = setInterval(() => {
                if (AppState.timer.seconds <= 0) {
                    this.timerComplete();
                    return;
                }
                AppState.timer.seconds--;
                Renderer.updateTimer();
            }, 1000);
            
            document.getElementById('timerStart').textContent = '▶ Ejecutando...';
            document.getElementById('timerStart').disabled = true;
        },

        pauseTimer: function() {
            if (!AppState.timer.running) return;
            AppState.timer.running = false;
            clearInterval(AppState.timer.interval);
            document.getElementById('timerStart').textContent = '▶ Reanudar';
            document.getElementById('timerStart').disabled = false;
        },

        resetTimer: function() {
            AppState.timer.running = false;
            clearInterval(AppState.timer.interval);
            AppState.timer.seconds = 0;
            Renderer.updateTimer();
            document.getElementById('timerStart').textContent = '▶ Iniciar';
            document.getElementById('timerStart').disabled = false;
            document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
        },

        timerComplete: function() {
            this.pauseTimer();
            document.getElementById('timerStart').textContent = '▶ Iniciar';
            document.getElementById('timerStart').disabled = false;
            
            // Reproducir sonido
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.frequency.value = 880;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.3;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 500);
                setTimeout(() => {
                    const osc2 = audioCtx.createOscillator();
                    const gain2 = audioCtx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioCtx.destination);
                    osc2.frequency.value = 660;
                    osc2.type = 'sine';
                    gain2.gain.value = 0.3;
                    osc2.start();
                    setTimeout(() => osc2.stop(), 500);
                }, 600);
            } catch (e) {
                // Fallback: usar vibración
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
            
            // Notificación
            if (Notification.permission === 'granted') {
                new Notification('⏰ ¡Temporizador completado!', {
                    body: 'Tu café está listo para disfrutar ☕',
                    icon: '/assets/icons/icon-192.png'
                });
            }
        }
    };

    // Exponer App globalmente para onclick
    window.App = App;

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });

    // Solicitar permiso para notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

})();
