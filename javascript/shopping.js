const cartKey = "minjiStoreCart";

let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

function saveCart() {
    if (cart.length === 0) {
        localStorage.removeItem(cartKey);
    } else {
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }

    saveCart();
    updateCartBadge();
    renderCart();
}

function updateCartBadge() {
    const cartBadge = document.getElementById("cartBadge");

    let totalItems = 0;

    cart.forEach(function(item) {
        totalItems += item.quantity;
    });

    cartBadge.textContent = totalItems;
}

updateCartBadge();

const shoppingProductGrid = document.getElementById("productGrid");

shoppingProductGrid.addEventListener("click", function(event) {
    const button = event.target.closest(".add-cart-btn");

    if (!button) return;

    const productId = Number(button.dataset.id);
    const product = allProducts.find(item => item.id === productId);

    if (product) {
        addToCart(product);
    }
});

function formatRupiah(harga) {
    return "Rp " + (harga * 15000).toLocaleString("id-ID");
}

function renderCart() {
    const cartItemsList = document.getElementById("cartItemsList");
    const cartTotalAmount = document.getElementById("cartTotalAmount");

    cartItemsList.innerHTML = "";

    if (cart.length === 0) {
        cartItemsList.textContent = "Keranjang masih kosong.";
    }

    cart.forEach(function(item) {
        const baris = document.createElement("div");
        baris.className = "cart-item";

        const nama = document.createElement("span");
        nama.textContent = item.title + " - " +
            formatRupiah(item.price * item.quantity);

        const tombol = document.createElement("div");
        tombol.className = "cart-controls";

        tombol.innerHTML = `
            <button data-action="minus" data-id="${item.id}">−</button>
            <span>${item.quantity}</span>
            <button data-action="plus" data-id="${item.id}">+</button>
            <button data-action="remove" data-id="${item.id}">Hapus</button>
        `;

        baris.appendChild(nama);
        baris.appendChild(tombol);
        cartItemsList.appendChild(baris);
    });

        let total = 0;

        cart.forEach(function(item) {
        total += item.price * item.quantity;
    });
       cartTotalAmount.textContent = formatRupiah(total);
}

renderCart();

document.getElementById("cartItemsList").addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const productId = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "remove") {
        cart = cart.filter(item => item.id !== productId);
    } else {
        const item = cart.find(item => item.id === productId);

        if (!item) return;

        if (action === "plus") {
            item.quantity += 1;
        } else if (action === "minus" && item.quantity > 1) {
            item.quantity -= 1;
        }
    }

    saveCart();
    updateCartBadge();
    renderCart();
});

let visibleProductCount = 8;
const loadMoreBtn = document.getElementById("loadMoreBtn");

function showProductBatch() {
    const visibleProducts = filteredProducts.slice(0, visibleProductCount);

    renderProducts(visibleProducts);

    loadMoreBtn.hidden = visibleProductCount >= filteredProducts.length;

    const counter = document.getElementById("productCounter");
    counter.textContent =
        `${visibleProducts.length} from ${filteredProducts.length} Product`;
}

function resetShoppingPagination() {
    visibleProductCount = 8;
    showProductBatch();
}

loadMoreBtn.addEventListener("click", function() {
    visibleProductCount += 8;
    showProductBatch();
});
