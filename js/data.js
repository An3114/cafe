// ========================================
// ☕ MI BARISTA IMUSA - DATA COMPLETA
// Basado en "Maestría en Café Filtrado Colombiano"
// Manual Técnico de Extracción y Recetario Maestre
// Fuente: Gemini Notebook - Edición Especial 2026
// ========================================

// ========================================
// 1. CONFIGURACIÓN DE ESTÁNDARES
// ========================================
const COFFEE_STANDARDS = {
    // Relaciones café/agua según SCA
    ratios: {
        muy_suave: { ratio: 20, desc: 'Muy ligero, poco cuerpo' },
        suave: { ratio: 18, desc: 'Ligero, ideal para paladares delicados' },
        normal: { ratio: 16.67, desc: 'Balanceado, recomendación SCA' },
        fuerte: { ratio: 14, desc: 'Intenso, mayor cuerpo' },
        muy_fuerte: { ratio: 12, desc: 'Muy intenso, cuerpo pesado' }
    },
    
    // Especificaciones Imusa Café City
    imusa: {
        max_water: 600, // ml
        cups_max: 6,    // tazas de 100ml
        spoon_grams: 7, // 1 cuchara IMUSA = 7g (según manual)
        tsp_grams: 2,   // 1 cucharadita = 2g para instantáneo
        cup_ml: 150,    // pocillo estándar
        mug_ml: 250,    // tazón promedio
        power: 950,     // watts
        capacity: 0.6   // litros
    },
    
    // Temperaturas recomendadas
    temperatures: {
        brewing: { min: 90, max: 96, optimal: 93 },
        milk: { min: 60, max: 70, optimal: 65 },
        serving: { min: 70, max: 85, optimal: 80 }
    },
    
    // Tiempos de extracción
    brew_times: {
        min: 180,
        max: 300,
        optimal: 240
    },
    
    // Azúcar recomendada (gramos por volumen)
    sugar: {
        none: 0,
        little: 0.04,   // 4g por 100ml
        medium: 0.08,   // 8g por 100ml
        much: 0.12      // 12g por 100ml
    }
};

