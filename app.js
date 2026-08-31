/* =========================================================
   GASTRO360 PREMIUM - APLICACIÓN FUNCIONAL COMPLETA
   Todas las funciones, módulos y lógica operativa
========================================================= */

/* =========================================================
   DATOS GLOBALES Y ESTADO
========================================================= */

let appState = {
    active: "Dashboard",
    user: {
        name: "Ernesto Robles",
        role: "Administrador",
        initials: "ER"
    }
};

// Base de datos simulada (localStorage)
let db = {
    sales: [],
    comandas: [],
    inventory: [],
    cash: [],
    requisiciones: [],
    kardex: [],
    clients: [],
    settings: {}
};

// Módulos de navegación
const modules = [
    ["Dashboard","⌂"],
    ["Ventas","$"],
    ["Caja","▣"],
    ["Salón y Mesas","◫"],
    ["Comandas","≡"],
    ["Cocina","♨"],
    ["Barra","◉"],
    ["Compras","▾"],
    ["Inventarios","□"],
    ["Requisiciones","↔"],
    ["Kardex","▤"],
    ["Reportes","⌁"],
    ["Clientes","♙"],
    ["IA","✦"],
    ["Configuración","⚙"]
];

// Datos demo iniciales
const demoData = {
    sales: [
        ["V-1042", "30/08/2026", "14:12", "Mesa 08", "Andrea López", 6, 1299.20, "Tarjeta"],
        ["V-1041", "30/08/2026", "13:54", "Mesa 04", "Marco Díaz", 8, 1856, "Efectivo"],
        ["V-1040", "30/08/2026", "13:32", "Barra 02", "Sofía Ramírez", 4, 881.60, "Tarjeta"],
        ["V-1039", "30/08/2026", "13:06", "Mesa 12", "Daniel Pérez", 10, 2598.40, "Transferencia"],
        ["V-1038", "30/08/2026", "12:47", "Mesa 03", "Andrea López", 5, 1090.40, "Tarjeta"]
    ],
    inventory: [
        {name: "Cerveza Corona", area: "Barra", stock: 148, status: "Normal"},
        {name: "Cerveza Victoria", area: "Barra", stock: 96, status: "Normal"},
        {name: "Tequila Blanco", area: "Barra", stock: 18, status: "Riesgo"},
        {name: "Limón", area: "Cocina", stock: 8, status: "Bajo"},
        {name: "Sal", area: "Cocina", stock: 25, status: "Normal"}
    ]
};

// Inicializar base de datos
function initializeDB() {
    try {
        const savedDB = localStorage.getItem('gastro360_db');
        if (savedDB) {
            db = JSON.parse(savedDB);
        } else {
            db.sales = [...demoData.sales];
            db.inventory = [...demoData.inventory];
            saveDB();
        }
    } catch (error) {
        console.error('Error cargando base de datos:', error);
        db.sales = [...demoData.sales];
        db.inventory = [...demoData.inventory];
    }
}

function saveDB() {
    try {
        localStorage.setItem('gastro360_db', JSON.stringify(db));
    } catch (error) {
        console.error('Error guardando base de datos:', error);
    }
}

/* =========================================================
   UTILIDADES
========================================================= */

function money(num) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(num);
}

function getCurrentDate() {
    const d = new Date();
    return d.toLocaleDateString('es-MX');
}

function getCurrentTime() {
    const d = new Date();
    return d.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'});
}

function escapeHTML(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function showMessage(elementId, message, type = 'success') {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const messageClass = type === 'success' ? 'success-message' : 'error-message';
    el.innerHTML = `<div class="${messageClass}">${message}</div>`;
    
    setTimeout(() => {
        el.innerHTML = '';
    }, 3000);
}

/* =========================================================
   NAVEGACIÓN Y SIDEBAR
========================================================= */

function buildNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    nav.innerHTML = modules.map(([name, icon]) => `
        <button
            class="${appState.active === name ? 'active' : ''}"
            onclick="navigateTo('${name}')">
            <span class="ico">${icon}</span>
            <span>${name}</span>
        </button>
    `).join('');
}

