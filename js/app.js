// ========================================
// ☕ MI BARISTA IMUSA - APP PRINCIPAL
// CON CALCULADORA DE PESO Y RESTA AUTOMÁTICA
// Basado en "Maestría en Café Filtrado Colombiano"
// ========================================

(function() {
    'use strict';

    // ========================================
    // CONFIGURACIÓN
    // ========================================
    const CONFIG = {
        spoonWeight: 7, // Peso de la cuchara dosificadora IMUSA en gramos
        waterMin: 100,
        waterMax: 600,
        defaultWater: 250,
        defaultStrength: 'normal'
    };

    // ========================================
    // ESTADO
    // ========================================
    const AppState = {
        currentSection: 'home',
        theme: 'light',
        favorites: JSON.parse(localStorage.getItem('imusaFavorites')) || [],
        history: JSON.parse(localStorage.getItem('imusaHistory')) || [],
        calculator: {
            water: CONFIG.defaultWater,
            strength: CONFIG.defaultStrength,
            customGrams: null
        },
        timer: {
            seconds: 180,
            interval: null,
            running: false
        }
    };

    // ========================================
    // UTILIDADES Y MATEMÁTICAS
    // ========================================
    const CoffeeMath = {
        // Peso real de café = peso_total - peso_cuchara
        getRealCoffeeWeight: function(totalWeight) {
            return Math.max(0, totalWeight - CONFIG.spoonWeight);
        },

        // Convertir gramos reales a cucharas
        gramsToSpoons: function(grams) {
            if (grams <= 0) return 0;
            return Math.round((grams / CONFIG.spoonWeight) * 4) / 4;
        },

        // Convertir cucharas a gramos
        spoonsToGrams: function(spoons) {
            return spoons * CONFIG.spoonWeight;
        },

        // Formatear fracciones de cuchara
        formatSpoon: function(value) {
            if (value === 0) return '0';
            const whole = Math.floor(value);
            const frac = value - whole;
            
            const fracMap = {
                0: '',
                0.25: '¼',
                0.5: '½',
                0.75: '¾'
            };
            
            const fracStr = fracMap[Math.round(frac * 4) / 4] || '';
            return whole > 0 ? `${whole}${fracStr}` : fracStr || value.toFixed(1);
        },

        // Calcular relación café/agua
        calculateRatio: function(grams, water) {
            if (water === 0 || grams === 0) return 0;
            return Math.round((water / grams) * 10) / 10;
        },

        // Determinar intensidad basado en la relación
        getIntensity: function(ratio) {
            if (ratio >= 20) return { level: 'Muy Suave', icon: '☕', color: '#A0806A', range: '1:20+' };
            if (ratio >= 18) return { level: 'Suave', icon: '☕', color: '#8B6B4F', range: '1:18-1:20' };
            if (ratio >= 16) return { level: 'Normal', icon: '☕', color: '#6F4E37', range: '1:16-1:18' };
            if (ratio >= 14) return { level: 'Fuerte', icon: '☕', color: '#4A3228', range: '1:14-1:16' };
            return { level: 'Muy Fuerte', icon: '☕', color: '#2C1810', range: '1:14-' };
        },

        // Calcular azúcar recomendada (en cucharaditas)
        calculateSugar: function(water, level = 'medium') {
            const sugarMap = {
                none: 0,
                little: 0.03,
                medium: 0.06,
                much: 0.09
            };
            const grams = water * (sugarMap[level] || 0.06);
            const teaspoons = grams / 5; // 1 cucharadita = 5g
            return Math.round(teaspoons * 4) / 4;
        },

        // Analizar preparación completa
        analyzePreparation: function(totalWeight, water, strength) {
            // Obtener peso real de café
            const realGrams = this.getRealCoffeeWeight(totalWeight);
            
            if (realGrams <= 0) {
                return {
                    error: true,
                    message: '⚠️ El peso del café debe ser mayor que el peso de la cuchara.',
                    realGrams: 0,
                    spoons: 0
                };
            }

            const ratio = this.calculateRatio(realGrams, water);
            const intensity = this.getIntensity(ratio);
            
            // Recomendación basada en SCA
            const idealRatio = 16.67; // SCA Gold Cup
            const idealGrams = Math.round((water / idealRatio) * 10) / 10;
            const diff = Math.round((realGrams - idealGrams) * 10) / 10;
            const diffSpoons = this.gramsToSpoons(Math.abs(diff));
            
            // Determinar estado
            let status = '';
            let message = '';
            
            if (Math.abs(diff) / idealGrams < 0.1) {
                status = '✅ Excelente';
                message = 'Tu preparación está dentro del rango recomendado para un café balanceado.';
            } else if (diff > 0) {
                status = '☕ Más fuerte';
                message = `Usas ${diff.toFixed(1)}g (≈${this.formatSpoon(diffSpoons)} cuchara${diffSpoons > 1 ? 's' : ''}) más de café. Obtendrás un café con mayor cuerpo.`;
            } else {
                status = '☕ Más suave';
                message = `Te faltan ${Math.abs(diff).toFixed(1)}g (≈${this.formatSpoon(diffSpoons)} cuchara${diffSpoons > 1 ? 's' : ''}) de café. El resultado será más ligero.`;
            }
            
            const spoons = this.gramsToSpoons(realGrams);
            const sugar = this.calculateSugar(water, 'medium');
            
            return {
                error: false,
                totalWeight,
                realGrams,
                spoons,
                ratio,
                intensity,
                idealGrams,
                diff,
                diffSpoons,
                status,
                message,
                sugar,
                spoonDisplay: this.formatSpoon(spoons),
                diffSpoonDisplay: this.formatSpoon(diffSpoons)
            };
        }
    };

    // ========================================
    // FUNCIONES DE UI
    // ========================================
    function updateCalculator() {
        const water = AppState.calculator.water;
        const strength = AppState.calculator.strength;
        
        const ratios = {
            suave: 18,
            normal: 16.67,
            fuerte: 14
        };
        
        const ratio = ratios[strength] || 16.67;
        const grams = Math.round((water / ratio) * 10) / 10;
        const spoons = CoffeeMath.gramsToSpoons(grams);
        const sugar = CoffeeMath.calculateSugar(water, 'medium');
        const caffeine = Math.round(grams * 8);
        
        document.getElementById('coffeeSpoons').textContent = CoffeeMath.formatSpoon(spoons) + ' cucharas';
        document.getElementById('coffeeGrams').textContent = `(${grams}g aprox.)`;
        document.getElementById('caffeineAmount').textContent = `~${caffeine} mg`;
        document.getElementById('sugarAmount').textContent = sugar > 0 ? 
            `${sugar} cucharadita${sugar > 1 ? 's' : ''}` : 
            'Sin azúcar';
        document.getElementById('brewTime').textContent = `~${Math.round(water / 60 + 2)} min`;
        document.getElementById('waterDisplay').textContent = `${water} ml`;
        
        updateTip(water);
    }

    function updateTip(water) {
        const tip = document.getElementById('dynamicTip');
        if (!tip) return;
        
        if (water <= 150) tip.textContent = '💡 Volumen pequeño: sabor más concentrado.';
        else if (water <= 300) tip.textContent = '💡 Volumen ideal para una taza grande.';
        else if (water <= 450) tip.textContent = '💡 Para 2-3 tazas. Reparte bien el café.';
        else tip.textContent = '💡 Capacidad máxima. Consume recién preparado.';
    }

    // ========================================
    // ANÁLISIS CON BÁSCULA (NUEVO)
    // ========================================
    function analyzeWithScale() {
        const input = document.getElementById('scaleInput');
        const totalWeight = parseFloat(input.value);
        
        if (isNaN(totalWeight) || totalWeight <= 0) {
            document.getElementById('scaleResult').innerHTML = `
                <div class="analysis-error">
                    ⚠️ Ingresa el peso total (café + cuchara) en gramos.
                </div>
            `;
            return;
        }

        const water = AppState.calculator.water;
        const strength = AppState.calculator.strength;
        
        const analysis = CoffeeMath.analyzePreparation(totalWeight, water, strength);
        
        if (analysis.error) {
            document.getElementById('scaleResult').innerHTML = `
                <div class="analysis-error">${analysis.message}</div>
            `;
            return;
        }

        const intensity = analysis.intensity;
        const barPercent = Math.min(100, Math.max(0, (analysis.ratio - 10) * 10));
        
        document.getElementById('scaleResult').innerHTML = `
            <div class="analysis-card">
                <div class="analysis-status" style="border-left-color: ${intensity.color};">
                    ${analysis.status}
                </div>
                
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <span class="label">⚖️ Peso total</span>
                        <span class="value">${analysis.totalWeight}g</span>
                        <span class="sub">(café + cuchara)</span>
                    </div>
                    <div class="analysis-item highlight">
                        <span class="label">☕ Café real</span>
                        <span class="value">${analysis.realGrams}g</span>
                        <span class="sub">≈${analysis.spoonDisplay} cucharas</span>
                    </div>
                    <div class="analysis-item">
                        <span class="label">💧 Agua</span>
                        <span class="value">${water}ml</span>
                    </div>
                    <div class="analysis-item">
                        <span class="label">📊 Relación</span>
                        <span class="value">1:${analysis.ratio}</span>
                    </div>
                </div>
                
                <div class="intensity-bar">
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${barPercent}%; background: ${intensity.color};"></div>
                    </div>
                    <div class="bar-labels">
                        <span>Muy Suave</span>
                        <span style="color: ${intensity.color}; font-weight: 700;">${intensity.icon} ${intensity.level}</span>
                        <span>Muy Fuerte</span>
                    </div>
                </div>
                
                <div class="analysis-message">${analysis.message}</div>
                
                <div class="analysis-compare">
                    <div class="compare-box">
                        <div class="compare-label">Tu preparación</div>
                        <div class="compare-value">${analysis.realGrams}g</div>
                        <div class="compare-sub">${analysis.spoonDisplay} cucharas</div>
                    </div>
                    <div class="compare-arrow">→</div>
                    <div class="compare-box recommended">
                        <div class="compare-label">Recomendación</div>
                        <div class="compare-value">${analysis.idealGrams}g</div>
                        <div class="compare-sub">${CoffeeMath.formatSpoon(CoffeeMath.gramsToSpoons(analysis.idealGrams))} cucharas</div>
                    </div>
                </div>
                
                <div class="analysis-diff">
                    <span>${analysis.diff > 0 ? '➕' : '➖'} Diferencia: ${Math.abs(analysis.diff).toFixed(1)}g</span>
                    <span>≈${analysis.diffSpoonDisplay} cucharada${analysis.diffSpoons > 1 ? 's' : ''}</span>
                </div>
                
                <div class="analysis-sugar">
                    <span>🍯 Azúcar recomendada:</span>
                    <span>${analysis.sugar > 0 ? `${analysis.sugar} cucharadita${analysis.sugar > 1 ? 's' : ''}` : 'Sin azúcar'}</span>
                </div>
                
                <div class="analysis-note">
                    <small>💡 La cuchara IMUSA pesa ${CONFIG.spoonWeight}g. El peso real de café = peso total - ${CONFIG.spoonWeight}g.</small>
                </div>
            </div>
        `;
    }

    // ========================================
    // ANÁLISIS RÁPIDO (GRAMOS DIRECTOS)
    // ========================================
    function analyzeDirect() {
        const input = document.getElementById('directGrams');
        const grams = parseFloat(input.value);
        
        if (isNaN(grams) || grams <= 0) {
            document.getElementById('directResult').innerHTML = `
                <div class="analysis-error">⚠️ Ingresa los gramos de café.</div>
            `;
            return;
        }

        const water = AppState.calculator.water;
        const strength = AppState.calculator.strength;
        
        const ratio = CoffeeMath.calculateRatio(grams, water);
        const intensity = CoffeeMath.getIntensity(ratio);
        const spoons = CoffeeMath.gramsToSpoons(grams);
        const sugar = CoffeeMath.calculateSugar(water, 'medium');
        
        const idealRatio = 16.67;
        const idealGrams = Math.round((water / idealRatio) * 10) / 10;
        const diff = Math.round((grams - idealGrams) * 10) / 10;
        const diffSpoons = CoffeeMath.gramsToSpoons(Math.abs(diff));
        
        let status = '';
        let message = '';
        
        if (Math.abs(diff) / idealGrams < 0.1) {
            status = '✅ Excelente';
            message = 'Tu preparación está dentro del rango recomendado.';
        } else if (diff > 0) {
            status = '☕ Más fuerte';
            message = `Usas ${diff.toFixed(1)}g más de café. Café con mayor cuerpo.`;
        } else {
            status = '☕ Más suave';
            message = `Te faltan ${Math.abs(diff).toFixed(1)}g de café. Café más ligero.`;
        }
        
        const barPercent = Math.min(100, Math.max(0, (ratio - 10) * 10));
        
        document.getElementById('directResult').innerHTML = `
            <div class="analysis-card">
                <div class="analysis-status">${status}</div>
                
                <div class="analysis-grid">
                    <div class="analysis-item highlight">
                        <span class="label">☕ Café</span>
                        <span class="value">${grams}g</span>
                        <span class="sub">≈${CoffeeMath.formatSpoon(spoons)} cucharas</span>
                    </div>
                    <div class="analysis-item">
                        <span class="label">💧 Agua</span>
                        <span class="value">${water}ml</span>
                    </div>
                    <div class="analysis-item">
                        <span class="label">📊 Relación</span>
                        <span class="value">1:${ratio}</span>
                    </div>
                    <div class="analysis-item">
                        <span class="label">${intensity.icon} Intensidad</span>
                        <span class="value" style="color: ${intensity.color};">${intensity.level}</span>
                    </div>
                </div>
                
                <div class="intensity-bar">
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${barPercent}%; background: ${intensity.color};"></div>
                    </div>
                    <div class="bar-labels">
                        <span>Muy Suave</span>
                        <span style="color: ${intensity.color}; font-weight: 700;">${intensity.range}</span>
                        <span>Muy Fuerte</span>
                    </div>
                </div>
                
                <div class="analysis-message">${message}</div>
                
                <div class="analysis-compare">
                    <div class="compare-box">
                        <div class="compare-label">Tu preparación</div>
                        <div class="compare-value">${grams}g</div>
                        <div class="compare-sub">${CoffeeMath.formatSpoon(spoons)} cucharas</div>
                    </div>
                    <div class="compare-arrow">→</div>
                    <div class="compare-box recommended">
                        <div class="compare-label">Recomendación</div>
                        <div class="compare-value">${idealGrams}g</div>
                        <div class="compare-sub">${CoffeeMath.formatSpoon(CoffeeMath.gramsToSpoons(idealGrams))} cucharas</div>
                    </div>
                </div>
                
                <div class="analysis-diff">
                    <span>${diff > 0 ? '➕' : '➖'} Diferencia: ${Math.abs(diff).toFixed(1)}g</span>
                    <span>≈${CoffeeMath.formatSpoon(diffSpoons)} cucharada${diffSpoons > 1 ? 's' : ''}</span>
                </div>
                
                <div class="analysis-sugar">
                    <span>🍯 Azúcar recomendada:</span>
                    <span>${sugar > 0 ? `${sugar} cucharadita${sugar > 1 ? 's' : ''}` : 'Sin azúcar'}</span>
                </div>
            </div>
        `;
    }

    // ========================================
    // CAFÉ INSTANTÁNEO
    // ========================================
    function updateInstant() {
        const water = parseInt(document.getElementById('instantWater').value) || 200;
        const brand = document.getElementById('instantBrand').value;
        const strength = document.querySelector('.instant-strength .strength-btn.active')?.dataset.value || 'normal';
        
        const brandData = {
            nescafe: { name: 'Nescafé Tradición', base: 3 },
            juanvaldez: { name: 'Juan Valdez Instantáneo', base: 2.5 },
            colcafe: { name: 'Colcafé Clásico', base: 3 },
            aguila: { name: 'Águila Roja Soluble', base: 4 },
            sello: { name: 'Sello Rojo Soluble', base: 4 },
            buendia: { name: 'Buendía Liofilizado', base: 3 }
        };
        
        const brandInfo = brandData[brand] || brandData.nescafe;
        const ratio = water / 100;
        const multipliers = { suave: 0.8, normal: 1.0, fuerte: 1.2 };
        const grams = brandInfo.base * ratio * (multipliers[strength] || 1);
        const teaspoons = Math.round(grams * 4) / 4;
        
        document.getElementById('instantResult').textContent = `${teaspoons} cucharadita${teaspoons > 1 ? 's' : ''}`;
        document.getElementById('instantSub').textContent = `${brandInfo.name} - Intensidad ${strength}`;
        document.getElementById('instantWaterDisplay').textContent = `${water} ml`;
    }

    // ========================================
    // TEMPORIZADOR
    // ========================================
    function startTimer() {
        if (AppState.timer.running) return;
        if (AppState.timer.seconds <= 0) {
            const active = document.querySelector('.timer-preset.active');
            AppState.timer.seconds = active ? parseInt(active.dataset.seconds) : 180;
            updateTimerDisplay();
        }
        
        AppState.timer.running = true;
        AppState.timer.interval = setInterval(() => {
            if (AppState.timer.seconds <= 0) {
                clearInterval(AppState.timer.interval);
                AppState.timer.running = false;
                document.getElementById('timerStart').textContent = '▶ Iniciar';
                document.getElementById('timerStart').disabled = false;
                beep();
                return;
            }
            AppState.timer.seconds--;
            updateTimerDisplay();
        }, 1000);
        
        document.getElementById('timerStart').textContent = '⏳';
        document.getElementById('timerStart').disabled = true;
    }

    function pauseTimer() {
        if (!AppState.timer.running) return;
        AppState.timer.running = false;
        clearInterval(AppState.timer.interval);
        document.getElementById('timerStart').textContent = '▶ Reanudar';
        document.getElementById('timerStart').disabled = false;
    }

    function resetTimer() {
        AppState.timer.running = false;
        clearInterval(AppState.timer.interval);
        AppState.timer.seconds = 0;
        updateTimerDisplay();
        document.getElementById('timerStart').textContent = '▶ Iniciar';
        document.getElementById('timerStart').disabled = false;
        document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
    }

    function updateTimerDisplay() {
        const mins = String(Math.floor(AppState.timer.seconds / 60)).padStart(2, '0');
        const secs = String(AppState.timer.seconds % 60).padStart(2, '0');
        document.getElementById('timerMinutes').textContent = mins;
        document.getElementById('timerSeconds').textContent = secs;
    }

    function beep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.3;
            osc.start();
            setTimeout(() => osc.stop(), 300);
            setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.frequency.value = 660;
                gain2.gain.value = 0.3;
                osc2.start();
                setTimeout(() => osc2.stop(), 300);
            }, 400);
        } catch (e) {}
    }

    // ========================================
    // NAVEGACIÓN Y TEMA
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

    function toggleTheme() {
        const next = AppState.theme === 'light' ? 'dark' : 'light';
        AppState.theme = next;
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('imusaTheme', next);
    }

    // ========================================
    // EVENTOS
    // ========================================
    function bindEvents() {
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                navigateTo(this.dataset.section);
            });
        });

        // Tema
        document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

        // Calculadora agua
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                AppState.calculator.water = parseInt(this.dataset.value);
                document.getElementById('waterSlider').value = AppState.calculator.water;
                updateCalculator();
            });
        });

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

        // Análisis con báscula
        document.getElementById('scaleAnalyze')?.addEventListener('click', analyzeWithScale);
        document.getElementById('scaleInput')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') analyzeWithScale();
        });

        // Análisis directo
        document.getElementById('directAnalyze')?.addEventListener('click', analyzeDirect);
        document.getElementById('directGrams')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') analyzeDirect();
        });

        // Calculadora personalizada
        document.getElementById('calculateCustom')?.addEventListener('click', function() {
            const water = parseInt(document.getElementById('customWater').value);
            if (isNaN(water) || water < 100 || water > 600) {
                document.getElementById('customResult').innerHTML = '<p class="error">⚠️ Ingresa 100-600ml</p>';
                return;
            }
            const ratio = { suave: 18, normal: 16.67, fuerte: 14 }[AppState.calculator.strength] || 16.67;
            const grams = Math.round((water / ratio) * 10) / 10;
            const spoons = CoffeeMath.gramsToSpoons(grams);
            const sugar = CoffeeMath.calculateSugar(water, 'medium');
            document.getElementById('customResult').innerHTML = `
                <p>✅ ${water}ml → ${CoffeeMath.formatSpoon(spoons)} cucharas (${grams}g)</p>
                <p class="sub">🍯 ${sugar > 0 ? `${sugar} cdt${sugar > 1 ? 's' : ''}` : 'Sin azúcar'}</p>
            `;
        });

        // Café instantáneo
        document.getElementById('instantWater')?.addEventListener('input', updateInstant);
        document.getElementById('instantBrand')?.addEventListener('change', updateInstant);
        document.querySelectorAll('.instant-strength .strength-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.instant-strength .strength-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateInstant();
            });
        });

        // Temporizador
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

        // Modal
        document.querySelector('.modal-close')?.addEventListener('click', closeModal);
        document.getElementById('recipeModal')?.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }

    function closeModal() {
        const modal = document.getElementById('recipeModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    function init() {
        // Cargar tema
        const savedTheme = localStorage.getItem('imusaTheme') || 'light';
        AppState.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);

        bindEvents();
        updateCalculator();
        updateInstant();
        updateTimerDisplay();

        // Preset inicial de agua
        document.querySelector('.preset-btn[data-value="250"]')?.classList.add('active');
        document.querySelector('.strength-btn[data-value="normal"]')?.classList.add('active');
        document.querySelector('.timer-preset[data-seconds="180"]')?.classList.add('active');
        document.querySelector('.instant-strength .strength-btn[data-value="normal"]')?.classList.add('active');

        console.log('☕ Mi Barista Imusa - Iniciado correctamente');
    }

    // Exponer globalmente
    window.navigateTo = navigateTo;
    window.toggleTheme = toggleTheme;
    window.closeModal = closeModal;
    window.analyzeWithScale = analyzeWithScale;
    window.analyzeDirect = analyzeDirect;

    document.addEventListener('DOMContentLoaded', init);

})();
