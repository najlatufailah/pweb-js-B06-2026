
const PRODUCTS_API = "https://dummyjson.com/products?limit=100";


let allProducts = [];
let filteredProducts = [];

const productGrid = document.getElementById("productGrid");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const productCounter = document.getElementById("productCounter");
const catalogLoading = document.getElementById("catalogLoading");
const catalogError = document.getElementById("catalogError");

const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBody = document.getElementById("modalBody");

const cartModal = document.getElementById("cartModal");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartBtn = document.getElementById("cartBtn");

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupEventListeners();
});

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

function debounce(fn, delay = 300) {
    let timerId;
    return function (...args) {
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

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

    if (selectedSort === "price-asc") {
        result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-desc") {
        result.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "rating-desc") {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    filteredProducts = result;
    resetShoppingPagination();
}

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

function showProductDetail(product) {
    if (!modalBody || !productModal) return;

    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(product.price * 15000);

    modalBody.innerHTML = `
        <div class="modal-detail-container">
            <!-- Kolom Kiri: Foto Produk -->
            <div class="modal-left">
                <img src="${product.thumbnail}" alt="${product.title}" class="modal-img">
            </div>

            <!-- Kolom Kanan: Detail Teks -->
            <div class="modal-right">
                <span class="modal-badge-category">${product.category}</span>
                <h2 class="modal-title">${product.title}</h2>
                
                <div class="modal-tags">
                    <span class="modal-tag">Brand: ${product.brand || 'Beauty'}</span>
                    <span class="modal-tag">Stok tersisa: ${product.stock}</span>
                </div>

                <div class="modal-price-rating">
                    <span class="modal-price">${formattedPrice}</span>
                    <span class="modal-rating">★ ${product.rating || '4.0'}</span>
                </div>

                <div class="modal-description-box">
                    <h3>Deskripsi</h3>
                    <p>${product.description}</p>
                </div>

                <button class="add-cart-btn modal-cart-btn" data-id="${product.id}">
                    Tambah ke Keranjang
                </button>
            </div>
        </div>
    `;

    productModal.style.display = "flex";
}

function setupEventListeners() {
    if (searchInput) {
        const handleDebouncedSearch = debounce(() => {
            applyFiltersAndRender();
        }, 400);

        searchInput.addEventListener("input", handleDebouncedSearch);
    }

    if (categorySelect) categorySelect.addEventListener("change", applyFiltersAndRender);
    if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);

    if (productGrid) {
        productGrid.addEventListener("click", (e) => {
            const card = e.target.closest(".product-card");
            if (!card) return;

            if (!e.target.classList.contains("add-cart-btn")) {
                const productId = parseInt(card.dataset.id);
                const product = allProducts.find((p) => p.id === productId);
                if (product) showProductDetail(product);
            }
        });
    }

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