// ========================================
// 2. LAS 49 MARCAS DE CAFÉ COLOMBIANO
// ========================================
const BRANDS = [
    // ===== MARCAS PRINCIPALES =====
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
        description: 'La marca insignia de Colombia. Café de alta calidad con tueste medio y notas a chocolate y nuez.'
    },
    {
        id: 'tostao',
        name: 'Tostao',
        emoji: '☕',
        type: 'Mezcla (Blend)',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 8,
        acidity: 'No disponible',
        body: 'Medio-Alto',
        spoon_250ml: 1.25,
        grams_250ml: 8.7,
        flavor_notes: ['Chocolate Oscuro', 'Cacao', 'Caramelo'],
        best_for: ['Tinto', 'Mocha', 'Café con Leche'],
        description: 'Café de tueste oscuro, muy popular en Colombia. Económico y de buen cuerpo.'
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
        description: 'Sabor tradicional colombiano, tueste medio, cuerpo equilibrado y aromático.'
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
        description: 'Café de especialidad, tueste medio, acidez brillante, notas frutales y florales.'
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
        description: 'Café suave y aromático, tueste medio, perfecto para desayunos y momentos especiales.'
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
        description: 'Tradición y sabor colombiano, tueste medio, cuerpo equilibrado y familiar.'
    },
    {
        id: 'buendia',
        name: 'Buendía',
        emoji: '🌅',
        type: 'Mezcla Liofilizada',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 6,
        acidity: 'Cítrica / Media',
        body: 'Medio',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Caramelo', 'Frutos Secos', 'Panela', 'Cítricos'],
        best_for: ['Tinto', 'Café con Leche'],
        description: 'Café de tueste medio, sabor tradicional y excelente relación calidad-precio.'
    },
    {
        id: 'lukafe',
        name: 'Lukafe',
        emoji: '☕',
        type: 'Arábica Tradicional',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 6,
        acidity: 'Baja',
        body: 'Medio',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Caramelo', 'Chocolate', 'Frutos Secos'],
        best_for: ['Latte', 'Café con Leche', 'Tinto'],
        description: 'Café de origen colombiano, tueste medio, balance y dulzor natural.'
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
        description: 'Café del Eje Cafetero, acidez brillante, notas a caramelo y frutas tropicales.'
    },

    // ===== MARCAS PREMIUM =====
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
        description: 'Café premium de alta montaña, tueste oscuro, cuerpo pesado, notas achocolatadas.'
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
        description: 'Café fresco y frutal, tueste medio, notas a frutas tropicales. REQUIERE PREINFUSIÓN de 30 segundos.'
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
        description: 'Café de especialidad de Nariño, suelos volcánicos, alta densidad celular. Notas dulces y acidez cítrica.'
    },
    {
        id: 'cafe-florez',
        name: 'Café Florez',
        emoji: '🌺',
        type: 'Arábica Selección',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 6,
        acidity: 'Media',
        body: 'Medio',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Flores', 'Frutos Rojos', 'Caramelo', 'Cítricos'],
        best_for: ['Filtrado', 'Tinto Especial'],
        description: 'Café premium con notas florales y frutales. Tueste medio y cuerpo equilibrado.'
    },
    {
        id: 'la-palma',
        name: 'La Palma',
        emoji: '🌴',
        type: 'Arábica (Procesos Especiales)',
        origin: 'Cundinamarca',
        grind: 'Media',
        intensity: 6,
        acidity: 'Media-Alta',
        body: 'Viscoso / Alto',
        spoon_250ml: 1.75,
        grams_250ml: 12.2,
        flavor_notes: ['Azúcares Caramelizados', 'Frutas Exóticas', 'Vainilla'],
        best_for: ['Filtrado', 'Cold Brew', 'Tinto Especial'],
        description: 'Café con fermentación anaeróbica láctica. Alta viscosidad y cuerpo pesado. USAR AGUA PURIFICADA.'
    },
    {
        id: 'azahar',
        name: 'Azahar',
        emoji: '🌸',
        type: 'Arábica Especialidad',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 5,
        acidity: 'Alta / Brillante',
        body: 'Ligero / Medio',
        spoon_250ml: 1.75,
        grams_250ml: 12.2,
        flavor_notes: ['Flores', 'Frutos Rojos', 'Cítricos', 'Miel'],
        best_for: ['Filtrado', 'Cold Brew', 'Tinto Especial'],
        description: 'Café de especialidad con notas florales y frutales. Tueste medio-claro.'
    },

    // ===== MARCAS REGIONALES =====
    {
        id: 'cafe-sierra',
        name: 'Café de la Sierra',
        emoji: '🏔️',
        type: 'Arábica',
        origin: 'Sierra Nevada',
        grind: 'Media',
        intensity: 7,
        acidity: 'Baja',
        body: 'Robusto',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Chocolate', 'Frutos Secos', 'Caramelo'],
        best_for: ['Tinto Especial', 'Café Negro'],
        description: 'Café de la Sierra Nevada con cuerpo robusto y notas achocolatadas.'
    },
    {
        id: 'cafe-santander',
        name: 'Café Santander',
        emoji: '🏔️',
        type: 'Arábica de Origen',
        origin: 'Santander',
        grind: 'Media',
        intensity: 7,
        acidity: 'Media-Baja',
        body: 'Denso / Pesado',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Caramelo', 'Frutos Secos', 'Chocolate Suave'],
        best_for: ['Tinto', 'Café con Leche'],
        description: 'Café de la región de Santander con tueste medio y notas a caramelo.'
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
        description: 'Café de Nariño con notas florales y acidez brillante. Tueste medio.'
    },
    {
        id: 'cafe-huila',
        name: 'Café Huila',
        emoji: '🌄',
        type: 'Arábica de Origen',
        origin: 'Huila',
        grind: 'Media',
        intensity: 7,
        acidity: 'Media-Alta',
        body: 'Medio',
        spoon_250ml: 1.5,
        grams_250ml: 10.5,
        flavor_notes: ['Frutos Rojos', 'Caramelo', 'Cítricos', 'Flores'],
        best_for: ['Filtrado', 'Tinto', 'Cold Brew'],
        description: 'Café del Huila, conocido por su acidez brillante y notas frutales.'
    },

    // ===== CAFÉS INSTANTÁNEOS =====
    {
        id: 'nescafe',
        name: 'Nescafé (Colombia)',
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
        id: 'juan-valdez-instant',
        name: 'Juan Valdez Instantáneo',
        emoji: '🇨🇴',
        type: 'Soluble Liofilizado',
        origin: 'Colombia',
        grind: 'No aplica',
        intensity: 6,
        acidity: 'Media',
        body: 'Medio',
        spoon_250ml: 1.5,
        grams_250ml: 3,
        flavor_notes: ['Caramelo', 'Nuez', 'Chocolate'],
        best_for: ['Instantáneo Premium'],
        description: 'Café soluble liofilizado de alta calidad con notas a caramelo y nuez.'
    },
    {
        id: 'colcafe-instant',
        name: 'Colcafé Instantáneo',
        emoji: '☕',
        type: 'Soluble Comercial',
        origin: 'Colombia',
        grind: 'No aplica',
        intensity: 6,
        acidity: 'Baja',
        body: 'Medio',
        spoon_250ml: 2,
        grams_250ml: 4,
        flavor_notes: ['Café Clásico'],
        best_for: ['Instantáneo', 'Rápido'],
        description: 'Café soluble comercial de tradición colombiana.'
    },
    {
        id: 'aguila-instant',
        name: 'Águila Roja Instantáneo',
        emoji: '🦅',
        type: 'Soluble Comercial',
        origin: 'Colombia',
        grind: 'No aplica',
        intensity: 6,
        acidity: 'Baja',
        body: 'Medio-Alto',
        spoon_250ml: 2.5,
        grams_250ml: 5,
        flavor_notes: ['Café Clásico', 'Caramelo'],
        best_for: ['Instantáneo', 'Tinto Rápido'],
        description: 'Café soluble de sabor tradicional colombiano.'
    },
    {
        id: 'sello-instant',
        name: 'Sello Rojo Instantáneo',
        emoji: '🔴',
        type: 'Soluble Comercial',
        origin: 'Colombia',
        grind: 'No aplica',
        intensity: 6,
        acidity: 'Baja',
        body: 'Medio-Alto',
        spoon_250ml: 2.5,
        grams_250ml: 5,
        flavor_notes: ['Café Intenso', 'Caramelo'],
        best_for: ['Instantáneo Fuerte'],
        description: 'Café soluble de tueste oscuro y sabor intenso.'
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

    // ===== MARCAS ESPECIALES (CON INFORMACIÓN) =====
    {
        id: 'cafe-pergamino',
        name: 'Café Pergamino',
        emoji: '☕',
        type: 'Arábica Especialidad',
        origin: 'Colombia',
        grind: 'Media',
        intensity: 6,
        acidity: 'Media-Alta',
        body: 'Medio-sedoso',
        spoon_250ml: 1.75,
        grams_250ml: 12.2,
        flavor_notes: ['Frutos Rojos', 'Caramelo', 'Flores'],
        best_for: ['Filtrado', 'Tinto Especial'],
        description: 'Café de especialidad con notas frutales y sedosas.'
    },
    {
        id: 'cafe-colina',
        name: 'Café La Colina (Caracolito)',
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
    }
];

