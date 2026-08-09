// ========================================
// ☕ MI BARISTA IMUSA - DATA COMPLETA
// Basado en "Maestría en Café Filtrado Colombiano"
// ========================================

// ========================================
// 1. CONFIGURACIÓN DE ESTÁNDARES
// ========================================
const COFFEE_STANDARDS = {
    ratios: {
        muy_suave: { ratio: 20, desc: 'Muy ligero, poco cuerpo' },
        suave: { ratio: 18, desc: 'Ligero, ideal para paladares delicados' },
        normal: { ratio: 16.67, desc: 'Balanceado, recomendación SCA' },
        fuerte: { ratio: 14, desc: 'Intenso, mayor cuerpo' },
        muy_fuerte: { ratio: 12, desc: 'Muy intenso, cuerpo pesado' }
    },
    imusa: {
        max_water: 600,
        cups_max: 6,
        spoon_grams: 7,
        tsp_grams: 2,
        cup_ml: 150,
        mug_ml: 250,
        power: 950,
        capacity: 0.6
    },
    temperatures: {
        brewing: { min: 90, max: 96, optimal: 93 },
        milk: { min: 60, max: 70, optimal: 65 },
        serving: { min: 70, max: 85, optimal: 80 }
    },
    sugar: {
        none: 0,
        little: 0.04,
        medium: 0.08,
        much: 0.12
    }
};

