// ========================================
// ☕ MI BARISTA IMUSA - APP COMPLETA
// ========================================

(function() {
    'use strict';

    // ========================================
    // ESTADO
    // ========================================
    const AppState = {
        currentSection: 'home',
        theme: 'light',
        favorites: JSON.parse(localStorage.getItem('imusaFavorites')) || [],
        history: JSON.parse(localStorage.getItem('imusaHistory')) || [],
        calculator: {
            water: 250,
            strength: 'normal',
            brand: 'tostao'
        }
    };

    // Acumulador del análisis con báscula: café real ya pesado (sin el peso de la cuchara)
    let accumulatedCoffee = 0;
    let scoopHistory = []; // guarda cada pesada individual para poder deshacer la última

    // ========================================
    // UTILIDADES
    // ========================================
    const Utils = {
        saveToStorage: (key, data) => {
            try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
        },
        loadFromStorage: (key, defaultVal) => {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultVal;
            } catch (e) { return defaultVal; }
        }
    };

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
        setTheme(AppState.theme === 'light' ? 'dark' : 'light');
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
        updateInstantCoffee();
        updateAccumulatedDisplay();
        analyzeWithScale(); // Análisis automático al cargar
        console.log('✅ Aplicación iniciada correctamente');
    }

    // ========================================
    // EVENT BINDING
    // ========================================
    function bindEvents() {
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                navigateTo(this.dataset.section);
            });
        });

        // Tema
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);

        // Menú móvil
        document.getElementById('menuToggle').addEventListener('click', function() {
            const nav = document.querySelector('.main-nav');
            nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
        });

        // Favoritos
        document.getElementById('favoritesBtn').addEventListener('click', showFavorites);

        // ===== CALCULADORA PRINCIPAL =====
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                AppState.calculator.water = parseInt(this.dataset.value);
                document.getElementById('waterSlider').value = AppState.calculator.water;
                updateCalculator();
            });
        });

        document.getElementById('waterSlider').addEventListener('input', function() {
            const val = parseInt(this.value);
            AppState.calculator.water = val;
            document.querySelectorAll('.preset-btn').forEach(b => {
                b.classList.toggle('active', parseInt(b.dataset.value) === val);
            });
            updateCalculator();
        });

        document.querySelectorAll('.strength-selector .strength-btn').forEach(btn => {
            // Excluir los selectores de café instantáneo y de análisis (tienen su propio binding)
            if (btn.closest('.instant-strength') || btn.closest('#scaleStrengthSelector')) return;
            btn.addEventListener('click', function() {
                document.querySelectorAll('.strength-selector .strength-btn').forEach(b => {
                    if (!b.closest('.instant-strength') && !b.closest('#scaleStrengthSelector')) {
                        b.classList.remove('active');
                    }
                });
                this.classList.add('active');
                AppState.calculator.strength = this.dataset.value;
                updateCalculator();
            });
        });

        document.getElementById('mainBrand').addEventListener('change', function() {
            AppState.calculator.brand = this.value;
            updateCalculator();
        });

        document.getElementById('calculateCustom').addEventListener('click', calculateCustom);
        document.getElementById('customWater').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateCustom();
        });

        // Café instantáneo
        document.getElementById('instantWater').addEventListener('input', updateInstantCoffee);
        document.getElementById('instantBrand').addEventListener('change', updateInstantCoffee);
        document.querySelectorAll('.instant-strength .strength-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.instant-strength .strength-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateInstantCoffee();
            });
        });

        // ===== ANÁLISIS CON BÁSCULA =====
        document.getElementById('analyzeScale').addEventListener('click', analyzeWithScale);
        document.getElementById('totalWeight').addEventListener('input', analyzeWithScale);
        document.getElementById('totalWeight').addEventListener('change', analyzeWithScale);
        document.getElementById('scaleWater').addEventListener('input', function() {
            document.getElementById('scaleWaterDisplay').textContent = this.value + ' ml';
            analyzeWithScale();
        });

        // ➕ Añadir cuchara: toma lo pesado ahora (café + cuchara), resta 7g,
        // lo suma al acumulado y reinicia el campo a 0 para pesar la siguiente cucharada.
        document.querySelector('.spoon-btn[data-action="add"]')?.addEventListener('click', function() {
            const input = document.getElementById('totalWeight');
            const weighed = parseFloat(input.value) || 0;
            const spoonWeight = COFFEE_STANDARDS.imusa.spoon_grams;

            let coffeeFromScoop = Math.round((weighed - spoonWeight) * 10) / 10;
            if (coffeeFromScoop < 0) coffeeFromScoop = 0;

            scoopHistory.push(coffeeFromScoop);
            accumulatedCoffee = Math.round((accumulatedCoffee + coffeeFromScoop) * 10) / 10;

            input.value = 0; // listo para la siguiente pesada
            updateAccumulatedDisplay();
            analyzeWithScale();
        });

        // ➖ Quitar última: deshace la última pesada añadida al acumulado
        document.querySelector('.spoon-btn[data-action="remove"]')?.addEventListener('click', function() {
            if (scoopHistory.length === 0) return;
            const last = scoopHistory.pop();
            accumulatedCoffee = Math.round(Math.max(0, accumulatedCoffee - last) * 10) / 10;
            updateAccumulatedDisplay();
            analyzeWithScale();
        });

        // 🔄 Reiniciar: borra todo el acumulado y el campo
        document.querySelector('.spoon-btn[data-action="reset"]')?.addEventListener('click', function() {
            accumulatedCoffee = 0;
            scoopHistory = [];
            document.getElementById('totalWeight').value = 0;
            updateAccumulatedDisplay();
            analyzeWithScale();
        });

        // Selector de intensidad en análisis
        document.querySelectorAll('#scaleStrengthSelector .strength-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('#scaleStrengthSelector .strength-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const desc = document.getElementById('scaleStrengthDesc');
                const strengthMap = {
                    suave: 'Ligero. Ideal para paladares delicados que buscan notas suaves.',
                    normal: 'Balanceado. Recomendación general para cafeteras de goteo.',
                    fuerte: 'Intenso. Mayor cuerpo y sabor pronunciado.'
                };
                desc.textContent = strengthMap[this.dataset.value] || strengthMap.normal;
                analyzeWithScale();
            });
        });

        // Marca en análisis
        document.getElementById('scaleBrand').addEventListener('change', analyzeWithScale);

        // ===== TEMPORIZADOR =====
        document.getElementById('timerStart').addEventListener('click', startTimer);
        document.getElementById('timerPause').addEventListener('click', pauseTimer);
        document.getElementById('timerReset').addEventListener('click', resetTimer);
        document.querySelectorAll('.timer-preset').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                timerSeconds = parseInt(this.dataset.seconds);
                updateTimerDisplay();
            });
        });

        // ===== RECETAS =====
        document.getElementById('recipeSearch').addEventListener('input', filterRecipes);
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterRecipes();
            });
        });

        // ===== MODAL =====
        document.querySelector('.modal-close').addEventListener('click', closeModal);
        document.getElementById('recipeModal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        // ===== CONVERSOR =====
        document.getElementById('converterBtn').addEventListener('click', convertUnits);

        // Teclado
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ========================================
    // CALCULADORA PRINCIPAL
    // ========================================
    function updateCalculator() {
        const water = AppState.calculator.water;
        const strength = AppState.calculator.strength;
        const brandId = document.getElementById('mainBrand').value || 'tostao';
        const brand = CoffeeMath.getBrand(brandId);

        const dose = CoffeeMath.getRecommendedDose(brandId, water);
        const factor = { suave: 0.85, normal: 1.0, fuerte: 1.15 }[strength] || 1.0;
        const finalGrams = Math.round(dose.grams * factor * 10) / 10;
        const finalSpoons = CoffeeMath.gramsToSpoons(finalGrams);
        const sugar = CoffeeMath.calculateSugar(water, 'medium');
        const caffeine = Math.round(finalGrams * 8);

        document.getElementById('coffeeSpoons').textContent = CoffeeMath.formatSpoon(finalSpoons) + ' cucharas';
        document.getElementById('coffeeGrams').textContent = `(${finalGrams}g aprox.)`;
        document.getElementById('caffeineAmount').textContent = `~${caffeine} mg`;
        document.getElementById('sugarAmount').textContent = sugar > 0 ? `${sugar} cucharadita${sugar > 1 ? 's' : ''}` : 'Sin azúcar';
        document.getElementById('brewTime').textContent = `~${Math.round(water / 60 + 2)} min`;
        document.getElementById('waterDisplay').textContent = `${water} ml`;
        document.getElementById('brandDisplay').textContent = `☕ ${brand.name}`;

        updateTip(water);
    }

    function updateTip(water) {
        const tip = document.getElementById('dynamicTip');
        if (!tip) return;
        if (water <= 150) {
            tip.textContent = '💡 Volumen pequeño: El sabor será más concentrado. Perfecto para una taza de café expreso.';
        } else if (water <= 300) {
            tip.textContent = '💡 Volumen ideal para una taza grande. Buen equilibrio de sabor.';
        } else if (water <= 450) {
            tip.textContent = '💡 Para 2-3 tazas. Asegúrate de repartir bien el café en el filtro.';
        } else {
            tip.textContent = '💡 Capacidad máxima. Consume el café recién preparado para disfrutar todo su aroma.';
        }
    }

    function calculateCustom() {
        const input = document.getElementById('customWater');
        const water = parseInt(input.value);
        if (isNaN(water) || water < 100 || water > 600) {
            document.getElementById('customResult').innerHTML = '<p style="color:var(--danger-color);">⚠️ Ingresa un valor entre 100 y 600 ml</p>';
            return;
        }
        const brandId = document.getElementById('mainBrand').value || 'tostao';
        const dose = CoffeeMath.getRecommendedDose(brandId, water);
        const sugar = CoffeeMath.calculateSugar(water, 'medium');
        document.getElementById('customResult').innerHTML = `
            <p>✅ <strong>${water} ml</strong> → <strong>${CoffeeMath.formatSpoon(dose.spoons)}</strong> cucharas (${dose.grams} g)</p>
            <p style="font-size:0.85rem;color:var(--text-muted);">
                ⏱ ~${Math.round(water/60+2)} min • 🍯 ${sugar > 0 ? sugar + ' cdt' + (sugar>1?'s':'') : 'Sin azúcar'}
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

        const brandData = INSTANT_COFFEE_MEASURES[brand] || { base: 3, name: 'Nescafé' };
        const baseGrams = brandData.base;
        const ratio = water / 100;
        const factor = { suave: 0.8, normal: 1.0, fuerte: 1.2 }[strength] || 1.0;
        const grams = baseGrams * ratio * factor;
        const teaspoons = Math.round(grams * 2) / 2;

        document.getElementById('instantResult').textContent = teaspoons + ' cucharadita' + (teaspoons > 1 ? 's' : '');
        document.getElementById('instantSub').textContent = `${brandData.name} - Intensidad ${strength}`;
        document.getElementById('instantWaterDisplay').textContent = water + ' ml';
    }

    // ========================================
    // ACUMULADOR DE CUCHARAS (ANÁLISIS)
    // ========================================
    function updateAccumulatedDisplay() {
        const spoons = CoffeeMath.gramsToSpoons(accumulatedCoffee);
        const gramsEl = document.getElementById('accumulatedGrams');
        const spoonsEl = document.getElementById('accumulatedSpoons');
        const countEl = document.getElementById('accumulatedCount');
        if (gramsEl) gramsEl.textContent = accumulatedCoffee.toFixed(1);
        if (spoonsEl) spoonsEl.textContent = CoffeeMath.formatSpoon(spoons);
        if (countEl) countEl.textContent = scoopHistory.length;
    }

    // ========================================
    // ANÁLISIS CON BÁSCULA (MEJORADO - CON ACUMULADOR)
    // ========================================
    function analyzeWithScale() {
        const totalWeight = parseFloat(document.getElementById('totalWeight').value);
        const water = parseInt(document.getElementById('scaleWater').value) || 250;
        const brandId = document.getElementById('scaleBrand').value || 'tostao';

        const activeStrength = document.querySelector('#scaleStrengthSelector .strength-btn.active');
        const strength = activeStrength ? activeStrength.dataset.value : 'normal';

        const spoonWeight = COFFEE_STANDARDS.imusa.spoon_grams;

        // Si hay café acumulado (se usó "Añadir cuchara"), usa ese total.
        // Si no, usa el modo clásico: lo que hay en el campo menos el peso de una cuchara.
        let coffeeGrams;
        let usingAccumulated = accumulatedCoffee > 0;

        if (usingAccumulated) {
            coffeeGrams = accumulatedCoffee;
        } else {
            coffeeGrams = totalWeight - spoonWeight;
        }

        if (!usingAccumulated && (isNaN(totalWeight) || totalWeight <= spoonWeight)) {
            document.getElementById('scaleResult').innerHTML = `
                <div class="analysis-card" style="border-left-color:var(--danger-color);">
                    <p style="color:var(--danger-color);">⚠️ Pesa una cucharada (café + cuchara) y presiona "➕ Añadir cuchara", o ingresa un peso mayor a ${spoonWeight}g.</p>
                </div>
            `;
            return;
        }

        if (coffeeGrams <= 0) {
            document.getElementById('scaleResult').innerHTML = `
                <div class="analysis-card" style="border-left-color:var(--danger-color);">
                    <p style="color:var(--danger-color);">⚠️ El peso del café debe ser mayor a 0g. Pesa más café.</p>
                </div>
            `;
            return;
        }

        const brand = CoffeeMath.getBrand(brandId);

        const strengthFactors = {
            suave: { ratio: 18, label: 'Suave', desc: 'Café ligero, ideal para paladares delicados' },
            normal: { ratio: 16.67, label: 'Normal', desc: 'Balanceado, recomendación SCA' },
            fuerte: { ratio: 14, label: 'Fuerte', desc: 'Café intenso, mayor cuerpo' }
        };

        const selectedStrength = strengthFactors[strength] || strengthFactors.normal;
        const idealRatio = selectedStrength.ratio;
        const recommendedGrams = Math.round((water / idealRatio) * 10) / 10;
        const recommendedSpoons = CoffeeMath.gramsToSpoons(recommendedGrams);

        const diff = Math.round((coffeeGrams - recommendedGrams) * 10) / 10;
        const diffSpoons = CoffeeMath.gramsToSpoons(Math.abs(diff));
        const ratio = Math.round((water / coffeeGrams) * 10) / 10;

        let realStrength = '', realColor = '', realEmoji = '☕', strengthClass = '';
        if (ratio >= 20) {
            realStrength = 'Muy Suave'; realColor = '#0d47a1'; strengthClass = 'muy-suave';
        } else if (ratio >= 17) {
            realStrength = 'Suave'; realColor = '#2e7d32'; strengthClass = 'suave';
        } else if (ratio >= 14.5) {
            realStrength = 'Normal'; realColor = '#e65100'; strengthClass = 'normal';
        } else if (ratio >= 12) {
            realStrength = 'Fuerte'; realColor = '#bf360c'; strengthClass = 'fuerte';
        } else {
            realStrength = 'Muy Fuerte'; realColor = '#880e4f'; strengthClass = 'muy-fuerte';
        }

        let status = '', statusIcon = '', message = '', diffBadge = '';
        const diffPercent = Math.abs(diff) / recommendedGrams;

        if (diffPercent < 0.05) {
            status = '✅ ¡Perfecto!';
            statusIcon = '🎯';
            message = `Tu preparación está en el punto exacto para un café ${selectedStrength.label.toLowerCase()}. ¡Excelente trabajo!`;
            diffBadge = '<span class="analysis-diff-badge perfect">🎯 Perfecto</span>';
        } else if (diff > 0) {
            status = '☕ Café más fuerte de lo deseado';
            statusIcon = '⬆️';
            const spoonsText = diffSpoons > 0 ? ` (≈${CoffeeMath.formatSpoon(diffSpoons)} cuchara${diffSpoons > 1 ? 's' : ''})` : '';
            message = `Estás usando ${diff.toFixed(1)}g${spoonsText} más de café de lo recomendado para un perfil ${selectedStrength.label.toLowerCase()}. Obtendrás un café con mayor cuerpo e intensidad.`;
            diffBadge = `<span class="analysis-diff-badge negative">➕ +${diff.toFixed(1)}g</span>`;
        } else {
            status = '☕ Café más suave de lo deseado';
            statusIcon = '⬇️';
            const spoonsText = diffSpoons > 0 ? ` (≈${CoffeeMath.formatSpoon(diffSpoons)} cuchara${diffSpoons > 1 ? 's' : ''})` : '';
            message = `Te faltan ${Math.abs(diff).toFixed(1)}g${spoonsText} de café para alcanzar el perfil ${selectedStrength.label.toLowerCase()}. El café será más ligero y de menor cuerpo.`;
            diffBadge = `<span class="analysis-diff-badge negative">➖ ${Math.abs(diff).toFixed(1)}g</span>`;
        }

        const sugar = CoffeeMath.calculateSugar(water, 'medium');
        const minRatio = 10, maxRatio = 22;
        const strengthPercent = Math.max(0, Math.min(100, ((ratio - minRatio) / (maxRatio - minRatio)) * 100));

        const coffeeSpoons = coffeeGrams / spoonWeight;
        const coffeeSpoonsDisplay = CoffeeMath.formatSpoon(coffeeSpoons);

        const sourceNote = usingAccumulated
            ? `<span style="font-size:0.75rem; color:var(--text-muted);">Calculado con ${scoopHistory.length} pesada${scoopHistory.length > 1 ? 's' : ''} acumulada${scoopHistory.length > 1 ? 's' : ''}.</span>`
            : '';

        document.getElementById('scaleResult').innerHTML = `
            <div class="analysis-card">
                <div class="analysis-status" style="border-left-color:${realColor};">
                    ${statusIcon} ${status}
                </div>

                <div class="analysis-info">
                    <div class="info-item">
                        <span class="info-label">☕ Café real</span>
                        <span class="info-value">${coffeeGrams.toFixed(1)}g ≈ ${coffeeSpoonsDisplay} cucharas</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">💧 Agua</span>
                        <span class="info-value">${water}ml</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">📊 Relación</span>
                        <span class="info-value">1:${ratio}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">🥄 Cucharadas pesadas</span>
                        <span class="info-value">${usingAccumulated ? scoopHistory.length : 1}</span>
                    </div>
                </div>

                <div class="analysis-result-strength ${strengthClass}">
                    ${realEmoji} ${realStrength}
                </div>

                <div class="strength-bar-container">
                    <div class="strength-fill" style="width:${strengthPercent}%;"></div>
                </div>
                <div class="strength-labels">
                    <span>Muy Suave</span>
                    <span style="font-weight:700;color:${realColor};">${realStrength}</span>
                    <span>Muy Fuerte</span>
                </div>

                <div class="analysis-message">
                    <p>${message}</p>
                </div>

                <div class="analysis-compare">
                    <div class="compare-item">
                        <span class="compare-label">Tu preparación</span>
                        <span class="compare-value">${coffeeGrams.toFixed(1)}g</span>
                        <span class="compare-sub">≈ ${coffeeSpoonsDisplay} cucharas</span>
                    </div>
                    <div class="compare-arrow">→</div>
                    <div class="compare-item recommended">
                        <span class="compare-label">Recomendación (${selectedStrength.label})</span>
                        <span class="compare-value">${recommendedGrams}g</span>
                        <span class="compare-sub">≈ ${CoffeeMath.formatSpoon(recommendedSpoons)} cucharas</span>
                    </div>
                </div>

                <div style="display:flex; justify-content:center; gap:16px; margin:8px 0; flex-wrap:wrap;">
                    ${diffBadge}
                    <span style="font-size:0.85rem; color:var(--text-muted);">
                        ${diff > 0 ? '➕' : '➖'} ${Math.abs(diff).toFixed(1)}g
                        ≈ ${CoffeeMath.formatSpoon(diffSpoons)} cuchara${diffSpoons > 1 ? 's' : ''}
                    </span>
                </div>

                <div class="analysis-sugar">
                    <span>🍯 Azúcar recomendada:</span>
                    <span>${sugar > 0 ? sugar + ' cucharadita' + (sugar > 1 ? 's' : '') : 'Sin azúcar'}</span>
                </div>

                <div class="analysis-recommendation-box">
                    <span class="title">📋 Perfil seleccionado: ${selectedStrength.label}</span>
                    <span class="value">${selectedStrength.desc}</span>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
                        Relación recomendada: 1:${idealRatio} (${recommendedGrams}g de café por ${water}ml de agua)
                    </p>
                </div>

                <div class="analysis-tip">
                    💡 La cuchara IMUSA pesa ${spoonWeight}g. Cada vez que presionas "Añadir cuchara" se resta ese peso y se suma el café real al acumulado.
                    <br>
                    <span style="font-size:0.75rem; color:var(--text-muted);">
                        Marca: ${brand.name} | Intensidad: ${brand.intensity}/10
                    </span>
                    <br>
                    ${sourceNote}
                </div>
            </div>
        `;
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
            if (activePreset) timerSeconds = parseInt(activePreset.dataset.seconds);
            else timerSeconds = 180;
            updateTimerDisplay();
        }
        timerRunning = true;
        timerInterval = setInterval(() => {
            if (timerSeconds <= 0) { timerComplete(); return; }
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
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start();
            setTimeout(() => osc.stop(), 500);
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
        const recipes = RECIPES.slice(0, 6);
        container.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" onclick="window.openRecipe('${recipe.id}')">
                <div class="recipe-card-image">${recipe.image || '☕'}</div>
                <div class="recipe-card-content">
                    <h4>${recipe.name}</h4>
                    <p>${recipe.time} min • ${recipe.difficulty}</p>
                </div>
                <button class="favorite-btn ${AppState.favorites.includes(recipe.id) ? 'active' : ''}"
                        onclick="event.stopPropagation(); window.toggleFavorite('${recipe.id}')">♥</button>
            </div>
        `).join('');

        const popularContainer = document.getElementById('popularRecipes');
        if (popularContainer) {
            popularContainer.innerHTML = recipes.slice(0, 4).map(recipe => `
                <div class="recipe-card" onclick="window.openRecipe('${recipe.id}')">
                    <div class="recipe-card-image">${recipe.image || '☕'}</div>
                    <div class="recipe-card-content">
                        <h4>${recipe.name}</h4>
                        <p>${recipe.time} min • ${recipe.difficulty}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    function filterRecipes() {
        const query = document.getElementById('recipeSearch').value.toLowerCase();
        const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        let filtered = RECIPES.filter(r => {
            const matchName = r.name.toLowerCase().includes(query);
            const matchFilter = filter === 'all' || r.tags.includes(filter);
            return matchName && matchFilter;
        });
        const container = document.getElementById('recipeGrid');
        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">No se encontraron recetas</p>';
            return;
        }
        container.innerHTML = filtered.map(recipe => `
            <div class="recipe-card" onclick="window.openRecipe('${recipe.id}')">
                <div class="recipe-card-image">${recipe.image || '☕'}</div>
                <div class="recipe-card-content">
                    <h4>${recipe.name}</h4>
                    <p>${recipe.time} min • ${recipe.difficulty}</p>
                </div>
                <button class="favorite-btn ${AppState.favorites.includes(recipe.id) ? 'active' : ''}"
                        onclick="event.stopPropagation(); window.toggleFavorite('${recipe.id}')">♥</button>
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
                <ol>${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            </div>
            ${recipe.tips ? `<div class="recipe-detail-section"><h3>💡 Consejo</h3><p>${recipe.tips}</p></div>` : ''}
            ${recipe.variants ? `<div class="recipe-detail-section"><h3>🔄 Variantes</h3><p>${recipe.variants}</p></div>` : ''}
            <div class="recipe-actions">
                <button class="btn-primary" onclick="window.toggleFavorite('${recipe.id}')">${isFavorite ? '❤️ Quitar de favoritos' : '🤍 Agregar a favoritos'}</button>
                <button class="btn-secondary" onclick="window.print()">🖨️ Imprimir</button>
            </div>
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        AppState.history = AppState.history.filter(id => id !== recipe.id);
        AppState.history.unshift(recipe.id);
        if (AppState.history.length > 20) AppState.history.pop();
        Utils.saveToStorage('imusaHistory', AppState.history);
    }

    function toggleFavorite(recipeId) {
        const index = AppState.favorites.indexOf(recipeId);
        if (index > -1) AppState.favorites.splice(index, 1);
        else AppState.favorites.push(recipeId);
        Utils.saveToStorage('imusaFavorites', AppState.favorites);
        renderRecipes();
        const modal = document.getElementById('recipeModal');
        if (modal && modal.classList.contains('active')) {
            const recipe = RECIPES.find(r => r.id === recipeId);
            if (recipe) openRecipe(recipeId);
        }
    }

    function showFavorites() {
        if (AppState.favorites.length === 0) {
            alert('📭 No tienes recetas favoritas guardadas.');
            return;
        }
        navigateTo('recipes');
        const container = document.getElementById('recipeGrid');
        const favRecipes = RECIPES.filter(r => AppState.favorites.includes(r.id));
        container.innerHTML = favRecipes.map(recipe => `
            <div class="recipe-card" onclick="window.openRecipe('${recipe.id}')">
                <div class="recipe-card-image">${recipe.image || '☕'}</div>
                <div class="recipe-card-content">
                    <h4>${recipe.name}</h4>
                    <p>${recipe.time} min • ${recipe.difficulty}</p>
                </div>
                <button class="favorite-btn active" onclick="event.stopPropagation(); window.toggleFavorite('${recipe.id}')">♥</button>
            </div>
        `).join('');
    }

    function closeModal() {
        const modal = document.getElementById('recipeModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
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
            document.getElementById('converterResult').innerHTML = '<p style="color:var(--danger-color);">⚠️ Ingresa un valor válido</p>';
            return;
        }
        const conversions = { ml: 1, g: 1, tbsp: 14.79, tsp: 4.93, oz: 29.57, cup: 236.59 };
        let base = value * conversions[from];
        let result = base / conversions[to];
        document.getElementById('converterResult').innerHTML = `<p><strong>${value}</strong> ${from} = <strong>${result.toFixed(2)}</strong> ${to}</p>`;
    }

    // ========================================
    // EXPONER GLOBALES
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
