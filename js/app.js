// ========================================
// ☕ MI BARISTA IMUSA - APP PRINCIPAL
// ========================================
// Basado en estándares SCA (Specialty Coffee Association)
// Relación recomendada: 60g café / 1L agua (1:16.67)
// Rango aceptable: 1:15 a 1:18 para cafeteras de goteo
// ========================================

(function() {
    'use strict';

    // ========================================
    // CONFIGURACIÓN DE ESTÁNDARES
    // ========================================
    const COFFEE_STANDARDS = {
        // Relaciones café/agua según SCA
        ratios: {
            suave: { min: 1, max: 18, desc: 'Café suave, menor cuerpo' },
            normal: { min: 1, max: 16.67, desc: 'Balanceado, recomendación SCA' },
            fuerte: { min: 1, max: 14, desc: 'Café intenso, mayor cuerpo' }
        },
        // Conversiones validadas
        conversions: {
            spoonToGrams: 6, // 1 cuchara Imusa ≈ 6g (rango 5-7g)
            tspToMl: 5,      // 1 cucharadita ≈ 5ml
            cupToMl: 240     // 1 taza ≈ 240ml
        },
        // Rangos de cafeína (mg por taza)
        caffeine: {
            min: 80,
            max: 120,
            avg: 95
        }
    };

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
            strength: 'normal',
            customGrams: null,
            customSpoons: null
        },
        costCalculator: {
            price: 0,
            weight: 0,
            used: 0
        }
    };

    // ========================================
    // UTILIDADES
    // ========================================
    const Utils = {
        // Conversión de cucharas a gramos
        spoonsToGrams: (spoons) => {
            return Math.round(spoons * COFFEE_STANDARDS.conversions.spoonToGrams * 10) / 10;
        },

        // Conversión de gramos a cucharas
        gramsToSpoons: (grams) => {
            const spoons = grams / COFFEE_STANDARDS.conversions.spoonToGrams;
            return Math.round(spoons * 4) / 4; // Redondear a 1/4
        },

        // Formatear cucharas como fracción
        formatSpoon: (value) => {
            const whole = Math.floor(value);
            const frac = value - whole;
            
            if (frac === 0) return `${whole}`;
            if (frac === 0.25) return whole > 0 ? `${whole}¼` : '¼';
            if (frac === 0.5) return whole > 0 ? `${whole}½` : '½';
            if (frac === 0.75) return whole > 0 ? `${whole}¾` : '¾';
            return (whole + frac).toFixed(2);
        },

        // Calcular relación café/agua
        calculateRatio: (grams, water) => {
            if (water === 0) return 0;
            return water / grams;
        },

        // Obtener intensidad basada en la relación
        getStrengthFromRatio: (ratio) => {
            if (ratio >= 18) return { level: 'Muy Suave', range: '1:18+', icon: '☕' };
            if (ratio >= 16.67) return { level: 'Suave', range: '1:16.67-1:18', icon: '☕' };
            if (ratio >= 15) return { level: 'Normal', range: '1:15-1:16.67', icon: '☕' };
            if (ratio >= 13) return { level: 'Fuerte', range: '1:13-1:15', icon: '☕' };
            return { level: 'Muy Fuerte', range: '1:13-', icon: '☕' };
        },

        // Analizar preparación
        analyzePreparation: (grams, water, desiredStrength) => {
            const ratio = Utils.calculateRatio(grams, water);
            const idealRatio = COFFEE_STANDARDS.ratios[desiredStrength]?.max || 16.67;
            const idealGrams = Math.round(water / idealRatio * 10) / 10;
            const diff = Math.round((grams - idealGrams) * 10) / 10;
            const diffSpoons = Utils.gramsToSpoons(Math.abs(diff));
            
            let message = '';
            let status = '';
            
            if (Math.abs(diff) / idealGrams < 0.1) {
                status = '✅ Excelente';
                message = 'La cantidad está dentro del rango recomendado para un café balanceado.';
            } else if (diff > 0) {
                status = '☕ Fuerte';
                message = `Estás usando ${diff}g (≈${Utils.formatSpoon(diffSpoons)} cucharada${diffSpoons > 1 ? 's' : ''}) más de lo recomendado. Obtendrás un café con mayor cuerpo.`;
            } else {
                status = '☕ Suave';
                message = `Te faltan ${Math.abs(diff)}g (≈${Utils.formatSpoon(diffSpoons)} cucharada${diffSpoons > 1 ? 's' : ''}) para alcanzar la recomendación. El café será más ligero.`;
            }

            return {
                ratio: Math.round(ratio * 10) / 10,
                idealGrams,
                diff,
                diffSpoons,
                status,
                message,
                level: Utils.getStrengthFromRatio(ratio)
            };
        },

        // Calcular costo por taza
        calculateCost: (price, weight, usedGrams) => {
            const pricePerGram = price / weight;
            const costPerCup = pricePerGram * usedGrams;
            const cupsPerBag = weight / usedGrams;
            
            return {
                pricePerGram: Math.round(pricePerGram * 100) / 100,
                costPerCup: Math.round(costPerCup * 100) / 100,
                cupsPerBag: Math.round(cupsPerBag * 10) / 10,
                monthlyCost: Math.round(costPerCup * 30 * 100) / 100
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
        }
    };

    // ========================================
    // RENDERIZADO DE VISTAS
    // ========================================
    const Renderer = {
        // Renderizar calculadora principal
        updateCalculator: () => {
            const water = AppState.calculator.water;
            const strength = AppState.calculator.strength;
            
            // Calcular según estándares SCA
            const ratio = COFFEE_STANDARDS.ratios[strength]?.max || 16.67;
            const grams = Math.round(water / ratio * 10) / 10;
            const spoons = Utils.gramsToSpoons(grams);
            
            // Actualizar UI
            document.getElementById('coffeeSpoons').textContent = `${Utils.formatSpoon(spoons)} cucharadas`;
            document.getElementById('coffeeGrams').textContent = `(${grams}g aprox.)`;
            document.getElementById('caffeineAmount').textContent = 
                `~${Math.round(COFFEE_STANDARDS.caffeine.avg * grams / 10)} mg (estimado)`;
            document.getElementById('sugarAmount').textContent = 
                Utils.calculateSugar(water, 'medium') > 0 ? 
                `${Utils.calculateSugar(water, 'medium')} cucharadita${Utils.calculateSugar(water, 'medium') > 1 ? 's' : ''}` : 
                'Sin azúcar';
            document.getElementById('brewTime').textContent = `~${Math.round(water / 60 + 2)} min`;
            document.getElementById('waterDisplay').textContent = `${water} ml`;
            
            // Actualizar consejo dinámico
            this.updateTip(water);
        },

        // Consejos dinámicos según volumen
        updateTip: (water) => {
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
        },

        // Renderizar análisis inteligente
        renderAnalysis: (analysis) => {
            const container = document.getElementById('analysisResult');
            if (!container) return;

            const ratioDisplay = analysis.ratio;
            const strengthDisplay = analysis.level;
            
            container.innerHTML = `
                <div class="analysis-card">
                    <div class="analysis-status ${analysis.status.includes('Excelente') ? 'success' : ''}">
                        ${analysis.status}
                    </div>
                    <div class="analysis-ratio">
                        <span class="ratio-label">Relación café/agua</span>
                        <span class="ratio-value">1:${analysis.ratio}</span>
                    </div>
                    <div class="analysis-bar">
                        <div class="strength-bar">
                            <div class="strength-fill" style="width: ${Math.min(100, (analysis.ratio - 10) * 10)}%">
                                <span class="strength-label">${strengthDisplay.level}</span>
                            </div>
                        </div>
                        <div class="strength-labels">
                            <span>Muy Suave</span>
                            <span>Normal</span>
                            <span>Muy Fuerte</span>
                        </div>
                    </div>
                    <div class="analysis-message">
                        <p>${analysis.message}</p>
                    </div>
                    ${analysis.diff !== 0 ? `
                    <div class="analysis-compare">
                        <div class="compare-item">
                            <span class="compare-label">Tu preparación</span>
                            <span class="compare-value">${analysis.idealGrams + analysis.diff}g</span>
                            <span class="compare-sub">≈${Utils.formatSpoon(Utils.gramsToSpoons(analysis.idealGrams + analysis.diff))} cucharas</span>
                        </div>
                        <div class="compare-arrow">→</div>
                        <div class="compare-item recommended">
                            <span class="compare-label">Recomendación</span>
                            <span class="compare-value">${analysis.idealGrams}g</span>
                            <span class="compare-sub">≈${Utils.formatSpoon(Utils.gramsToSpoons(analysis.idealGrams))} cucharas</span>
                        </div>
                    </div>
                    <div class="analysis-diff">
                        <span>Diferencia: ${analysis.diff > 0 ? '+' : ''}${analysis.diff}g</span>
                        <span>≈${Utils.formatSpoon(analysis.diffSpoons)} cucharada${analysis.diffSpoons > 1 ? 's' : ''}</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }
    };

    // ========================================
    // CONTROLADOR PRINCIPAL
    // ========================================
    const App = {
        // Inicializar
        init: function() {
            console.log('☕ Mi Barista Imusa - Iniciando...');
            
            // Cargar tema guardado
            this.loadTheme();
            
            // Configurar eventos
            this.bindEvents();
            
            // Renderizar todo
            Renderer.updateCalculator();
            
            console.log('✅ Aplicación iniciada correctamente');
        },

        // ========================================
        // EVENTOS
        // ========================================
        bindEvents: function() {
            console.log('🔗 Enlazando eventos...');

            // ===== NAVEGACIÓN =====
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const section = item.dataset.section;
                    if (section) {
                        console.log(`📱 Navegando a: ${section}`);
                        this.navigateTo(section);
                    }
                });
            });

            // ===== TEMA =====
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => this.toggleTheme());
            }

            // ===== MENÚ MÓVIL =====
            const menuToggle = document.getElementById('menuToggle');
            if (menuToggle) {
                menuToggle.addEventListener('click', () => {
                    const nav = document.querySelector('.main-nav');
                    if (nav) {
                        nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
                    }
                });
            }

            // ===== CALCULADORA =====
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
            const waterSlider = document.getElementById('waterSlider');
            if (waterSlider) {
                waterSlider.addEventListener('input', (e) => {
                    const val = parseInt(e.target.value);
                    AppState.calculator.water = val;
                    document.querySelectorAll('.preset-btn').forEach(b => {
                        b.classList.toggle('active', parseInt(b.dataset.value) === val);
                    });
                    Renderer.updateCalculator();
                });
            }

            // Intensidad
            document.querySelectorAll('.strength-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.strength-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    AppState.calculator.strength = btn.dataset.value;
                    Renderer.updateCalculator();
                });
            });

            // ===== ANÁLISIS INTELIGENTE =====
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn) {
                analyzeBtn.addEventListener('click', () => {
                    this.analyzeCustomPreparation();
                });
            }

            // Enter en el input de análisis
            const customInput = document.getElementById('customGrams');
            if (customInput) {
                customInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.analyzeCustomPreparation();
                    }
                });
            }

            // ===== CALCULADORA DE COSTO =====
            const costBtn = document.getElementById('calculateCost');
            if (costBtn) {
                costBtn.addEventListener('click', () => this.calculateCost());
            }

            // ===== TEMPORIZADOR =====
            const timerStart = document.getElementById('timerStart');
            if (timerStart) timerStart.addEventListener('click', () => this.startTimer());
            
            const timerPause = document.getElementById('timerPause');
            if (timerPause) timerPause.addEventListener('click', () => this.pauseTimer());
            
            const timerReset = document.getElementById('timerReset');
            if (timerReset) timerReset.addEventListener('click', () => this.resetTimer());

            document.querySelectorAll('.timer-preset').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    AppState.timer.seconds = parseInt(btn.dataset.seconds);
                    this.updateTimerDisplay();
                });
            });

            // ===== RECETAS =====
            const searchInput = document.getElementById('recipeSearch');
            if (searchInput) {
                searchInput.addEventListener('input', this.filterRecipes.bind(this));
            }

            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filterRecipes();
                });
            });

            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.filterRecipes();
                });
            });

            // ===== MODAL =====
            const modalClose = document.querySelector('.modal-close');
            if (modalClose) {
                modalClose.addEventListener('click', () => this.closeModal());
            }

            const modal = document.getElementById('recipeModal');
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === e.currentTarget) this.closeModal();
                });
            }

            // ===== CONVERSOR =====
            const converterBtn = document.getElementById('converterBtn');
            if (converterBtn) {
                converterBtn.addEventListener('click', () => this.convertUnits());
            }

            console.log('✅ Todos los eventos enlazados');
        },

        // ========================================
        // NAVEGACIÓN
        // ========================================
        navigateTo: function(section) {
            // Ocultar todas las secciones
            document.querySelectorAll('.section').forEach(el => {
                el.classList.remove('active');
            });
            
            // Mostrar la sección seleccionada
            const target = document.getElementById(section);
            if (target) {
                target.classList.add('active');
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Actualizar navegación
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.section === section);
            });
            
            AppState.currentSection = section;
        },

        // ========================================
        // TEMA OSCURO/CLARO
        // ========================================
        loadTheme: function() {
            const saved = localStorage.getItem('imusaTheme') || 'light';
            this.setTheme(saved);
        },

        setTheme: function(theme) {
            AppState.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('imusaTheme', theme);
        },

        toggleTheme: function() {
            const next = AppState.theme === 'light' ? 'dark' : 'light';
            this.setTheme(next);
        },

        // ========================================
        // ANÁLISIS DE PREPARACIÓN
        // ========================================
        analyzeCustomPreparation: function() {
            const input = document.getElementById('customGrams');
            const unit = document.querySelector('input[name="unit"]:checked')?.value || 'grams';
            
            let grams = parseFloat(input.value);
            
            if (isNaN(grams) || grams <= 0) {
                alert('⚠️ Por favor, ingresa una cantidad válida de café.');
                return;
            }

            // Convertir si es cucharadas
            if (unit === 'spoons') {
                grams = Utils.spoonsToGrams(grams);
            }

            const water = AppState.calculator.water;
            const strength = AppState.calculator.strength;
            
            const analysis = Utils.analyzePreparation(grams, water, strength);
            Renderer.renderAnalysis(analysis);
        },

        // ========================================
        // CALCULADORA DE COSTO
        // ========================================
        calculateCost: function() {
            const price = parseFloat(document.getElementById('coffeePrice')?.value);
            const weight = parseFloat(document.getElementById('coffeeWeight')?.value);
            const used = parseFloat(document.getElementById('coffeeUsed')?.value);
            
            if (!price || !weight || !used) {
                alert('⚠️ Por favor, completa todos los campos.');
                return;
            }

            const result = Utils.calculateCost(price, weight, used);
            const container = document.getElementById('costResult');
            
            if (container) {
                container.innerHTML = `
                    <div class="cost-grid">
                        <div class="cost-item">
                            <span class="cost-label">💰 Precio por gramo</span>
                            <span class="cost-value">$${result.pricePerGram.toFixed(2)}</span>
                        </div>
                        <div class="cost-item">
                            <span class="cost-label">☕ Costo por taza</span>
                            <span class="cost-value">$${result.costPerCup.toFixed(2)}</span>
                        </div>
                        <div class="cost-item">
                            <span class="cost-label">📦 Tazas por paquete</span>
                            <span class="cost-value">${result.cupsPerBag}</span>
                        </div>
                        <div class="cost-item">
                            <span class="cost-label">📅 Costo mensual (30 días)</span>
                            <span class="cost-value">$${result.monthlyCost.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }
        },

        // ========================================
        // TEMPORIZADOR
        // ========================================
        startTimer: function() {
            if (AppState.timer.running) return;
            
            if (AppState.timer.seconds <= 0) {
                const activePreset = document.querySelector('.timer-preset.active');
                if (activePreset) {
                    AppState.timer.seconds = parseInt(activePreset.dataset.seconds);
                } else {
                    AppState.timer.seconds = 180;
                }
                this.updateTimerDisplay();
            }
            
            AppState.timer.running = true;
            AppState.timer.interval = setInterval(() => {
                if (AppState.timer.seconds <= 0) {
                    this.timerComplete();
                    return;
                }
                AppState.timer.seconds--;
                this.updateTimerDisplay();
            }, 1000);
            
            document.getElementById('timerStart').textContent = '⏳ Ejecutando...';
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
            this.updateTimerDisplay();
            document.getElementById('timerStart').textContent = '▶ Iniciar';
            document.getElementById('timerStart').disabled = false;
            document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
        },

        updateTimerDisplay: function() {
            const mins = String(Math.floor(AppState.timer.seconds / 60)).padStart(2, '0');
            const secs = String(AppState.timer.seconds % 60).padStart(2, '0');
            document.getElementById('timerMinutes').textContent = mins;
            document.getElementById('timerSeconds').textContent = secs;
        },

        timerComplete: function() {
            this.pauseTimer();
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
            } catch (e) {}
        },

        // ========================================
        // RECETAS
        // ========================================
        filterRecipes: function() {
            // Implementación simple por ahora
            console.log('🔍 Filtrando recetas...');
        },

        // ========================================
        // MODAL
        // ========================================
        closeModal: function() {
            const modal = document.getElementById('recipeModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        // ========================================
        // CONVERSOR DE UNIDADES
        // ========================================
        convertUnits: function() {
            const value = parseFloat(document.getElementById('converterValue')?.value);
            const from = document.getElementById('converterFrom')?.value;
            const to = document.getElementById('converterTo')?.value;
            
            if (isNaN(value) || value <= 0) {
                alert('⚠️ Ingresa un valor válido');
                return;
            }

            // Conversiones base
            const conversions = {
                ml: 1,
                cups: 240,
                l: 1000,
                oz: 29.57,
                g: 1,
                spoons: 14.79,
                tsp: 4.93
            };

            let baseValue = value * conversions[from];
            let result = baseValue / conversions[to];

            const resultEl = document.getElementById('converterResult');
            if (resultEl) {
                resultEl.innerHTML = `
                    <p><strong>${value}</strong> ${from} = <strong>${result.toFixed(2)}</strong> ${to}</p>
                `;
            }
        }
    };

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });

    // Exponer App globalmente
    window.App = App;

})();