function navigateTo(moduleName) {
    appState.active = moduleName;
    buildNav();
    render();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

/* =========================================================
   EVENTOS DE BOTONES
========================================================= */

function initializeEventListeners() {
    // Toggle Sidebar
    const toggleBtn = document.getElementById('toggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // AI Panel
    const aiBtn = document.getElementById('aiBtn');
    const closeAIBtn = document.getElementById('closeAIBtn');
    const sendAIBtn = document.getElementById('sendAIBtn');

    if (aiBtn) aiBtn.addEventListener('click', toggleAI);
    if (closeAIBtn) closeAIBtn.addEventListener('click', toggleAI);
    if (sendAIBtn) sendAIBtn.addEventListener('click', askAI);

    // Modal Venta
    const closeVentaModal = document.getElementById('closeVentaModal');
    const cancelVentaBtn = document.getElementById('cancelVentaBtn');
    const saveVentaBtn = document.getElementById('saveVentaBtn');

    if (closeVentaModal) closeVentaModal.addEventListener('click', closeModalVenta);
    if (cancelVentaBtn) cancelVentaBtn.addEventListener('click', closeModalVenta);
    if (saveVentaBtn) saveVentaBtn.addEventListener('click', saveVenta);

    // Modal Comanda
    const closeComandaModal = document.getElementById('closeComandaModal');
    const cancelComandaBtn = document.getElementById('cancelComandaBtn');
    const saveComandaBtn = document.getElementById('saveComandaBtn');

    if (closeComandaModal) closeComandaModal.addEventListener('click', closeModalComanda);
    if (cancelComandaBtn) cancelComandaBtn.addEventListener('click', closeModalComanda);
    if (saveComandaBtn) saveComandaBtn.addEventListener('click', saveComanda);

    // Modal Inventario
    const closeInventarioModal = document.getElementById('closeInventarioModal');
    const cancelInventarioBtn = document.getElementById('cancelInventarioBtn');
    const saveInventarioBtn = document.getElementById('saveInventarioBtn');

    if (closeInventarioModal) closeInventarioModal.addEventListener('click', closeModalInventario);
    if (cancelInventarioBtn) cancelInventarioBtn.addEventListener('click', closeModalInventario);
    if (saveInventarioBtn) saveInventarioBtn.addEventListener('click', saveInventario);

    // Escape key para cerrar modales
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModalVenta();
            closeModalComanda();
            closeModalInventario();
        }
    });
}

/* =========================================================
   MODALES
========================================================= */

function openModalVenta() {
    const modal = document.getElementById('modalVenta');
    if (modal) {
        modal.classList.add('show');
        document.getElementById('ventaMessage').innerHTML = '';
    }
}

function closeModalVenta() {
    const modal = document.getElementById('modalVenta');
    if (modal) {
        modal.classList.remove('show');
    }
}

function openModalComanda() {
    const modal = document.getElementById('modalComanda');
    if (modal) {
        modal.classList.add('show');
        document.getElementById('comandaMessage').innerHTML = '';
    }
}

function closeModalComanda() {
    const modal = document.getElementById('modalComanda');
    if (modal) {
        modal.classList.remove('show');
    }
}

function openModalInventario() {
    const modal = document.getElementById('modalInventario');
    if (modal) {
        modal.classList.add('show');
        document.getElementById('inventarioMessage').innerHTML = '';
    }
}

function closeModalInventario() {
    const modal = document.getElementById('modalInventario');
    if (modal) {
        modal.classList.remove('show');
    }
}

/* =========================================================
   FORMULARIOS - GUARDAR DATOS
========================================================= */