// ========================================
// 2. MARCAS DE CAFÉ (16 MARCAS)
// ========================================
const BRANDS = [
    {
        id: 'tostao',
        name: 'Tostao',
        emoji: '☕',
        type: 'Mezcla (Blend)',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 8,
        acidity: 'Media',
        body: 'Medio-Alto',
        spoon_250ml: 1.25,
        grams_250ml: 8.7,
        flavor_notes: ['Chocolate Oscuro', 'Cacao', 'Caramelo'],
        best_for: ['Tinto', 'Mocha', 'Café con Leche'],
        description: 'Café de tueste oscuro, muy popular en Colombia. Económico y de buen cuerpo.'
    },
    {
        id: 'juan-valdez',
        name: 'Juan Valdez',
        emoji: '🇨🇴',
        type: '100% Arábica Premium',
        origin: 'Eje Cafetero',
        grind: 'Media',
        intensity: 7,
        acidity: 'Media-Alta',
        body: 'Medio',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Chocolate', 'Nuez', 'Caramelo', 'Frutos Rojos'],
        best_for: ['Todo tipo', 'Latte', 'Capuccino'],
        description: 'La marca insignia de Colombia. Café de alta calidad con tueste medio.'
    },
    {
        id: 'colina-balanceado',
        name: 'Colina Balanceado',
        emoji: '⛰️',
        type: 'Arábica Caracolito',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 6,
        acidity: 'Media-Baja',
        body: 'Medio',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Durazno', 'Chocolate Blanco', 'Crema', 'Caramelo'],
        best_for: ['Filtrado Balanceado', 'Tinto', 'Café con Leche'],
        description: 'Café de grano caracolito (esférico) de alta densidad. Notas de durazno y chocolate blanco.'
    },
    {
        id: 'sello-rojo',
        name: 'Sello Rojo',
        emoji: '🔴',
        type: 'Mezcla Comercial',
        origin: 'Colombia',
        grind: 'Media-Fina',
        intensity: 9,
        acidity: 'Baja',
        body: 'Alto / Pesado',
        spoon_250ml: 1.25,
        grams_250ml: 8.7,
        flavor_notes: ['Chocolate', 'Caramelo Quemado', 'Frutos Secos'],
        best_for: ['Tinto Fuerte', 'Mocha'],
        description: 'Tradición colombiana, tueste oscuro, cuerpo achocolatado y sabor intenso.'
    },
    {
        id: 'buendia-instant',
        name: 'Buendía Instantáneo',
        emoji: '🌅',
        type: 'Soluble Liofilizado',
        origin: 'Colombia',
        grind: 'No aplica',
        intensity: 6,
        acidity: 'Media / Cítrica',
        body: 'Medio',
        spoon_250ml: 2,
        grams_250ml: 4,
        flavor_notes: ['Caramelo', 'Cítricos'],
        best_for: ['Instantáneo', 'Rápido'],
        description: 'Café soluble liofilizado con notas cítricas y caramelizadas.'
    },
    {
        id: 'nescafe',
        name: 'Nescafé',
        emoji: '☕',
        type: 'Soluble Comercial',
        origin: 'Internacional',
        grind: 'No aplica',
        intensity: 6,
        acidity: 'Baja',
        body: 'Medio',
        spoon_250ml: 2,
        grams_250ml: 4,
        flavor_notes: ['Café Clásico'],
        best_for: ['Instantáneo', 'Rápido'],
        description: 'Café soluble comercial, liofilizado. Fácil preparación.'
    },
    {
        id: 'colcafe',
        name: 'Colcafé',
        emoji: '☕',
        type: 'Mezcla Comercial',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 6,
        acidity: 'Baja',
        body: 'Medio',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Caramelo', 'Frutos Secos', 'Chocolate Suave'],
        best_for: ['Todo tipo', 'Tinto', 'Café con Leche'],
        description: 'Tradición y sabor colombiano, tueste medio, cuerpo equilibrado.'
    },
    {
        id: 'aguila-roja',
        name: 'Águila Roja',
        emoji: '🦅',
        type: 'Mezcla Comercial',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 6,
        acidity: 'Baja',
        body: 'Medio-Alto',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Caramelo', 'Frutos Secos', 'Chocolate Suave'],
        best_for: ['Tinto Diario', 'Café con Leche'],
        description: 'Sabor tradicional colombiano, tueste medio, cuerpo equilibrado.'
    },
    {
        id: 'oma',
        name: 'Oma',
        emoji: '☕',
        type: 'Arábica Tradicional',
        origin: 'Eje Cafetero',
        grind: 'Media',
        intensity: 6,
        acidity: 'Media-Alta',
        body: 'Sedoso / Medio',
        spoon_250ml: 1.75,
        grams_250ml: 12.2,
        flavor_notes: ['Frutas Tropicales', 'Flores', 'Caramelo'],
        best_for: ['Filtrado', 'Cold Brew', 'Tinto Especial'],
        description: 'Café de especialidad, tueste medio, acidez brillante, notas frutales.'
    },
    {
        id: 'matiz',
        name: 'Matiz',
        emoji: '🎨',
        type: 'Arábica Excelso',
        origin: 'Eje Cafetero',
        grind: 'Media',
        intensity: 5,
        acidity: 'Delicada / Media',
        body: 'Medio-balanceado',
        spoon_250ml: 1.75,
        grams_250ml: 12.2,
        flavor_notes: ['Frutos Rojos', 'Caramelo', 'Miel', 'Flores Blancas'],
        best_for: ['Latte', 'Capuccino', 'Café con Leche'],
        description: 'Café suave y aromático, tueste medio, perfecto para desayunos.'
    },
    {
        id: 'san-alberto',
        name: 'San Alberto',
        emoji: '⭐',
        type: 'Arábica de Altura',
        origin: 'Sierra Nevada',
        grind: 'Media-Fina',
        intensity: 9,
        acidity: 'Media-Baja',
        body: 'Denso / Pesado',
        spoon_250ml: 1.25,
        grams_250ml: 8.7,
        flavor_notes: ['Chocolate Oscuro', 'Especias', 'Frutos Secos'],
        best_for: ['Espresso', 'Negro', 'Tinto Premium'],
        description: 'Café premium de alta montaña, tueste oscuro, cuerpo pesado.'
    },
    {
        id: 'devocion',
        name: 'Devoción',
        emoji: '🌿',
        type: 'Arábica Premium',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 5,
        acidity: 'Media-Alta',
        body: 'Sedoso / Medio',
        spoon_250ml: 1.75,
        grams_250ml: 12.2,
        flavor_notes: ['Frutos del Bosque', 'Cereza', 'Agraz', 'Cacao', 'Caramelo'],
        best_for: ['Cold Brew', 'Filtrado', 'Tinto Especial'],
        description: 'Café fresco y frutal, tueste medio. REQUIERE PREINFUSIÓN de 30 segundos.'
    },
    {
        id: 'amor-perfecto',
        name: 'Amor Perfecto',
        emoji: '❤️',
        type: 'Arábica Especialidad',
        origin: 'La Unión, Nariño',
        grind: 'Media',
        intensity: 6,
        acidity: 'Media / Málica',
        body: 'Cremoso',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Chocolate', 'Panela', 'Miel', 'Frutos Rojos', 'Cítricos'],
        best_for: ['Filtrado', 'Tinto Especial', 'Cold Brew'],
        description: 'Café de especialidad de Nariño, suelos volcánicos, alta densidad.'
    },
    {
        id: 'cafe-quindio',
        name: 'Café Quindío',
        emoji: '🏔️',
        type: 'Arábica de Origen',
        origin: 'Quindío',
        grind: 'Media',
        intensity: 6,
        acidity: 'Media-Baja',
        body: 'Medio',
        spoon_250ml: 1.75,
        grams_250ml: 12.2,
        flavor_notes: ['Caramelo', 'Frutos Tropicales', 'Cítricos'],
        best_for: ['Filtrado', 'Tinto', 'Cold Brew'],
        description: 'Café del Eje Cafetero, acidez brillante, notas a caramelo y frutas.'
    },
    {
        id: 'cafe-narino',
        name: 'Café Nariño',
        emoji: '🌋',
        type: 'Arábica de Origen',
        origin: 'Nariño',
        grind: 'Media',
        intensity: 8,
        acidity: 'Alta / Brillante',
        body: 'Medio',
        spoon_250ml: 1.75,
        grams_250ml: 12.2,
        flavor_notes: ['Flores', 'Frutos Tropicales', 'Caramelo', 'Cítricos'],
        best_for: ['Filtrado', 'Tinto', 'Cold Brew'],
        description: 'Café de Nariño con notas florales y acidez brillante.'
    }
];