// ========================================
// 3. LAS 22 RECETAS DEL MANUAL
// ========================================
const RECIPES = [
    // ===== CAFÉS BÁSICOS =====
    {
        id: 'tinto-campesino',
        name: 'Tinto Campesino Tradicional',
        category: 'colombiano',
        tags: ['colombian', 'hot', 'sweet', 'spiced'],
        difficulty: 'fácil',
        time: 5,
        image: '☕',
        servings: 1,
        water_ml: 250,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        sugar_spoons: 0,
        special_ingredients: ['Panela rallada: 15g', 'Canela: 1 trozo pequeño', 'Clavo de olor: 1'],
        steps: [
            'Hervir el agua con la panela rallada, la canela y el clavo de olor',
            'Al hervir, apagar el fuego e incorporar el café molido removiendo suavemente',
            'Dejar reposar por 3 minutos para permitir la decantación',
            'Filtrar y servir inmediatamente en pocillos de barro o cerámica'
        ],
        tips: 'Para evitar amargor, nunca deje hervir el café una vez agregado al agua dulce caliente.',
        variants: 'Reemplace los clavos por cáscara de limón para una variación cítrica regional.',
        temperature: 92,
        brew_time: 3,
        result: 'Café dulce con notas especiadas y cuerpo medio',
        presentation: 'Pocillo de barro tradicional'
    },
    {
        id: 'cafe-negro-filtro',
        name: 'Café Negro de Filtro Clásico',
        category: 'colombiano',
        tags: ['colombian', 'hot', 'traditional'],
        difficulty: 'fácil',
        time: 5,
        image: '☕',
        servings: 1,
        water_ml: 250,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        sugar_spoons: 0,
        special_ingredients: ['Agua de baja mineralización'],
        steps: [
            'Colocar el café de molienda media en el filtro permanente',
            'Añadir los 250 ml de agua potable fría en el depósito',
            'Encender la cafetera Imusa Café City y dejar que el ciclo se ejecute por completo',
            'Servir inmediatamente para disfrutar del aroma puro'
        ],
        tips: 'Prelave el filtro permanente antes de cada preparación para eliminar aceites viejos.',
        variants: 'Use papel de filtro No. 2 sobre el portafiltro para una taza de mayor claridad.',
        temperature: 94,
        brew_time: 4,
        result: 'Café limpio, balanceado y aromático',
        presentation: 'Taza de cerámica precalentada'
    },
    {
        id: 'cafe-cargado',
        name: 'Café Cargado de Alta Extracción',
        category: 'colombiano',
        tags: ['colombian', 'hot', 'strong'],
        difficulty: 'fácil',
        time: 6,
        image: '☕',
        servings: 1,
        water_ml: 250,
        coffee_spoons: 2,
        coffee_grams: 14.0,
        sugar_spoons: 0,
        special_ingredients: ['Café de tostión oscura'],
        steps: [
            'Colocar el café de molienda fina-media en el portafiltro',
            'Verter los 250 ml de agua fría en el depósito',
            'Activar la preparación y esperar a que caiga todo el extracto denso',
            'Mezclar suavemente en la jarra para homogeneizar el cuerpo'
        ],
        tips: 'La dosificación alta incrementa los sólidos disueltos (TDS%), proporcionando un cuerpo robusto.',
        variants: 'Diluya con 50ml de agua caliente si el cuerpo resulta excesivamente denso.',
        temperature: 93,
        brew_time: 5,
        result: 'Café de cuerpo pesado y alta intensidad',
        presentation: 'Taza pequeña de cerámica'
    },

    // ===== CAFÉS CON LECHE =====
    {
        id: 'cafe-con-leche-cremoso',
        name: 'Café con Leche Cremoso',
        category: 'colombiano',
        tags: ['hot', 'milk', 'traditional'],
        difficulty: 'fácil',
        time: 5,
        image: '🥛',
        servings: 1,
        water_ml: 150,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 100,
        sugar_spoons: 1,
        special_ingredients: ['Leche entera fresca de alta densidad'],
        steps: [
            'Preparar un café concentrado por goteo utilizando los 150 ml de agua',
            'Calentar la leche entera sin que llegue a hervir (máx 65°C)',
            'Verter la leche caliente en la taza, luego incorporar el café recién filtrado',
            'Remover para unificar la emulsión y servir inmediatamente'
        ],
        tips: 'Caliente la leche a un máximo de 65°C para preservar su dulzura natural y no desnaturalizar proteínas.',
        variants: 'Utilice leche evaporada para una textura sumamente untuosa.',
        temperature: 92,
        brew_time: 4,
        result: 'Café cremoso, suave y bien equilibrado',
        presentation: 'Taza de vidrio o cerámica'
    },
    {
        id: 'cortado-mesa',
        name: 'Cortado de Mesa Tradicional',
        category: 'colombiano',
        tags: ['hot', 'milk', 'small'],
        difficulty: 'fácil',
        time: 4,
        image: '☕',
        servings: 1,
        water_ml: 180,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 70,
        sugar_spoons: 0,
        special_ingredients: ['Microespuma de leche'],
        steps: [
            'Extraer el café por goteo tradicional en la jarra de vidrio',
            'Servir el café en una taza pequeña o vaso de vidrio de 200 ml',
            'Añadir con cuidado la leche vaporizada caliente, "cortando" suavemente el color oscuro',
            'Terminar con una fina capa de espuma en la superficie'
        ],
        tips: 'El uso de un café con notas achocolatadas complementa de forma idónea la leche.',
        variants: 'Pruebe con leche condensada en la base para hacer un café "Bombón" colombiano.',
        temperature: 94,
        brew_time: 3,
        result: 'Café con toque de leche, cuerpo medio',
        presentation: 'Vaso de vidrio pequeño'
    },

    // ===== LATTES Y ESPECIALIDADES =====
    {
        id: 'cafe-panela-latte',
        name: 'Café con Panela y Leche',
        category: 'latte',
        tags: ['hot', 'milk', 'sweet'],
        difficulty: 'fácil',
        time: 5,
        image: '🍯',
        servings: 1,
        water_ml: 120,
        coffee_spoons: 1.75,
        coffee_grams: 12.2,
        milk_ml: 130,
        sugar_spoons: 0,
        special_ingredients: ['Panela rallada: 12g', 'Canela en polvo'],
        steps: [
            'Disolver la panela rallada directamente en el agua fría del depósito',
            'Filtrar el café en la Imusa para obtener una base muy concentrada',
            'Calentar y espumar ligeramente la leche en una prensa francesa',
            'Verter el café dulce en una taza de 300 ml, añadir la leche texturizada y espolvorear canela'
        ],
        tips: 'Para disolver panela, se recomienda pre-mezclar en la taza final con leche caliente antes de verter café.',
        variants: 'Incorpore un toque de clavo de olor molido en la superficie para una nota más aromática.',
        temperature: 93,
        brew_time: 4,
        result: 'Café dulce con notas a panela y canela',
        presentation: 'Taza grande de 300ml'
    },
    {
        id: 'cappuccino-clasico',
        name: 'Capuccino Clásico Imusa',
        category: 'latte',
        tags: ['hot', 'milk', 'foam'],
        difficulty: 'medio',
        time: 7,
        image: '☕',
        servings: 1,
        water_ml: 100,
        coffee_spoons: 1.75,
        coffee_grams: 12.2,
        milk_ml: 150,
        sugar_spoons: 1,
        special_ingredients: ['Cacao en polvo o chocolate rallado'],
        steps: [
            'Preparar la base de café ultra-concentrada con poca agua',
            'Cremar los 150 ml de leche entera caliente usando un batidor de inmersión',
            'Verter la leche texturizada en una taza grande, permitiendo que la espuma flote',
            'Verter lentamente el café concentrado por el centro, separando en tres capas',
            'Decorar la superficie con una fina lluvia de cacao en polvo'
        ],
        tips: 'La leche debe ser fresca y contener un alto porcentaje de grasa para retener la microburbuja.',
        variants: 'Use leche de almendras o avena, batiendo vigorosamente para lograr estabilidad de espuma.',
        temperature: 94,
        brew_time: 5,
        result: 'Capuccino de tres capas con espuma densa',
        presentation: 'Taza grande de cerámica'
    },
    {
        id: 'flat-white-sedoso',
        name: 'Flat White Sedoso',
        category: 'latte',
        tags: ['hot', 'milk', 'foam'],
        difficulty: 'medio',
        time: 6,
        image: '🥛',
        servings: 1,
        water_ml: 90,
        coffee_spoons: 2,
        coffee_grams: 14.0,
        milk_ml: 110,
        sugar_spoons: 0,
        special_ingredients: ['Café de origen volcánico (Nariño o Huila)'],
        steps: [
            'Preparar un café de altísima concentración (proporción cercana a espresso)',
            'Calentar la leche a 60°C y agitar hasta tener textura de pintura húmeda',
            'Servir la base concentrada en una taza mediana de cerámica',
            'Verter la leche microespumada desde el centro con un flujo constante'
        ],
        tips: 'El Flat White se caracteriza por tener una microespuma muy fina de no más de 0.5 cm en superficie.',
        variants: 'Prepare con café descafeinado de Devoción para una versión nocturna sedosa.',
        temperature: 93,
        brew_time: 4,
        result: 'Café intenso con microespuma sedosa',
        presentation: 'Taza mediana de cerámica'
    },
    {
        id: 'mocha-clasico',
        name: 'Mocha Clásico con Chocolate',
        category: 'mocha',
        tags: ['hot', 'chocolate', 'milk'],
        difficulty: 'medio',
        time: 7,
        image: '🍫',
        servings: 1,
        water_ml: 100,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 150,
        sugar_spoons: 0,
        special_ingredients: ['Salsa de chocolate: 15g', 'Cacao oscuro'],
        steps: [
            'Verter el sirope de chocolate en la base de una taza grande',
            'Extraer el café de alta concentración por goteo en la Imusa',
            'Calentar la leche junto al cacao o verter la leche caliente sobre el sirope',
            'Incorporar el café caliente sobre la emulsión de leche y chocolate'
        ],
        tips: 'Utilice un café de tostión media-oscura como Tostao para que resalte sobre el amargor del cacao.',
        variants: 'Decore con crema chantilly y chispas de chocolate oscuro.',
        temperature: 92,
        brew_time: 5,
        result: 'Café con chocolate, cuerpo cremoso',
        presentation: 'Taza grande con decoración de chocolate'
    },
    {
        id: 'cappuccino-irlandes',
        name: 'Capuccino Irlandés Grande',
        category: 'internacional',
        tags: ['hot', 'milk', 'sweet'],
        difficulty: 'medio',
        time: 8,
        image: '☘️',
        servings: 1,
        water_ml: 100,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 120,
        sugar_spoons: 0,
        special_ingredients: ['Sirope de crema irlandesa: 15ml', 'Cacao'],
        steps: [
            'Colocar el sirope de crema irlandesa en el fondo de una taza grande de vidrio',
            'Filtrar la porción concentrada de café directamente sobre el sirope',
            'Calentar y batir la leche descremada hasta obtener una espuma suave',
            'Verter la leche sobre el café y terminar con una lluvia de chocolate fino rallado'
        ],
        tips: 'El uso de leche descremada permite lograr espumas de mayor volumen.',
        variants: 'Añada un toque de whisky irlandés real (15ml) para una versión auténtica.',
        temperature: 94,
        brew_time: 5,
        result: 'Café con notas a crema irlandesa',
        presentation: 'Vaso de vidrio templado'
    },
    {
        id: 'cappuccino-vienes',
        name: 'Capuccino Vienés de Barista',
        category: 'internacional',
        tags: ['hot', 'milk', 'sweet', 'dessert'],
        difficulty: 'medio',
        time: 8,
        image: '🇦🇹',
        servings: 1,
        water_ml: 100,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 100,
        sugar_spoons: 1,
        special_ingredients: ['Crema chantilly fresca', 'Chocolate amargo en polvo'],
        steps: [
            'Extraer el café concentrado en la Imusa de manera regular',
            'Verter en la taza y mezclar con el azúcar morena y la leche entera caliente',
            'Coronar el café con un copete generoso de crema chantilly batida fría',
            'Espolvorear chocolate amargo en polvo sobre la crema'
        ],
        tips: 'La crema chantilly debe estar fría para lograr el contraste de temperaturas con el café caliente.',
        variants: 'Incorpore café liofilizado espolvoreado sobre la crema para una textura crocante.',
        temperature: 93,
        brew_time: 5,
        result: 'Café cremoso con cobertura de chantilly',
        presentation: 'Taza mediana con crema decorada'
    },
    {
        id: 'latte-almendra',
        name: 'Latte de Almendra y Chocolate',
        category: 'latte',
        tags: ['hot', 'milk', 'sweet'],
        difficulty: 'medio',
        time: 7,
        image: '🌰',
        servings: 1,
        water_ml: 120,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 130,
        sugar_spoons: 0,
        special_ingredients: ['Sirope de chocolate', 'Sirope de almendra', 'Almendras fileteadas'],
        steps: [
            'Mezclar 1 cucharadita de sirope de chocolate y media de almendra en la taza',
            'Verter el café de alta montaña recién filtrado y homogeneizar',
            'Calentar y cremar ligeramente la leche descremada, luego incorporarla',
            'Decorar con láminas de almendra tostada flotando en la espuma'
        ],
        tips: 'Tostar ligeramente las almendras en una sartén seca para potenciar sus aceites naturales.',
        variants: 'Utilice leche de almendras como base láctea para resaltar el perfil seco del fruto.',
        temperature: 92,
        brew_time: 4,
        result: 'Café con notas a almendra y chocolate',
        presentation: 'Taza con almendras decorativas'
    },

    // ===== BEBIDAS FRÍAS =====
    {
        id: 'iced-coffee-clasico',
        name: 'Iced Coffee Clásico',
        category: 'frappe',
        tags: ['cold', 'iced'],
        difficulty: 'fácil',
        time: 5,
        image: '🧊',
        servings: 1,
        water_ml: 150,
        coffee_spoons: 2,
        coffee_grams: 14.0,
        milk_ml: 0,
        sugar_spoons: 1,
        special_ingredients: ['Hielo: 100g'],
        steps: [
            'Llenar un vaso alto de vidrio con los cubos de hielo',
            'Preparar un filtrado doble cargado (proporción corta de agua)',
            'Verter el café caliente directamente sobre los cubos de hielo de manera rápida',
            'Remover vigorosamente para enfriar de inmediato la infusión'
        ],
        tips: 'El enfriamiento rápido retiene las notas florales y frutales, evitando la oxidación térmica.',
        variants: 'Añada un chorro de leche de avena fría para un Iced Latte refrescante.',
        temperature: 94,
        brew_time: 3,
        result: 'Café frío con notas preservadas',
        presentation: 'Vaso alto con hielo'
    },
    {
        id: 'nevado-cafe',
        name: 'Nevado de Café con Chantilly',
        category: 'frappe',
        tags: ['cold', 'sweet', 'dessert'],
        difficulty: 'medio',
        time: 8,
        image: '🍦',
        servings: 1,
        water_ml: 100,
        coffee_spoons: 2,
        coffee_grams: 14.0,
        milk_ml: 50,
        sugar_spoons: 2,
        special_ingredients: ['Crema chantilly', 'Hielo: 150g'],
        steps: [
            'Preparar la base de café concentrado y dejar enfriar',
            'Colocar en la licuadora el café frío, la mezcla láctea, el azúcar y el hielo',
            'Licuar a velocidad máxima por 30 segundos hasta obtener textura frappé',
            'Servir en vaso alto y decorar con crema chantilly'
        ],
        tips: 'Utilice cubos de hielo hechos de café para evitar que la bebida se agüe.',
        variants: 'Añada una galleta triturada antes de licuar para un "Nevado Galleta" clásico.',
        temperature: 0,
        brew_time: 4,
        result: 'Bebida cremosa tipo frappé',
        presentation: 'Vaso alto con crema chantilly'
    },
    {
        id: 'cold-brew-mesa',
        name: 'Cold Brew de Mesa Filtrado',
        category: 'frappe',
        tags: ['cold', 'smooth'],
        difficulty: 'medio',
        time: '12h (reposo)',
        image: '🧊',
        servings: 2,
        water_ml: 250,
        coffee_spoons: 3,
        coffee_grams: 21.0,
        milk_ml: 0,
        sugar_spoons: 0,
        special_ingredients: ['Molienda gruesa', 'Agua de alta pureza fría'],
        steps: [
            'Mezclar el café molido grueso con el agua fría en un frasco de vidrio hermético',
            'Sellar y dejar macerar en el refrigerador durante 12 horas',
            'Filtrar la mezcla utilizando el filtro permanente de la Imusa de manera muy lenta',
            'Servir el elixir resultante sobre hielo en un vaso corto'
        ],
        tips: 'La extracción en frío reduce drásticamente los compuestos amargos y la acidez agresiva.',
        variants: 'Mezcle con tónica y rodajas de naranja para un "Cold Brew Tonic" de alta gama.',
        temperature: 4,
        brew_time: 720,
        result: 'Café suave, dulce y sin amargor',
        presentation: 'Vaso corto con hielo'
    },

    // ===== CAFÉS CON SABORES COLOMBIANOS =====
    {
        id: 'tinto-arequipe',
        name: 'Tinto Dulce de Arequipe',
        category: 'colombiano',
        tags: ['colombian', 'hot', 'sweet'],
        difficulty: 'fácil',
        time: 6,
        image: '🍯',
        servings: 1,
        water_ml: 200,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 50,
        sugar_spoons: 0,
        special_ingredients: ['Arequipe: 15g', 'Canela en polvo'],
        steps: [
            'Colocar los 15 gramos de arequipe en el fondo del pocillo',
            'Preparar un café fuerte por goteo en la cafetera Imusa',
            'Agregar los 50 ml de leche caliente sobre el arequipe y agitar hasta disolver',
            'Verter el café caliente, mezclar y terminar con un toque de canela'
        ],
        tips: 'La alta viscosidad del arequipe exige que se disuelva primero en leche caliente antes de añadir el café.',
        variants: 'Agregue chocolate rallado en la base para un Mocha con sabor a dulce de leche.',
        temperature: 93,
        brew_time: 4,
        result: 'Café dulce con sabor a arequipe',
        presentation: 'Pocillo con canela decorativa'
    },
    {
        id: 'cafe-melaza-clavo',
        name: 'Café con Melaza y Clavo',
        category: 'colombiano',
        tags: ['colombian', 'hot', 'sweet', 'spiced'],
        difficulty: 'fácil',
        time: 6,
        image: '🍯',
        servings: 1,
        water_ml: 250,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        sugar_spoons: 0,
        special_ingredients: ['Melaza o miel de panela: 1 cda.', 'Clavos de olor: 2'],
        steps: [
            'Colocar los clavos de olor directamente en la canasta de café junto con la molienda',
            'Añadir el agua en el depósito y verter la melaza en la jarra de vidrio vacía',
            'Ejecutar el ciclo de goteo en la cafetera Imusa',
            'Al terminar, agitar la jarra para incorporar el café caliente con la melaza'
        ],
        tips: 'Los clavos de olor en el portafiltro transfieren sus aceites esenciales de manera directa por arrastre térmico.',
        variants: 'Utilice miel de abejas orgánica en vez de melaza para un perfil floral silvestre.',
        temperature: 94,
        brew_time: 4,
        result: 'Café especiado con notas a melaza',
        presentation: 'Taza de cerámica'
    },

    // ===== CAFÉS FITNESS =====
    {
        id: 'iced-protein-coffee',
        name: 'Iced Coffee Proteico',
        category: 'fitness',
        tags: ['cold', 'protein', 'healthy'],
        difficulty: 'fácil',
        time: 6,
        image: '💪',
        servings: 1,
        water_ml: 150,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 100,
        sugar_spoons: 0,
        special_ingredients: ['Proteína whey sabor vainilla: 30g', 'Hielo'],
        steps: [
            'Filtrar el café en la Imusa de manera cargada y dejar reposar 2 minutos',
            'En un shaker, agregar la leche de almendras, el scoop de proteína y el café templado',
            'Agitar enérgicamente durante 15 segundos hasta eliminar grumos',
            'Servir sobre abundante hielo en un vaso grande'
        ],
        tips: 'No añada la proteína en polvo directamente al café hirviendo para evitar que se coagule.',
        variants: 'Utilice proteína con sabor a chocolate para crear un Moka fitness de alta proteína.',
        temperature: 4,
        brew_time: 4,
        result: 'Café proteico frío y refrescante',
        presentation: 'Vaso grande con hielo'
    },
    {
        id: 'keto-coffee',
        name: 'Keto Coffee con Aceite de Coco',
        category: 'fitness',
        tags: ['hot', 'keto', 'healthy'],
        difficulty: 'fácil',
        time: 5,
        image: '🥥',
        servings: 1,
        water_ml: 250,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 0,
        sugar_spoons: 0,
        special_ingredients: ['Mantequilla ghee: 10g', 'Aceite de coco: 5ml'],
        steps: [
            'Extraer el café negro por goteo de forma regular',
            'Verter el café caliente en el vaso de la licuadora',
            'Incorporar la mantequilla ghee y el aceite de coco virgen',
            'Licuar a alta velocidad por 15 segundos hasta obtener una emulsión espumosa'
        ],
        tips: 'El licuado es obligatorio para dispersar los lípidos en micelas estables.',
        variants: 'Sustituya el ghee por aceite MCT refinado para una absorción más rápida.',
        temperature: 93,
        brew_time: 4,
        result: 'Café cremoso con textura de latte',
        presentation: 'Taza con aspecto de latte'
    },

    // ===== CAFÉS INTERNACIONALES =====
    {
        id: 'cafe-vienes-clasico',
        name: 'Café Vienés Clásico',
        category: 'internacional',
        tags: ['hot', 'sweet', 'dessert'],
        difficulty: 'fácil',
        time: 6,
        image: '🇦🇹',
        servings: 1,
        water_ml: 150,
        coffee_spoons: 1.5,
        coffee_grams: 10.5,
        milk_ml: 0,
        sugar_spoons: 1,
        special_ingredients: ['Crema chantilly', 'Chocolate amargo rallado', 'Canela'],
        steps: [
            'Preparar un café negro concentrado en la Imusa Café City',
            'Servir el café bien caliente en una taza mediana precalentada',
            'Agregar y disolver el azúcar refinada',
            'Coronar con una capa de crema chantilly firme y decorar con chocolate rallado'
        ],
        tips: 'Precaliente la taza con agua caliente para que el café no se enfríe antes de tiempo.',
        variants: 'Añada una pizca de canela sobre la crema para un aroma más cálido.',
        temperature: 94,
        brew_time: 4,
        result: 'Café con cobertura de crema y chocolate',
        presentation: 'Taza mediana con crema decorada'
    },
    {
        id: 'cafe-irlandes',
        name: 'Café Irlandés de Barista',
        category: 'internacional',
        tags: ['hot', 'alcohol'],
        difficulty: 'medio',
        time: 8,
        image: '🇮🇪',
        servings: 1,
        water_ml: 150,
        coffee_spoons: 1.75,
        coffee_grams: 12.2,
        milk_ml: 0,
        sugar_spoons: 2,
        special_ingredients: ['Whisky irlandés: 30ml', 'Crema de leche semibatida: 40ml'],
        steps: [
            'Precalentar una copa de vidrio templado con agua caliente y desecharla',
            'Verter el whisky irlandés y el azúcar moreno en la copa caliente y mezclar',
            'Preparar el café concentrado e incorporarlo caliente en la copa',
            'Verter la crema de leche fría sobre el dorso de una cuchara para que flote'
        ],
        tips: 'La crema no debe estar completamente batida, sino semibatida (punto de cinta).',
        variants: 'Flambee ligeramente el whisky con el azúcar antes de verter el café.',
        temperature: 93,
        brew_time: 5,
        result: 'Café con whisky y crema flotante',
        presentation: 'Copa de vidrio templado'
    }
];