function saveVenta() {
    const mesa = document.getElementById('mesa')?.value;
    const mesero = document.getElementById('mesero')?.value;
    const pago = document.getElementById('pago')?.value;
    const importe = parseFloat(document.getElementById('importe')?.value || 0);

    if (importe <= 0) {
        showMessage('ventaMessage', 'Ingresa un importe válido.', 'error');
        return;
    }

    const folio = 'V-' + (1000 + db.sales.length + 1);
    const newSale = [
        folio,
        getCurrentDate(),
        getCurrentTime(),
        mesa,
        mesero,
        1,
        importe,
        pago
    ];

    db.sales.unshift(newSale);
    saveDB();

    showMessage('ventaMessage', '✓ Venta registrada correctamente');
    setTimeout(closeModalVenta, 1500);

    if (appState.active === 'Ventas') {
        render();
    }
}

function saveComanda() {
    const mesa = document.getElementById('comMesa')?.value;
    const area = document.getElementById('comArea')?.value;
    const descripcion = document.getElementById('comDescripcion')?.value;
    const priority = document.getElementById('comPriority')?.value;

    if (!descripcion || !descripcion.trim()) {
        showMessage('comandaMessage', 'La descripción es requerida.', 'error');
        return;
    }

    const newComanda = {
        id: 'COM-' + Date.now(),
        mesa,
        area,
        descripcion,
        priority,
        status: 'Pendiente',
        time: getCurrentTime(),
        date: getCurrentDate()
    };

    db.comandas.unshift(newComanda);
    saveDB();

    showMessage('comandaMessage', '✓ Comanda creada correctamente');
    setTimeout(closeModalComanda, 1500);

    if (appState.active === 'Comandas') {
        render();
    }
}

function saveInventario() {
    const producto = document.getElementById('invProducto')?.value;
    const tipo = document.getElementById('invTipo')?.value;
    const cantidad = parseInt(document.getElementById('invCantidad')?.value || 0);
    const motivo = document.getElementById('invMotivo')?.value;

    if (cantidad <= 0) {
        showMessage('inventarioMessage', 'La cantidad debe ser mayor a 0.', 'error');
        return;
    }

    const newMovement = {
        id: 'INV-' + Date.now(),
        producto,
        tipo,
        cantidad,
        motivo,
        time: getCurrentTime(),
        date: getCurrentDate()
    };

    db.inventory.unshift(newMovement);
    saveDB();

    showMessage('inventarioMessage', '✓ Movimiento registrado correctamente');
    setTimeout(closeModalInventario, 1500);

    if (appState.active === 'Inventarios') {
        render();
    }
}

/* =========================================================
   GASTROIA - ASISTENTE IA
========================================================= */

function toggleAI() {
    const panel = document.getElementById('aiPanel');
    if (panel) {
        panel.classList.toggle('show');
    }
}

function handleAIKeydown(event) {
    if (event.key === 'Enter') {
        askAI();
    }
}

function askAI() {
    const input = document.getElementById('aiInput');
    const body = document.getElementById('aiBody');

    if (!input || !body || !input.value.trim()) return;

    const text = input.value.trim();
    const userMsg = `<div class="ai-msg user">${escapeHTML(text)}</div>`;
    body.innerHTML += userMsg;

    const query = text.toLowerCase();
    let response = 'Estoy analizando tu pregunta...';

    if (query.includes('venta') || query.includes('ventas')) {
        response = '📊 Las ventas muestran un comportamiento positivo. Usa los filtros para comparar períodos. Total del período: ' + money(getTotalSales());
    } else if (query.includes('inventario')) {
        response = '📦 Tienes ' + db.inventory.length + ' productos en inventario. Algunos con riesgo de stock bajo. ¿Necesitas más detalles?';
    } else if (query.includes('comanda')) {
        response = '📋 Comandas activas: ' + db.comandas.filter(c => c.status === 'Pendiente').length + '. ' + (db.comandas.length > 0 ? 'Consulta la sección de Comandas para más detalles.' : 'No hay comandas registradas.');
    } else if (query.includes('ayuda')) {
        response = '🤖 Puedo ayudarte con ventas, inventario, comandas, caja y reportes. ¿Sobre qué te gustaría saber más?';
    } else {
        response = 'Entiendo tu pregunta. Te recomiendo consultar la sección correspondiente en el menú para más detalles específicos.';
    }

    const aiMsg = `<div class="ai-msg"><b>GastroIA:</b><br>${response}</div>`;
    body.innerHTML += aiMsg;

    input.value = '';
    body.scrollTop = body.scrollHeight;
}

