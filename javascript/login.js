const loginForm = document.getElementById("loginForm");
const USERS_API = "https://dummyjson.com/users";

if (loginForm) {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginBtn");
    const loginLoading = document.getElementById("loginLoading");
    const loginError = document.getElementById("loginError");

    // SUBMIT FORM
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim(); // ambil input user dan pass
        const password = passwordInput.value;

        loginError.hidden = true; // reset
        loginError.textContent = "";
        loginLoading.hidden = false;
        loginButton.disabled = true;

        try {
            const response = await fetch(USERS_API);
            if (!response.ok) {
                throw new Error(
                    "Gagal mengambil data pengguna."
                );
            }

            const data = await response.json();
            const user = data.users.find((item) => { // cari username & pass
                return (
                    item.username === username &&
                    item.password === password
                );
            });

            if (!user) { // kalau pengguna ga ditemukan
                throw new Error(
                    "Username atau password salah."
                );
            }

            const userData = { // nyimpan session 
                id: user.id,
                username: user.username,
                firstName: user.firstName
            };

            localStorage.setItem( // nyimpen ke localstorage
                "minjiStoreUser",
                JSON.stringify(userData)
            );
            window.location.href = "index.html"; //redirect
        } catch (error) {
            loginError.textContent =  // nampilin pesan error
                error.message ||
                "Terjadi kesalahan. Silakan coba lagi.";
            loginError.hidden = false;

        } finally {
            loginLoading.hidden = true;
            loginButton.disabled = false;
        }
    });
}