// ========================================
// 4. TABLA DE MEDIDAS PARA INSTANTÁNEOS
// ========================================
const INSTANT_COFFEE_MEASURES = {
    'juan-valdez': { base: 2, name: 'Juan Valdez Instantáneo' },
    'nescafe': { base: 3, name: 'Nescafé Tradición' },
    'colcafe': { base: 3, name: 'Colcafé Clásico' },
    'buendia': { base: 3, name: 'Buendía Liofilizado' },
    'aguila': { base: 4, name: 'Águila Roja Soluble' },
    'sello': { base: 4, name: 'Sello Rojo Soluble' }
};

// ========================================
// 5. GUÍAS DE MANTENIMIENTO
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
// 6. FUNCIONES DE CÁLCULO
// ========================================
const CoffeeMath = {
    // Convertir gramos a cucharas IMUSA (1 cuchara = 7g)
    gramsToSpoons: function(grams) {
        const spoons = grams / COFFEE_STANDARDS.imusa.spoon_grams;
        // Redondear a 1/4 de cuchara
        return Math.round(spoons * 4) / 4;
    },
    
    // Convertir cucharas a gramos
    spoonsToGrams: function(spoons) {
        return spoons * COFFEE_STANDARDS.imusa.spoon_grams;
    },
    
    // Formatear fracciones
    formatSpoon: function(value) {
        const whole = Math.floor(value);
        const frac = value - whole;
        
        if (frac === 0) return `${whole}`;
        if (frac === 0.25) return whole > 0 ? `${whole}¼` : '¼';
        if (frac === 0.5) return whole > 0 ? `${whole}½` : '½';
        if (frac === 0.75) return whole > 0 ? `${whole}¾` : '¾';
        return (whole + frac).toFixed(2);
    },
    
    // Calcular azúcar recomendada
    calculateSugar: function(water_ml, level = 'medium') {
        const sugarPerMl = COFFEE_STANDARDS.sugar[level] || 0.08;
        const grams = water_ml * sugarPerMl;
        // 1 cucharadita = 5g
        const teaspoons = grams / 5;
        return Math.round(teaspoons * 4) / 4;
    },
    
    // Analizar preparación con peso
    analyzePreparation: function(grams, water_ml, desired_strength = 'normal') {
        const ratio = water_ml / grams;
        const idealRatio = COFFEE_STANDARDS.ratios[desired_strength]?.ratio || 16.67;
        const idealGrams = water_ml / idealRatio;
        const diff = grams - idealGrams;
        const diffSpoons = this.gramsToSpoons(Math.abs(diff));
        
        let status = '';
        let message = '';
        let strength = '';
        
        if (Math.abs(diff) / idealGrams < 0.1) {
            status = '✅ Excelente';
            message = 'La cantidad está dentro del rango recomendado para un café balanceado.';
            strength = 'Balanceado';
        } else if (diff > 0) {
            status = '☕ Fuerte';
            message = `Estás usando ${diff.toFixed(1)}g (≈${this.formatSpoon(diffSpoons)} cuchara${diffSpoons > 1 ? 's' : ''}) más de lo recomendado. Obtendrás un café con mayor cuerpo.`;
            strength = 'Fuerte';
        } else {
            status = '☕ Suave';
            message = `Te faltan ${Math.abs(diff).toFixed(1)}g (≈${this.formatSpoon(diffSpoons)} cuchara${diffSpoons > 1 ? 's' : ''}) para alcanzar la recomendación. El café será más ligero.`;
            strength = 'Suave';
        }
        
        return {
            ratio: Math.round(ratio * 10) / 10,
            idealGrams: Math.round(idealGrams * 10) / 10,
            diff: Math.round(diff * 10) / 10,
            diffSpoons: diffSpoons,
            status,
            message,
            strength,
            sugarRecommendation: this.calculateSugar(water_ml, 'medium'),
            spoonsUsed: this.gramsToSpoons(grams)
        };
    }
};

// ========================================
// EXPORTAR
// ========================================
// Datos disponibles globalmente
window.COFFEE_STANDARDS = COFFEE_STANDARDS;
window.BRANDS = BRANDS;
window.RECIPES = RECIPES;
window.INSTANT_COFFEE_MEASURES = INSTANT_COFFEE_MEASURES;
window.GUIDES = GUIDES;
window.CoffeeMath = CoffeeMath;