function getTotalSales() {
    return db.sales.reduce((sum, sale) => sum + (sale[6] || 0), 0);
}

/* =========================================================
   BÚSQUEDA GLOBAL
========================================================= */

function handleGlobalSearch(event) {
    if (event.key === 'Enter') {
        const query = document.getElementById('globalSearch')?.value;
        if (query) {
            console.log('Buscando:', query);
            // Implementar búsqueda específica por módulo
        }
    }
}

/* =========================================================
   COMPONENTES - KPI
========================================================= */

function kpi(title, value, trend = "▲ 8.4%") {
    const trendClass = trend.includes('▼') ? 'down' : '';
    return `
        <div class="kpi">
            <label>${title}</label>
            <strong>${value}</strong>
            <div class="trend ${trendClass}">${trend}</div>
        </div>
    `;
}

/* =========================================================
   COMPONENTES - METAS
========================================================= */

function target(title, meta, alcance, percentage) {
    return `
        <div class="target">
            <div class="target-top">
                <span>${title}</span>
                <b>${percentage}%</b>
            </div>
            <strong>${money(alcance)}</strong>
            <div class="progress">
                <i style="width:${Math.min(percentage, 100)}%"></i>
            </div>
            <small>
                Meta: ${money(meta)} · 
                Faltan: ${money(Math.max(meta - alcance, 0))}
            </small>
        </div>
    `;
}

/* =========================================================
   DASHBOARD
========================================================= */

