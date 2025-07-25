document.addEventListener('DOMContentLoaded', function() {
    // REEMPLAZA ESTA URL CON LA URL DE TU HOJA DE GOOGLE SHEETS PUBLICADA COMO JSON
    const GOOGLE_SHEET_JSON_URL = 'https://docs.google.com/spreadsheets/d/1b5BNElgn1F_mMoNkNyVlElp5A3COMF3Wv7JwYNhqLvg/gviz/tq?tqx=out:json&gid=0'; // EJEMPLO

    const productListSection = document.querySelector('.product-list');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const resetFiltersButton = document.getElementById('resetFilters');
    const loadingMessage = document.getElementById('loadingMessage');
    const noProductsFoundMessage = document.getElementById('noProductsFound');

    let allProducts = []; // Para almacenar todos los productos cargados
    let availableCategories = new Set(); // Para almacenar categorías únicas

    // Función para obtener los datos de Google Sheets
    async function fetchProductsFromSheet() {
        loadingMessage.style.display = 'block';
        noProductsFoundMessage.style.display = 'none';
        try {
            const response = await fetch(GOOGLE_SHEET_JSON_URL);
            const text = await response.text();
            // Google Sheets API returns JSONP-like format, we need to parse it
            const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonString);

            // Extrae los nombres de las columnas (cabeceras)
            const cols = data.table.cols.map(col => col.label);

            // Mapea las filas a objetos de producto
            allProducts = data.table.rows.map(row => {
                const product = {};
                row.c.forEach((cell, index) => {
                    const colName = cols[index];
                    if (cell && cell.v !== undefined) {
                        product[colName] = cell.v;
                    } else {
                        product[colName] = ''; // Manejar celdas vacías
                    }
                });
                return product;
            });

            // Populate categories for the filter
            availableCategories.clear();
            allProducts.forEach(product => {
                if (product.categoria) { // Asegúrate de que 'categoria' sea el nombre de tu columna
                    availableCategories.add(product.categoria);
                }
            });
            populateCategoryFilter();
            renderProducts(allProducts); // Renderiza todos los productos inicialmente

        } catch (error) {
            console.error('Error al cargar los productos desde Google Sheets:', error);
            productListSection.innerHTML = '<p style="color: red; text-align: center;">Error al cargar los productos. Por favor, verifica la URL de Google Sheet y los permisos.</p>';
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    // Función para poblar el filtro de categorías
    function populateCategoryFilter() {
        categoryFilter.innerHTML = '<option value="all">Todas las categorías</option>';
        Array.from(availableCategories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Función para renderizar productos en el DOM
    function renderProducts(productsToDisplay) {
        productListSection.innerHTML = ''; // Limpiar productos existentes
        if (productsToDisplay.length === 0) {
            noProductsFoundMessage.style.display = 'block';
            return;
        }
        noProductsFoundMessage.style.display = 'none';

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <a href="${product.imagen}" data-lightbox="product-gallery" data-title="${product.nombre}">
                <img src="${product.imagen || 'https://via.placeholder.com/200?text=No+Image'}" alt="${product.nombre || 'Producto sin nombre'}">
                </a>
                <h3>${product.nombre || 'Producto sin nombre'}</h3>
                <p class="description">${product.descripcion || 'Sin descripción.'}</p>
                <p class="price">${product.precio ? `$${parseFloat(product.precio).toFixed(2)}` : 'Precio no disponible'}</p>
                //<button>Ver Detalles</button>
            `;
            // Puedes añadir un evento de clic al botón "Ver Detalles" si necesitas una vista de detalle
            productListSection.appendChild(productCard);
        });
    }

    // Función para filtrar y buscar productos
    function filterAndSearchProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filteredProducts = allProducts.filter(product => {
            const matchesSearch = (product.nombre && product.nombre.toLowerCase().includes(searchTerm)) ||
                                  (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm));

            const matchesCategory = selectedCategory === 'all' ||
                                    (product.categoria && product.categoria.toLowerCase() === selectedCategory.toLowerCase());
            return matchesSearch && matchesCategory;
        });
        renderProducts(filteredProducts);
    }

    // Event Listeners
    searchInput.addEventListener('input', filterAndSearchProducts);
    categoryFilter.addEventListener('change', filterAndSearchProducts);
    resetFiltersButton.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilter.value = 'all';
        filterAndSearchProducts(); // Resetea los filtros y vuelve a renderizar
    });

    // Cargar productos cuando el DOM esté listo
    fetchProductsFromSheet();
});

// Ejemplo genérico, consulta la documentación de la librería específica
document.addEventListener('DOMContentLoaded', function() {
    // Si usas SimpleLightbox:
    var lightbox = new SimpleLightbox('.product-gallery a');
    // Si usas fslightbox.js (solo necesitas los atributos data-fslightbox en el HTML):
    //RefreshFsLightbox();
    // Si usas GLightbox:
    //var lightbox = GLightbox({ selector: '[data-lightbox]' });
});
