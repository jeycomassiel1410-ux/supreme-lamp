document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsStats = document.getElementById('resultsStats');
    const template = document.getElementById('resultCardTemplate');

    let database = [];

    // Load initial data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            database = data;
        })
        .catch(error => {
            console.error("Error loading data:", error);
            resultsStats.textContent = "Error al cargar la base de datos.";
        });

    // Remove accents for better search matching
    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    const renderResults = (results, query) => {
        resultsContainer.innerHTML = '';

        if (query.trim() === '') {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>Encuentra tu carrera fácilmente</h3>
                    <p>Busca por palabra clave, carrera, titulación o campo específico.</p>
                </div>
            `;
            resultsStats.textContent = 'Introduce un término para buscar';
            return;
        }

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">😕</div>
                    <h3>No encontramos resultados</h3>
                    <p>Intenta buscar con otros términos como "Medicina" o "Comercio".</p>
                </div>
            `;
            resultsStats.textContent = '0 resultados encontrados';
            return;
        }

        resultsStats.textContent = `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`;

        results.forEach((item, index) => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('.result-card');

            // Staggered animation delay
            card.style.animationDelay = `${index * 0.05}s`;

            clone.querySelector('.carrera-title').textContent = item.carrera;
            clone.querySelector('.campo-amplio-val').textContent = item.campo_amplio;
            clone.querySelector('.campo-especifico-val').textContent = item.campo_especifico;
            clone.querySelector('.campo-detallado-val').textContent = item.campo_detallado;
            clone.querySelector('.titulacion-val').textContent = item.titulacion;

            resultsContainer.appendChild(clone);
        });
    }

    const performSearch = () => {
        const query = searchInput.value;
        const normalizedQuery = removeAccents(query.toLowerCase());

        if (query.trim() === '') {
            renderResults([], query);
            clearBtn.classList.add('hidden');
            return;
        }

        clearBtn.classList.remove('hidden');

        // Simple fuzzy search across all values
        const results = database.filter(item => {
            return Object.values(item).some(val =>
                removeAccents(String(val).toLowerCase()).includes(normalizedQuery)
            );
        });

        // Sort results to prioritize matches in 'carrera'
        results.sort((a, b) => {
            const aCarrera = removeAccents(a.carrera.toLowerCase());
            const bCarrera = removeAccents(b.carrera.toLowerCase());

            if (aCarrera.includes(normalizedQuery) && !bCarrera.includes(normalizedQuery)) return -1;
            if (!aCarrera.includes(normalizedQuery) && bCarrera.includes(normalizedQuery)) return 1;
            return 0;
        });

        renderResults(results, query);
    };

    // Debounce search input to prevent performance issues
    let timeoutId;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(performSearch, 300);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        performSearch();
    });
});
