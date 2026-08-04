document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("sidebar-container");

    // Prevent error if element not found
    if (!container) return;

    fetch("sidebar.html")
        .then(res => res.text())
        .then(data => {
            container.innerHTML = data;

            // Attach logout AFTER sidebar is loaded
            const logoutBtn = document.querySelector(".logout-btn");

            if (logoutBtn) {
                logoutBtn.addEventListener("click", logout);
            }
        })
        .catch(err => {
            console.error("Sidebar load error:", err);
        });
});


// 🚪 Logout function (global)
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}