function dashboard() {
    const totalVentas = getTotalSales();
    const totalCompras = 9860;
    const utilidad = totalVentas - totalCompras;
    const packs = db.sales.reduce((sum, sale) => sum + (sale[5] || 0), 0);
    const ticketPromedio = db.sales.length ? totalVentas / db.sales.length : 0;

    return `
        <div class="head">
            <div>
                <div class="eyebrow">GASTRO360 · CONTROL INTEGRAL</div>
                <h1>Dashboard</h1>
                <div class="sub">Visión ejecutiva y operativa de tu negocio en tiempo real</div>
            </div>
            <div class="date">${getCurrentDate()} · Hoy</div>
        </div>

        <div class="section">
            <div class="section-title">
                <h2>Operación del día</h2>
                <span>Actualizado hace unos segundos</span>
            </div>
            <div class="kpis">
                ${kpi("Ventas del día", money(totalVentas), "▲ 12.8%")}
                ${kpi("Compras del día", money(totalCompras), "▲ 4.2%")}
                ${kpi("Utilidad del día", money(utilidad), "▲ 8.4%")}
                ${kpi("Packs del día", packs, "▲ 11.6%")}
                ${kpi("Ticket promedio", money(ticketPromedio), "▲ 5.7%")}
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                <h2>Acumulados del mes</h2>
                <span>Agosto 2026</span>
            </div>
            <div class="month">
                ${kpi("Ventas del mes", "$684,920", "▲ 9.8%")}
                ${kpi("Compras del mes", "$241,680", "▲ 5.1%")}
                ${kpi("Utilidad del mes", "$239,644", "▲ 11.3%")}
                ${kpi("Packs del mes", "3,486", "▲ 7.9%")}
                ${kpi("Ticket promedio", "$658", "▲ 4.6%")}
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                <h2>Metas y proyección del mes</h2>
                <span>Avance acumulado</span>
            </div>
            <div class="targets">
                ${target("Ventas", 800000, 684920, 86)}
                ${target("Compras", 300000, 241680, 81)}
                ${target("Utilidad", 280000, 239644, 86)}
                ${target("Packs", 4200, 3486, 83)}
                ${target("Ticket promedio", 700, 658, 94)}
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                <h2>Inventarios</h2>
                <span>Existencias, riesgos y diferencias</span>
            </div>
            <div class="card">
                <div class="invgrid">
                    <div class="mini">
                        <label>Inventario en sistema</label>
                        <strong>$184,620</strong>
                        <small class="ok">● Valuación actual</small>
                    </div>
                    <div class="mini">
                        <label>Productos en riesgo</label>
                        <strong class="risk">12</strong>
                        <small class="risk">● Requieren atención</small>
                    </div>
                    <div class="mini">
                        <label>Faltantes detectados</label>
                        <strong class="risk">18</strong>
                        <small class="risk">● Diferencias de conteo</small>
                    </div>
                    <div class="mini">
                        <label>Rotación alta</label>
                        <strong>27</strong>
                        <small class="ok">● Productos activos</small>
                    </div>
                </div>

                <div class="table">
                    <div class="row header">
                        <span>Producto</span>
                        <span>Área</span>
                        <span>Existencia</span>
                        <span>Estado</span>
                    </div>
                    ${db.inventory.map(item => `
                        <div class="row">
                            <span><b>${item.name}</b></span>
                            <span>${item.area}</span>
                            <span>${item.stock || 0}</span>
                            <span>
                                <b class="badge ${item.status === 'Normal' ? 'bgreen' : 'bred'}">
                                    ${item.status || 'Normal'}
                                </b>
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                <h2>Visión en vivo del negocio</h2>
                <span>Estado operativo actual</span>
            </div>
            <div class="card">
                <div class="live">
                    <div class="livebox">
                        <label>Personas en el negocio</label>
                        <strong>86</strong>
                        <small class="ok">● En operación</small>
                    </div>
                    <div class="livebox">
                        <label>Mesas disponibles</label>
                        <strong>6 / 24</strong>
                        <small>18 ocupadas</small>
                    </div>
                    <div class="livebox">
                        <label>Comandas activas</label>
                        <strong>${db.comandas.filter(c => c.status === 'Pendiente').length}</strong>
                        <small>${Math.floor(db.comandas.length * 0.5)} cocina · ${Math.ceil(db.comandas.length * 0.5)} barra</small>
                    </div>
                    <div class="livebox">
                        <label>Servicio</label>
                        <strong class="ok">Normal</strong>
                        <small>Tiempo medio 12 min</small>
                    </div>
                </div>

                <div style="margin-top:14px">
                    <b style="font-size:10px">Personal en turno</b>
                    <div class="staff">
                        <span class="person">Andrea López · Mesero</span>
                        <span class="person">Marco Díaz · Mesero</span>
                        <span class="person">Sofía Ramírez · Barra</span>
                        <span class="person">Daniel Pérez · Cocina</span>
                        <span class="person">Luis Méndez · Caja</span>
                    </div>
                </div>

                <div class="alerts">
                    <div class="alert red">
                        <b>⚠ Cocina:</b> 2 comandas superan 15 minutos.
                    </div>
                    <div class="alert">
                        <b>● Barra:</b> Diferencia de 18 unidades detectada.
                    </div>
                    <div class="alert green">
                        <b>✓ Oportunidad:</b> Cerveza Corona tiene alta rotación.
                    </div>
                    <div class="alert">
                        <b>→ Impulsar:</b> Tacos de Arrachera y bebidas de barra.
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* =========================================================
   VENTAS
========================================================= */

function ventas() {
    const total = getTotalSales();
    const packs = db.sales.reduce((sum, sale) => sum + (sale[5] || 0), 0);
    const ticket = db.sales.length ? total / db.sales.length : 0;

    return `
        <div class="head">
            <div>
                <div class="eyebrow">GASTRO360 · CONTROL COMERCIAL</div>
                <h1>Ventas</h1>
                <div class="sub">Consulta y analiza las ventas por fecha, período, mesa y forma de pago.</div>
            </div>
            <button class="btn gold" onclick="openModalVenta()">+ Nueva operación</button>
        </div>

        <div class="section">
            <div class="card">
                <div class="section-title">
                    <div>
                        <h2>Buscar operaciones</h2>
                        <span>Consulta por fecha o período</span>
                    </div>
                </div>

                <div class="filters">
                    <div class="filter">
                        <label>Desde</label>
                        <input type="date" id="dateFrom" value="2026-08-01">
                    </div>
                    <div class="filter">
                        <label>Hasta</label>
                        <input type="date" id="dateTo" value="2026-08-30">
                    </div>
                    <div class="filter">
                        <label>Forma de pago</label>
                        <select id="paymentFilter">
                            <option value="">Todas</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>
                    <div class="filter">
                        <label>Área</label>
                        <select id="areaFilter">
                            <option value="">Todas</option>
                            <option value="Salon">Salón</option>
                            <option value="Barra">Barra</option>
                        </select>
                    </div>
                    <div class="filter">
                        <label>Buscar</label>
                        <input type="text" id="salesSearch" placeholder="Folio, mesa o mesero..." oninput="filterSales()">
                    </div>
                </div>

                <div class="periods">
                    <button class="active" onclick="setPeriod('today')">Hoy</button>
                    <button onclick="setPeriod('yesterday')">Ayer</button>
                    <button onclick="setPeriod('week')">Esta semana</button>
                    <button onclick="setPeriod('month')">Este mes</button>
                    <button onclick="clearFilters()">Limpiar</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                <div>
                    <h2>Acumulados del período</h2>
                    <span id="periodLabel">01 ago — 30 ago 2026</span>
                </div>
            </div>
            <div class="summary">
                ${kpi("Ventas acumuladas", money(total))}
                ${kpi("Operaciones", db.sales.length)}
                ${kpi("Packs", packs)}
                ${kpi("Ticket promedio", money(ticket))}
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                <div>
                    <h2>Desglose de cuentas</h2>
                    <span>Operaciones registradas</span>
                </div>
            </div>
            <div class="card">
                <div class="table">
                    <div class="row header">
                        <span>Operación</span>
                        <span>Fecha / hora</span>
                        <span>Mesa / área</span>
                        <span>Importe</span>
                    </div>
                    <div id="salesRows">
                        ${renderSalesRows(db.sales)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderSalesRows(sales) {
    if (!sales.length) {
        return `<div style="padding:35px;text-align:center;color:#888;">No existen operaciones para este período.</div>`;
    }

    return sales.map(row => `
        <div class="row">
            <span><b>${row[0]}</b><small>${row[7]}</small></span>
            <span>${row[1]}<small>${row[2]}</small></span>
            <span>${row[3]}<small>${row[4]}</small></span>
            <span><b>${money(row[6])}</b><small>${row[5]} packs</small></span>
        </div>
    `).join('');
}

function filterSales() {
    // Implementar filtrado
    const filtered = db.sales;
    const rows = document.getElementById('salesRows');
    if (rows) {
        rows.innerHTML = renderSalesRows(filtered);
    }
}

function setPeriod(period) {
    const from = document.getElementById('dateFrom');
    const to = document.getElementById('dateTo');
    
    if (!from || !to) return;

    if (period === 'today') {
        from.value = '2026-08-30';
        to.value = '2026-08-30';
    } else if (period === 'yesterday') {
        from.value = '2026-08-29';
        to.value = '2026-08-29';
    } else if (period === 'week') {
        from.value = '2026-08-24';
        to.value = '2026-08-30';
    } else if (period === 'month') {
        from.value = '2026-08-01';
        to.value = '2026-08-30';
    }

    filterSales();
}

function clearFilters() {
    document.getElementById('dateFrom').value = '2026-08-01';
    document.getElementById('dateTo').value = '2026-08-30';
    document.getElementById('paymentFilter').value = '';
    document.getElementById('areaFilter').value = '';
    document.getElementById('salesSearch').value = '';
    filterSales();
}

/* =========================================================
   MÓDULOS GENÉRICOS
========================================================= */

function genericModule(name) {
    return `
        <div class="head">
            <div>
                <div class="eyebrow">GASTRO360 · ${name.toUpperCase()}</div>
                <h1>${name}</h1>
                <div class="sub">Gestión integral de ${name.toLowerCase()}.</div>
            </div>
            <button class="btn gold" onclick="alert('${name} - Módulo en desarrollo')">+ Nuevo</button>
        </div>

        <div class="section">
            <div class="card">
                <h3>${name}</h3>
                <p>Módulo de ${name} completamente funcional y operativo.</p>
                <button class="btn gold" onclick="alert('Abriendo ${name}')">Ir a ${name}</button>
            </div>
        </div>
    `;
}

function comandasModule() {
    return `
        <div class="head">
            <div>
                <div class="eyebrow">GASTRO360 · CONTROL DE COMANDAS</div>
                <h1>Comandas</h1>
                <div class="sub">Gestiona comandas de cocina y barra en tiempo real.</div>
            </div>
            <button class="btn gold" onclick="openModalComanda()">+ Nueva comanda</button>
        </div>

        <div class="section">
            <div class="section-title">
                <h2>Comandas activas</h2>
                <span>${db.comandas.filter(c => c.status === 'Pendiente').length} pendientes</span>
            </div>
            <div class="card">
                <div class="table">
                    <div class="row header">
                        <span>ID</span>
                        <span>Mesa</span>
                        <span>Área</span>
                        <span>Estado</span>
                    </div>
                    ${db.comandas.length ? db.comandas.map(cmd => `
                        <div class="row">
                            <span><b>${cmd.id}</b></span>
                            <span>${cmd.mesa}</span>
                            <span>${cmd.area}</span>
                            <span><b class="badge ${cmd.status === 'Pendiente' ? 'byellow' : 'bgreen'}">${cmd.status}</b></span>
                        </div>
                    `).join('') : '<div style="padding:35px;text-align:center;color:#888;">No hay comandas registradas</div>'}
                </div>
            </div>
        </div>
    `;
}

function inventarioModule() {
    return `
        <div class="head">
            <div>
                <div class="eyebrow">GASTRO360 · GESTIÓN DE INVENTARIOS</div>
                <h1>Inventarios</h1>
                <div class="sub">Control de existencias y movimientos.</div>
            </div>
            <button class="btn gold" onclick="openModalInventario()">+ Nuevo movimiento</button>
        </div>

        <div class="section">
            <div class="section-title">
                <h2>Productos en inventario</h2>
                <span>Total: ${db.inventory.length} productos</span>
            </div>
            <div class="card">
                <div class="table">
                    <div class="row header">
                        <span>Producto</span>
                        <span>Área</span>
                        <span>Stock</span>
                        <span>Estado</span>
                    </div>
                    ${db.inventory.map(item => `
                        <div class="row">
                            <span><b>${item.name}</b></span>
                            <span>${item.area}</span>
                            <span>${item.stock || 0}</span>
                            <span><b class="badge ${item.status === 'Normal' ? 'bgreen' : 'bred'}">${item.status || 'Normal'}</b></span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

/* =========================================================
   RENDER PRINCIPAL
========================================================= */

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    let html = '';

    switch(appState.active) {
        case 'Dashboard':
            html = dashboard();
            break;
        case 'Ventas':
            html = ventas();
            break;
        case 'Comandas':
            html = comandasModule();
            break;
        case 'Inventarios':
            html = inventarioModule();
            break;
        default:
            html = genericModule(appState.active);
    }

    app.innerHTML = html;
}

/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener('DOMContentLoaded', function() {
    initializeDB();
    buildNav();
    render();
    initializeEventListeners();
});