// ========================================
// 3. CAFÉ INSTANTÁNEO - MEDIDAS
// ========================================
const INSTANT_COFFEE_MEASURES = {
    'nescafe': { base: 3, name: 'Nescafé Tradición' },
    'juan-valdez': { base: 2, name: 'Juan Valdez Instantáneo' },
    'colcafe': { base: 3, name: 'Colcafé Clásico' },
    'buendia-instant': { base: 3, name: 'Buendía Liofilizado' },
    'aguila-roja': { base: 4, name: 'Águila Roja Soluble' },
    'sello-rojo': { base: 4, name: 'Sello Rojo Soluble' }
};

// ========================================
// 4. GUÍAS
// ========================================
const GUIDES = [
    {
        id: 'evitar-amargor',
        title: 'Cómo evitar el amargor excesivo',
        icon: '😖',
        content: 'El amargor excesivo (sobreextracción) se produce cuando el agua permanece demasiado tiempo en contacto con el café. Soluciones: (1) Evite moliendas extremadamente finas, (2) Limpie los aceites rancios del portafiltro, (3) Diluya con agua caliente en lugar de forzar extracción prolongada.'
    },
    {
        id: 'evitar-acidez',
        title: 'Cómo evitar la acidez desagradable',
        icon: '😣',
        content: 'Una acidez agria y metálica es síntoma de subextracción. Soluciones: (a) Incremente la cantidad de café, (b) Reduzca la granulometría, (c) Realice una preinfusión de 30 segundos con agua caliente.'
    },
    {
        id: 'almacenar-cafe',
        title: 'Protocolo de Almacenamiento Correcto',
        icon: '📦',
        content: 'Almacene el café en su bolsa hermética original (con válvula) o en recipiente opaco. Evite el refrigerador o congelador. Adquiera café en grano y muela solo la cantidad a consumir.'
    },
    {
        id: 'limpiar-cafetera',
        title: 'Limpieza y Descalcificación',
        icon: '🧹',
        content: 'Protocolo: (1) Disuelva ácido cítrico al 5% en agua, (2) Ejecute un ciclo sin café, (3) Realice 3 ciclos de enjuague con agua limpia. Frecuencia: cada 2-3 meses.'
    },
    {
        id: 'preinfusion',
        title: 'Técnica de Preinfusión',
        icon: '💧',
        content: 'Para cafés ultra-frescos (Devoción, Amor Perfecto): vierta 20ml de agua caliente sobre el filtro seco durante 30 segundos antes de encender la máquina. Esto estabiliza la cama y expande las células gaseosas del café.'
    },
    {
        id: 'temperaturas',
        title: 'Temperaturas Recomendadas',
        icon: '🌡️',
        content: 'Agua de extracción: 90-96°C (óptimo 93°C). Leche: 60-70°C (óptimo 65°C). Servicio: 70-85°C (óptimo 80°C). Use termómetro para precisión.'
    }
];

