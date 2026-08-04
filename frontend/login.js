document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    // Grants access by redirecting to your media gallery (index.html)
    if(user && pass) {
        window.location.href = 'index.html';
    } else {
        alert("Enter both username and password to log in.");
    }
});
