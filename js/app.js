// ========================================
// ☕ MI BARISTA IMUSA - APP PRINCIPAL
// Con calculadora de peso y análisis inteligente
// Basado en "Maestría en Café Filtrado Colombiano"
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
        calculator: {
            water: 250,
            strength: 'normal',
            customGrams: null,
            customSpoons: null
        }
    };

    // ========================================
    // REFERENCIAS DOM
    // ========================================
    const DOM = {};

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    function init() {
        console.log('☕ Mi Barista Imusa - Iniciando...');
        
        loadTheme();
        bindEvents();
        updateCalculator();
        renderBrands();
        renderRecipes();
        renderGuides();
        
        console.log('✅ Aplicación iniciada correctamente');
    }

    // ========================================
    // EVENTOS
    // ========================================
    function bindEvents() {
        // ===== NAVEGACIÓN =====
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const section = this.dataset.section;
                if (section) navigateTo(section);
            });
        });

        // ===== TEMA =====
        document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

        // ===== CALCULADORA PRINCIPAL =====
        // Presets de agua
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                AppState.calculator.water = parseInt(this.dataset.value);
                document.getElementById('waterSlider').value = AppState.calculator.water;
                updateCalculator();
            });
        });

        // Slider de agua
        document.getElementById('waterSlider')?.addEventListener('input', function() {
            const val = parseInt(this.value);
            AppState.calculator.water = val;
            document.querySelectorAll('.preset-btn').forEach(b => {
                b.classList.toggle('active', parseInt(b.dataset.value) === val);
            });
            updateCalculator();
        });

        // Intensidad
        document.querySelectorAll('.strength-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.strength-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                AppState.calculator.strength = this.dataset.value;
                updateCalculator();
            });
        });

        // ===== CALCULADORA CON PESO =====
        document.getElementById('analyzeWeight')?.addEventListener('click', analyzeByWeight);
        document.getElementById('weightInput')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') analyzeByWeight();
        });

        // ===== CALCULADORA PERSONALIZADA =====
        document.getElementById('calculateCustom')?.addEventListener('click', calculateCustom);
        document.getElementById('customWater')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateCustom();
        });

        // ===== CAFÉ INSTANTÁNEO =====
        document.getElementById('instantWater')?.addEventListener('input', updateInstantCoffee);
        document.getElementById('instantBrand')?.addEventListener('change', updateInstantCoffee);
        document.querySelectorAll('.instant-strength .strength-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.instant-strength .strength-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateInstantCoffee();
            });
        });

        // ===== TEMPORIZADOR =====
        document.getElementById('timerStart')?.addEventListener('click', startTimer);
        document.getElementById('timerPause')?.addEventListener('click', pauseTimer);
        document.getElementById('timerReset')?.addEventListener('click', resetTimer);
        document.querySelectorAll('.timer-preset').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                AppState.timer.seconds = parseInt(this.dataset.seconds);
                updateTimerDisplay();
            });
        });

        // ===== MODAL =====
        document.querySelector('.modal-close')?.addEventListener('click', closeModal);
        document.getElementById('recipeModal')?.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        // ===== CONVERSOR =====
        document.getElementById('converterBtn')?.addEventListener('click', convertUnits);

        // ===== FAVORITOS =====
        document.getElementById('favoritesBtn')?.addEventListener('click', showFavorites);
    }

    // ========================================
    // NAVEGACIÓN
    // ========================================
    function navigateTo(section) {
        document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(section);
        if (target) {
            target.classList.add('active');
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });
        AppState.currentSection = section;
    }

    // ========================================
    // TEMA
    // ========================================
    function loadTheme() {
        const saved = localStorage.getItem('imusaTheme') || 'light';
        setTheme(saved);
    }

    function setTheme(theme) {
        AppState.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('imusaTheme', theme);
    }

    function toggleTheme() {
        const next = AppState.theme === 'light' ? 'dark' : 'light';
        setTheme(next);
    }

    // ========================================
    // CALCULADORA PRINCIPAL
    // ========================================
    function updateCalculator() {
        const water = AppState.calculator.water;
        const strength = AppState.calculator.strength;
        
        // Calcular según estándares
        const ratio = COFFEE_STANDARDS.ratios[strength]?.ratio || 16.67;
        const grams = Math.round((water / ratio) * 10) / 10;
        const spoons = CoffeeMath.gramsToSpoons(grams);
        const sugar = CoffeeMath.calculateSugar(water, 'medium');
        const caffeine = Math.round(grams * 8); // 8mg por gramo aprox
        
        // Actualizar UI
        document.getElementById('coffeeSpoons').textContent = CoffeeMath.formatSpoon(spoons) + ' cucharas';
        document.getElementById('coffeeGrams').textContent = `(${grams}g aprox.)`;
        document.getElementById('caffeineAmount').textContent = `~${caffeine} mg`;
        document.getElementById('sugarAmount').textContent = sugar > 0 ? 
            `${sugar} cucharadita${sugar > 1 ? 's' : ''}` : 
            'Sin azúcar';
        document.getElementById('brewTime').textContent = `~${Math.round(water / 60 + 2)} min`;
        document.getElementById('waterDisplay').textContent = `${water} ml`;
        
        // Consejo dinámico
        updateTip(water);
    }

    function updateTip(water) {
        const tipElement = document.getElementById('dynamicTip');
        if (!tipElement) return;
        
        let tip = '';
        if (water <= 150) {
            tip = '💡 Volumen pequeño: El sabor será más concentrado. Perfecto para una taza de café expreso.';
        } else if (water <= 300) {
            tip = '💡 Volumen ideal para una taza grande. Buen equilibrio de sabor.';
        } else if (water <= 450) {
            tip = '💡 Para 2-3 tazas. Asegúrate de repartir bien el café en el filtro.';
        } else {
            tip = '💡 Capacidad máxima. Consume el café recién preparado para disfrutar todo su aroma.';
        }
        tipElement.textContent = tip;
    }

    // ========================================
    // ANÁLISIS POR PESO (NUEVA FUNCIÓN)
    // ========================================
    function analyzeByWeight() {
        const input = document.getElementById('weightInput');
        const grams = parseFloat(input.value);
        
        if (isNaN(grams) || grams <= 0) {
            document.getElementById('weightResult').innerHTML = `
                <div class="analysis-card">
                    <p style="color: var(--danger-color);">⚠️ Ingresa una cantidad válida de café en gramos.</p>
                </div>
            `;
            return;
        }

        const water = AppState.calculator.water;
        const strength = AppState.calculator.strength;
        
        // Análisis
        const analysis = CoffeeMath.analyzePreparation(grams, water, strength);
        const spoons = CoffeeMath.gramsToSpoons(grams);
        
        // Determinar si es suave, normal o fuerte basado en la relación
        let levelIcon = '☕';
        let levelText = 'Normal';
        let levelColor = '#6F4E37';
        
        if (analysis.ratio >= 18) {
            levelIcon = '☕';
            levelText = 'Muy Suave';
            levelColor = '#8B6B4F';
        } else if (analysis.ratio >= 16) {
            levelIcon = '☕';
            levelText = 'Suave';
            levelColor = '#A0806A';
        } else if (analysis.ratio >= 14) {
            levelIcon = '☕';
            levelText = 'Normal';
            levelColor = '#6F4E37';
        } else if (analysis.ratio >= 12) {
            levelIcon = '☕';
            levelText = 'Fuerte';
            levelColor = '#4A3228';
        } else {
            levelIcon = '☕';
            levelText = 'Muy Fuerte';
            levelColor = '#2C1810';
        }

        // Azúcar recomendada
        const sugarTeaspoons = CoffeeMath.calculateSugar(water, 'medium');
        
        document.getElementById('weightResult').innerHTML = `
            <div class="analysis-card">
                <div class="analysis-status" style="border-left-color: ${levelColor};">
                    ${analysis.status}
                </div>
                
                <div class="analysis-info">
                    <div class="info-item">
                        <span class="info-label">⚖️ Tu peso:</span>
                        <span class="info-value">${grams}g (≈${CoffeeMath.formatSpoon(spoons)} cucharas)</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">💧 Agua:</span>
                        <span class="info-value">${water}ml</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">📊 Relación:</span>
                        <span class="info-value">1:${analysis.ratio}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">${levelIcon} Intensidad:</span>
                        <span class="info-value" style="color: ${levelColor}; font-weight: 700;">${levelText}</span>
                    </div>
                </div>
                
                <div class="strength-bar-container">
                    <div class="strength-fill" style="width: ${Math.min(100, (analysis.ratio - 10) * 10)}%;"></div>
                </div>
                <div class="strength-labels">
                    <span>Muy Suave</span>
                    <span>Normal</span>
                    <span>Muy Fuerte</span>
                </div>
                
                <div class="analysis-message">
                    <p>${analysis.message}</p>
                </div>
                
                ${analysis.diff !== 0 ? `
                <div class="analysis-compare">
                    <div class="compare-item">
                        <span class="compare-label">Tu preparación</span>
                        <span class="compare-value">${grams}g</span>
                        <span class="compare-sub">≈${CoffeeMath.formatSpoon(spoons)} cucharas</span>
                    </div>
                    <div class="compare-arrow">→</div>
                    <div class="compare-item recommended">
                        <span class="compare-label">Recomendación</span>
                        <span class="compare-value">${analysis.idealGrams}g</span>
                        <span class="compare-sub">≈${CoffeeMath.formatSpoon(CoffeeMath.gramsToSpoons(analysis.idealGrams))} cucharas</span>
                    </div>
                </div>
                <div class="analysis-diff">
                    <span>${analysis.diff > 0 ? '➕' : '➖'} Diferencia: ${Math.abs(analysis.diff).toFixed(1)}g</span>
                    <span>≈${CoffeeMath.formatSpoon(analysis.diffSpoons)} cucharada${analysis.diffSpoons > 1 ? 's' : ''}</span>
                </div>
                ` : ''}
                
                <div class="analysis-sugar">
                    <span>🍯 Azúcar recomendada:</span>
                    <span>${sugarTeaspoons > 0 ? `${sugarTeaspoons} cucharadita${sugarTeaspoons > 1 ? 's' : ''}` : 'Sin azúcar'}</span>
                </div>
            </div>
        `;
    }

    // ========================================
    // CALCULADORA PERSONALIZADA
    // ========================================
    function calculateCustom() {
        const input = document.getElementById('customWater');
        const water = parseInt(input.value);
        
        if (isNaN(water) || water < 100 || water > 600) {
            document.getElementById('customResult').innerHTML = `
                <p style="color: var(--danger-color);">⚠️ Ingresa un valor entre 100 y 600 ml</p>
            `;
            return;
        }

        const strength = AppState.calculator.strength;
        const ratio = COFFEE_STANDARDS.ratios[strength]?.ratio || 16.67;
        const grams = Math.round((water / ratio) * 10) / 10;
        const spoons = CoffeeMath.gramsToSpoons(grams);
        const sugar = CoffeeMath.calculateSugar(water, 'medium');
        
        document.getElementById('customResult').innerHTML = `
            <p>✅ <strong>${water} ml</strong> → <strong>${CoffeeMath.formatSpoon(spoons)}</strong> cucharas (${grams} g)</p>
            <p style="font-size:0.85rem;color:var(--text-muted);">
                ⏱ ~${Math.round(water / 60 + 2)} min • 
                🍯 ${sugar > 0 ? `${sugar} cdt${sugar > 1 ? 's' : ''}` : 'Sin azúcar'}
            </p>
        `;
    }

    // ========================================
    // CAFÉ INSTANTÁNEO
    // ========================================
    function updateInstantCoffee() {
        const water = parseInt(document.getElementById('instantWater').value) || 200;
        const brand = document.getElementById('instantBrand').value;
        const strength = document.querySelector('.instant-strength .strength-btn.active')?.dataset.value || 'normal';
        
        // Datos base por marca
        const brandData = INSTANT_COFFEE_MEASURES[brand] || { base: 3, name: 'Nescafé' };
        const baseGrams = brandData.base;
        const ratio = water / 100;
        
        // Ajuste por intensidad
        const strengthMultiplier = {
            suave: 0.8,
            normal: 1.0,
            fuerte: 1.2
        };
        
        const grams = baseGrams * ratio * (strengthMultiplier[strength] || 1);
        const teaspoons = Math.round(grams * 2) / 2;
        
        document.getElementById('instantResult').textContent = `${teaspoons} cucharadita${teaspoons > 1 ? 's' : ''}`;
        document.getElementById('instantSub').textContent = `${brandData.name} - Intensidad ${strength}`;
        document.getElementById('instantWaterDisplay').textContent = `${water} ml`;
    }

    // ========================================
    // TEMPORIZADOR
    // ========================================
    let timerInterval = null;
    let timerRunning = false;
    let timerSeconds = 180;

    function startTimer() {
        if (timerRunning) return;
        if (timerSeconds <= 0) {
            const activePreset = document.querySelector('.timer-preset.active');
            if (activePreset) {
                timerSeconds = parseInt(activePreset.dataset.seconds);
            } else {
                timerSeconds = 180;
            }
            updateTimerDisplay();
        }
        
        timerRunning = true;
        timerInterval = setInterval(() => {
            if (timerSeconds <= 0) {
                timerComplete();
                return;
            }
            timerSeconds--;
            updateTimerDisplay();
        }, 1000);
        
        document.getElementById('timerStart').textContent = '⏳ Ejecutando...';
        document.getElementById('timerStart').disabled = true;
    }

    function pauseTimer() {
        if (!timerRunning) return;
        timerRunning = false;
        clearInterval(timerInterval);
        document.getElementById('timerStart').textContent = '▶ Reanudar';
        document.getElementById('timerStart').disabled = false;
    }

    function resetTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
        timerSeconds = 0;
        updateTimerDisplay();
        document.getElementById('timerStart').textContent = '▶ Iniciar';
        document.getElementById('timerStart').disabled = false;
        document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
    }

    function updateTimerDisplay() {
        const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
        const secs = String(timerSeconds % 60).padStart(2, '0');
        document.getElementById('timerMinutes').textContent = mins;
        document.getElementById('timerSeconds').textContent = secs;
    }

    function timerComplete() {
        pauseTimer();
        document.getElementById('timerStart').textContent = '▶ Iniciar';
        document.getElementById('timerStart').disabled = false;
        
        // Sonido
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
        } catch (e) {}
    }

    // ========================================
    // RECETAS
    // ========================================
    function renderRecipes() {
        const container = document.getElementById('recipeGrid');
        if (!container) return;
        
        const recipes = RECIPES.slice(0, 12);
        container.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" onclick="window.openRecipe('${recipe.id}')">
                <div class="recipe-card-image">${recipe.image || '☕'}</div>
                <div class="recipe-card-content">
                    <h4>${recipe.name}</h4>
                    <p>${recipe.time} min • ${recipe.difficulty}</p>
                </div>
                <button class="favorite-btn ${AppState.favorites.includes(recipe.id) ? 'active' : ''}" 
                        onclick="event.stopPropagation(); window.toggleFavorite('${recipe.id}')">
                    ♥
                </button>
            </div>
        `).join('');
    }

    function openRecipe(recipeId) {
        const recipe = RECIPES.find(r => r.id === recipeId);
        if (!recipe) return;
        
        const modal = document.getElementById('recipeModal');
        const detail = document.getElementById('recipeDetail');
        
        if (!modal || !detail) return;
        
        const isFavorite = AppState.favorites.includes(recipe.id);
        const spoons = CoffeeMath.gramsToSpoons(recipe.coffee_grams || 10.5);
        
        detail.innerHTML = `
            <div class="recipe-detail">
                <div class="recipe-detail-header">
                    <span class="recipe-detail-icon">${recipe.image || '☕'}</span>
                    <h2>${recipe.name}</h2>
                    <div class="recipe-meta">
                        <span>⏱ ${recipe.time} min</span>
                        <span>📊 ${recipe.difficulty}</span>
                        <span>🍽 ${recipe.servings || 1}</span>
                    </div>
                </div>
                
                <div class="recipe-detail-section">
                    <h3>📋 Ingredientes</h3>
                    <ul>
                        <li>💧 Agua: ${recipe.water_ml}ml</li>
                        <li>☕ Café: ${CoffeeMath.formatSpoon(spoons)} cucharas (${recipe.coffee_grams}g)</li>
                        ${recipe.milk_ml ? `<li>🥛 Leche: ${recipe.milk_ml}ml</li>` : ''}
                        ${recipe.sugar_spoons ? `<li>🍯 Azúcar: ${recipe.sugar_spoons} cucharadita${recipe.sugar_spoons > 1 ? 's' : ''}</li>` : ''}
                        ${recipe.special_ingredients ? recipe.special_ingredients.map(i => `<li>${i}</li>`).join('') : ''}
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
                    <button class="btn-primary" onclick="window.toggleFavorite('${recipe.id}')">
                        ${isFavorite ? '❤️ Quitar de favoritos' : '🤍 Agregar a favoritos'}
                    </button>
                    <button class="btn-secondary" onclick="window.print()">🖨️ Imprimir</button>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // ========================================
    // FAVORITOS
    // ========================================
    function toggleFavorite(recipeId) {
        const index = AppState.favorites.indexOf(recipeId);
        if (index > -1) {
            AppState.favorites.splice(index, 1);
        } else {
            AppState.favorites.push(recipeId);
        }
        localStorage.setItem('imusaFavorites', JSON.stringify(AppState.favorites));
        renderRecipes();
    }

    function showFavorites() {
        const favorites = AppState.favorites;
        if (favorites.length === 0) {
            alert('📭 No tienes recetas favoritas guardadas.');
            return;
        }
        navigateTo('recipes');
        const container = document.getElementById('recipeGrid');
        const favRecipes = RECIPES.filter(r => favorites.includes(r.id));
        container.innerHTML = favRecipes.map(recipe => `
            <div class="recipe-card" onclick="window.openRecipe('${recipe.id}')">
                <div class="recipe-card-image">${recipe.image || '☕'}</div>
                <div class="recipe-card-content">
                    <h4>${recipe.name}</h4>
                    <p>${recipe.time} min • ${recipe.difficulty}</p>
                </div>
                <button class="favorite-btn active" onclick="event.stopPropagation(); window.toggleFavorite('${recipe.id}')">
                    ♥
                </button>
            </div>
        `).join('');
    }

    // ========================================
    // MARCAS
    // ========================================
    function renderBrands() {
        const container = document.getElementById('brandsList');
        if (!container) return;
        
        const topBrands = BRANDS.slice(0, 12);
        container.innerHTML = topBrands.map(brand => `
            <div class="brand-chip" onclick="window.showBrand('${brand.id}')">
                <span class="brand-name">${brand.emoji} ${brand.name}</span>
                <span class="brand-intensity">${brand.intensity}/10</span>
            </div>
        `).join('');
    }

    function showBrand(brandId) {
        const brand = BRANDS.find(b => b.id === brandId);
        if (!brand) return;
        
        const spoons = CoffeeMath.formatSpoon(brand.spoon_250ml || 1.5);
        
        alert(
`🏷️ ${brand.name}

${brand.description}

📌 Tipo: ${brand.type}
📍 Origen: ${brand.origin || 'Colombia'}
🔄 Molienda: ${brand.grind}
⚡ Intensidad: ${brand.intensity}/10
🔬 Acidez: ${brand.acidity || 'Media'}
💪 Cuerpo: ${brand.body || 'Medio'}
🍫 Notas: ${brand.flavor_notes ? brand.flavor_notes.join(', ') : 'No disponible'}

📊 Dosis para 250ml: ${spoons} cucharas (${brand.grams_250ml}g)
☕ Mejor para: ${brand.best_for ? brand.best_for.join(', ') : 'Todo tipo'}`
        );
    }

    // ========================================
    // GUÍAS
    // ========================================
    function renderGuides() {
        const container = document.getElementById('guidesGrid');
        if (!container) return;
        
        container.innerHTML = GUIDES.map(guide => `
            <div class="guide-card" onclick="window.showGuide('${guide.id}')">
                <h3>${guide.icon} ${guide.title}</h3>
                <p>${guide.content.substring(0, 80)}${guide.content.length > 80 ? '...' : ''}</p>
            </div>
        `).join('');
    }

    function showGuide(guideId) {
        const guide = GUIDES.find(g => g.id === guideId);
        if (!guide) return;
        alert(`📚 ${guide.title}\n\n${guide.content}`);
    }

    // ========================================
    // CONVERSOR
    // ========================================
    function convertUnits() {
        const value = parseFloat(document.getElementById('converterValue').value);
        const from = document.getElementById('converterFrom').value;
        const to = document.getElementById('converterTo').value;
        
        if (isNaN(value) || value <= 0) {
            document.getElementById('converterResult').innerHTML = `
                <p style="color: var(--danger-color);">⚠️ Ingresa un valor válido</p>
            `;
            return;
        }

        const conversions = {
            ml: 1,
            g: 1,
            tbsp: 14.79,
            tsp: 4.93,
            oz: 29.57,
            cup: 236.59
        };

        let baseValue = value * conversions[from];
        let result = baseValue / conversions[to];

        document.getElementById('converterResult').innerHTML = `
            <p><strong>${value}</strong> ${from} = <strong>${result.toFixed(2)}</strong> ${to}</p>
        `;
    }

    // ========================================
    // MODAL
    // ========================================
    function closeModal() {
        const modal = document.getElementById('recipeModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ========================================
    // EXPONER FUNCIONES GLOBALES
    // ========================================
    window.navigateTo = navigateTo;
    window.openRecipe = openRecipe;
    window.toggleFavorite = toggleFavorite;
    window.showBrand = showBrand;
    window.showGuide = showGuide;
    window.closeModal = closeModal;

    // ========================================
    // INICIALIZAR
    // ========================================
    document.addEventListener('DOMContentLoaded', init);

})();