// ========================================
// 5. RECETAS
// ========================================
const RECIPES = [
    {
        id: 'tinto-tradicional',
        name: 'Tinto Tradicional Colombiano',
        category: 'colombiano',
        tags: ['colombian', 'hot', 'traditional'],
        difficulty: 'fácil',
        time: 5,
        image: '☕',
        servings: 1,
        water_ml: 250,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        sugar_spoons: 1,
        steps: [
            'Enjuaga el filtro con agua caliente',
            'Agrega 1½ cucharas de café (10.5g) al filtro',
            'Pon el azúcar en la jarra de vidrio',
            'Vierte 250ml de agua en el depósito',
            'Enciende y espera a que gotee completamente',
            'Retira la jarra de la placa caliente inmediatamente'
        ],
        tips: 'Precalienta la taza. El café no debe reposar en la placa caliente más de 15 minutos.'
    },
    {
        id: 'cafe-con-leche',
        name: 'Café con Leche Clásico',
        category: 'colombiano',
        tags: ['hot', 'milk', 'traditional'],
        difficulty: 'fácil',
        time: 7,
        image: '🥛',
        servings: 1,
        water_ml: 100,
        coffee_spoons: 2,
        coffee_grams: 14,
        milk_ml: 100,
        sugar_spoons: 1,
        steps: [
            'Prepara concentrado: 100ml agua + 2 cucharas café (14g)',
            'Calienta la leche a 65°C (no hervir)',
            'Mezcla el concentrado con la leche caliente',
            'Endulza al gusto'
        ],
        tips: 'La leche debe estar caliente pero no hervida para no alterar su sabor.'
    },
    {
        id: 'cafe-panela',
        name: 'Café con Panela (Campesino)',
        category: 'colombiano',
        tags: ['colombian', 'hot', 'sweet'],
        difficulty: 'fácil',
        time: 6,
        image: '🍯',
        servings: 1,
        water_ml: 200,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        special_ingredients: ['Panela rallada: 15g', 'Canela (opcional)'],
        steps: [
            'Coloca la panela rallada y la canela en la jarra',
            'Agrega 1½ cucharas de café (10.5g) al filtro',
            'Vierte 200ml de agua en el depósito',
            'Enciende la cafetera y espera',
            'El café caliente disolverá la panela',
            'Remueve al final para mezclar bien'
        ],
        tips: 'La panela le da un dulzor acaramelado inconfundible.'
    },
    {
        id: 'cafe-cargado',
        name: 'Tinto Cargado (Fuerte)',
        category: 'colombiano',
        tags: ['colombian', 'hot', 'strong'],
        difficulty: 'fácil',
        time: 5,
        image: '☕',
        servings: 1,
        water_ml: 150,
        coffee_spoons: 2,
        coffee_grams: 14,
        sugar_spoons: 0,
        steps: [
            'Coloca 2 cucharas de café (14g) en el filtro',
            'Vierte 150ml de agua en el depósito',
            'La extracción será más lenta - ¡es normal!',
            'No remuevas la cama de café durante la extracción',
            'Obtendrás unos 120ml de café intenso'
        ],
        tips: 'Este café es para los que buscan contundencia. Perfecto para comenzar el día.'
    },
    {
        id: 'latte-clasico',
        name: 'Latte Clásico',
        category: 'latte',
        tags: ['hot', 'milk'],
        difficulty: 'medio',
        time: 8,
        image: '☕',
        servings: 1,
        water_ml: 100,
        coffee_spoons: 2,
        coffee_grams: 14,
        milk_ml: 200,
        steps: [
            'Prepara concentrado: 100ml agua + 2 cucharas café (14g)',
            'Calienta y espuma la leche (200ml) a 65°C',
            'Vierte la leche espumada sobre el concentrado'
        ],
        tips: 'Usa leche entera para mejor textura de espuma.'
    },
    {
        id: 'iced-coffee',
        name: 'Iced Coffee Clásico',
        category: 'frappe',
        tags: ['cold', 'iced'],
        difficulty: 'fácil',
        time: 5,
        image: '🧊',
        servings: 1,
        water_ml: 180,
        coffee_spoons: 2,
        coffee_grams: 14,
        special_ingredients: ['Hielo: 120g'],
        steps: [
            'Coloca el hielo en la jarra de la Imusa (sin la cesta)',
            'Pon 2 cucharas de café (14g) en el filtro',
            'Vierte 180ml de agua en el depósito',
            'Enciende: el café goteará sobre el hielo',
            'Sirve inmediatamente con más hielo'
        ],
        tips: 'El enfriamiento rápido conserva los aromas del café.'
    }
];

