// Endpoint API Resmi Modul 2
const PRODUCTS_API = "https://dummyjson.com/products?limit=100";

// State Global
let allProducts = [];
let filteredProducts = [];

// Elemen DOM Katalog
const productGrid = document.getElementById("productGrid");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const productCounter = document.getElementById("productCounter");
const catalogLoading = document.getElementById("catalogLoading");
const catalogError = document.getElementById("catalogError");

// Elemen DOM Modal Detail Produk
const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBody = document.getElementById("modalBody");

// Elemen DOM Modal Keranjang Belanja
const cartModal = document.getElementById("cartModal");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartBtn = document.getElementById("cartBtn");

// Inisialisasi saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupEventListeners();
});

/**
 * 1. MENGAMBIL DATA DARI DUMMYJSON API (FETCH)
 */
async function fetchProducts() {
    if (catalogLoading) catalogLoading.style.display = "block";
    if (catalogError) catalogError.style.display = "none";

    try {
        const response = await fetch(PRODUCTS_API);
        
        if (!response.ok) {
            throw new Error(`Gagal mengambil data dari API (Status: ${response.status})`);
        }

        const data = await response.json();
        allProducts = data.products;
        filteredProducts = [...allProducts];

        populateCategoryOptions(allProducts);
        applyFiltersAndRender();
    } catch (error) {
        if (catalogError) {
            catalogError.textContent = error.message || "Terjadi kesalahan saat memuat katalog produk.";
            catalogError.style.display = "block";
        }
    } finally {
        if (catalogLoading) catalogLoading.style.display = "none";
    }
}

/**
 * 2. MENAMPILKAN OPTION KATEGORI SECARA DINAMIS
 */
function populateCategoryOptions(products) {
    if (!categorySelect) return;

    // Bersihkan dulu tapi tetap simpan option "All Category"
    categorySelect.innerHTML = '<option value="all">All Category</option>';

    const categories = [...new Set(products.map((item) => item.category))];

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
}

/**
 * 3. TEKNIK DEBOUNCE DENGAN CLOSURE (SEARCH)
 */
function debounce(fn, delay = 300) {
    let timerId;
    return function (...args) {
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

/**
 * 4. FILTERING & SORTING (SEARCH, FILTER, SORTING)
 */
function applyFiltersAndRender() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedCategory = categorySelect ? categorySelect.value : "all";
    const selectedSort = sortSelect ? sortSelect.value : "default";

    let result = allProducts.filter((product) => {
        const matchesSearch =
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query);

        const matchesCategory =
            selectedCategory === "all" || product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Urutkan Produk
    if (selectedSort === "price-asc") {
        result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-desc") {
        result.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "rating-desc") {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    filteredProducts = result;
    renderProducts(filteredProducts);
}

/**
 * 5. RENDER KARTU PRODUK KE GRID
 */
function renderProducts(products) {
    if (!productGrid) return;
    productGrid.innerHTML = "";

    if (productCounter) {
        productCounter.textContent = `${products.length} from ${allProducts.length} Product`;
    }

    if (products.length === 0) {
        productGrid.innerHTML = `
            <p style="grid-column: 1 / -1; text-align: center; font-weight: bold; color: #3b2d28;">
                Produk tidak ditemukan.
            </p>`;
        return;
    }

    products.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = product.id;

        const formattedPrice = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(product.price * 15000);

        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
            <h3>${product.title}</h3>
            <div class="price-rating">
                <span>${formattedPrice}</span>
                <span class="rating-text">★ ${product.rating || '4.0'}</span>
            </div>
            <button class="add-cart-btn" data-id="${product.id}">Tambah ke Keranjang</button>
        `;

        productGrid.appendChild(card);
    });
}

/**
 * 6. MEMBUKA MODAL DETAIL PRODUK SAAT PRODUK DIKLIK
 */
function showProductDetail(product) {
    if (!modalBody || !productModal) return;

    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(product.price * 15000);

    modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px; color: #3b2d28;">
            <img src="${product.thumbnail}" alt="${product.title}" style="width: 100%; max-height: 200px; object-fit: contain; background: #fff; border-radius: 12px;">
            <h2 style="font-size: 20px; color: #3b2d28;">${product.title}</h2>
            <div style="font-size: 18px; font-weight: bold; color: #F11370;">${formattedPrice} ★ ${product.rating}</div>
            <p><strong>Kategori:</strong> ${product.category}</p>
            <p><strong>Stok:</strong> ${product.stock} pcs</p>
            <p><strong>Deskripsi:</strong> ${product.description}</p>
        </div>
    `;

    productModal.style.display = "flex";
}

/**
 * 7. EVENT LISTENERS
 */
function setupEventListeners() {
    // Search dengan Debounce
    if (searchInput) {
        const handleDebouncedSearch = debounce(() => {
            applyFiltersAndRender();
        }, 400);

        searchInput.addEventListener("input", handleDebouncedSearch);
    }

    // Filter Kategori & Sorting
    if (categorySelect) categorySelect.addEventListener("change", applyFiltersAndRender);
    if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);

    // EVENT DELEGATION: Klik Kartu Produk untuk membuka Modal Detail
    if (productGrid) {
        productGrid.addEventListener("click", (e) => {
            const card = e.target.closest(".product-card");
            if (!card) return;

            // Jika yang diklik BUKAN tombol 'Tambah ke Keranjang', tampilkan Modal Detail
            if (!e.target.classList.contains("add-cart-btn")) {
                const productId = parseInt(card.dataset.id);
                const product = allProducts.find((p) => p.id === productId);
                if (product) showProductDetail(product);
            }
        });
    }

    // Event Listener untuk Tombol Tutup & Keranjang
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            productModal.style.display = "none";
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", () => {
            cartModal.style.display = "none";
        });
    }

    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            cartModal.style.display = "flex";
        });
    }
}