// ========================================
// 6. CoffeeMath - FUNCIONES DE CÁLCULO
// ========================================
const CoffeeMath = {
    gramsToSpoons: function(grams) {
        if (!grams || grams <= 0) return 0;
        const spoons = grams / COFFEE_STANDARDS.imusa.spoon_grams;
        return Math.round(spoons * 4) / 4;
    },
    spoonsToGrams: function(spoons) {
        if (!spoons || spoons <= 0) return 0;
        return spoons * COFFEE_STANDARDS.imusa.spoon_grams;
    },
    formatSpoon: function(value) {
        if (!value || value <= 0) return '0';
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
        return (whole + frac).toFixed(2);
    },
    getBrand: function(id) {
        return BRANDS.find(b => b.id === id) || BRANDS[0];
    },
    getRecommendedDose: function(brandId, water_ml) {
        const brand = this.getBrand(brandId);
        const baseGrams = brand.grams_250ml || 10.5;
        const ratio = water_ml / 250;
        const grams = baseGrams * ratio;
        const spoons = this.gramsToSpoons(grams);
        return {
            grams: Math.round(grams * 10) / 10,
            spoons: Math.round(spoons * 4) / 4
        };
    },
    calculateSugar: function(water_ml, level = 'medium') {
        const sugarPerMl = COFFEE_STANDARDS.sugar[level] || 0.08;
        const grams = water_ml * sugarPerMl;
        const teaspoons = grams / 5;
        return Math.round(teaspoons * 4) / 4;
    },
    analyzeWithScale: function(totalWeight, water_ml, brandId) {
        const spoonWeight = COFFEE_STANDARDS.imusa.spoon_grams;
        const coffeeGrams = totalWeight - spoonWeight;
        if (coffeeGrams <= 0) {
            return { error: 'El peso total debe ser mayor a 7g (peso de la cuchara)' };
        }
        const brand = this.getBrand(brandId);
        const recommended = this.getRecommendedDose(brandId, water_ml);
        const diff = coffeeGrams - recommended.grams;
        const diffSpoons = this.gramsToSpoons(Math.abs(diff));
        const ratio = water_ml / coffeeGrams;
        const spoons = this.gramsToSpoons(coffeeGrams);

        let strength = '', level = '', color = '', emoji = '☕';
        if (ratio >= 20) { strength = 'Muy Suave'; level = 'muy-suave'; color = '#0d47a1'; }
        else if (ratio >= 17) { strength = 'Suave'; level = 'suave'; color = '#2e7d32'; }
        else if (ratio >= 14.5) { strength = 'Normal'; level = 'normal'; color = '#e65100'; }
        else if (ratio >= 12) { strength = 'Fuerte'; level = 'fuerte'; color = '#bf360c'; }
        else { strength = 'Muy Fuerte'; level = 'muy-fuerte'; color = '#880e4f'; }

        let status = '', message = '';
        if (Math.abs(diff) / recommended.grams < 0.05) {
            status = '✅ ¡Perfecto!';
            message = 'Tu preparación está en el punto exacto. ¡Excelente trabajo!';
        } else if (diff > 0) {
            status = '☕ Café más fuerte';
            message = `Estás usando ${diff.toFixed(1)}g más de café. Obtendrás un café con mayor cuerpo.`;
        } else {
            status = '☕ Café más suave';
            message = `Te faltan ${Math.abs(diff).toFixed(1)}g de café. El café será más ligero.`;
        }

        return {
            totalWeight: Math.round(totalWeight * 10) / 10,
            coffeeGrams: Math.round(coffeeGrams * 10) / 10,
            spoons: Math.round(spoons * 4) / 4,
            spoonsDisplay: this.formatSpoon(spoons),
            water_ml: water_ml,
            ratio: Math.round(ratio * 10) / 10,
            strength: strength,
            level: level,
            color: color,
            emoji: emoji,
            status: status,
            message: message,
            recommended: {
                grams: recommended.grams,
                spoons: recommended.spoons,
                spoonsDisplay: this.formatSpoon(recommended.spoons)
            },
            diff: Math.round(diff * 10) / 10,
            diffSpoons: Math.round(diffSpoons * 4) / 4,
            diffSpoonsDisplay: this.formatSpoon(diffSpoons),
            sugar: this.calculateSugar(water_ml, 'medium'),
            brand: brand.name,
            brandId: brand.id
        };
    }
};

// ========================================
// EXPORTAR
// ========================================
window.COFFEE_STANDARDS = COFFEE_STANDARDS;
window.BRANDS = BRANDS;
window.INSTANT_COFFEE_MEASURES = INSTANT_COFFEE_MEASURES;
window.GUIDES = GUIDES;
window.RECIPES = RECIPES;
window.CoffeeMath = CoffeeMath;

console.log('☕ Mi Barista Imusa - Data cargada correctamente');
console.log(`📚 ${BRANDS.length} marcas disponibles`);
console.log(`📖 ${RECIPES.length} recetas cargadas`);
