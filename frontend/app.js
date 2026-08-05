const notyf = new Notyf({ duration: 5000, position: { x: 'right', y: 'top' } });
let notificationHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const menuContainer = document.getElementById('sliding-menu');

    if (toggleBtn && menuContainer) {
        toggleBtn.addEventListener('click', () => {
            menuContainer.classList.toggle('closed');
        });
    }

    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            if(window.innerWidth <= 768) {
                const menu = document.getElementById('sliding-menu');
                if(menu) menu.classList.add('closed');
            }
        });
    });
    checkAuth();
    listenForNotifications();
    fetchCategories();
});

function listenForNotifications() {
    const eventSource = new EventSource('/api/admin/notifications');
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        notificationHistory.push(data.message);
        document.getElementById('notif-badge').innerText = notificationHistory.length;
        document.getElementById('notification-bell').style.display = 'block';
        notyf.success(data.message);
    };
}

function toggleNotificationDropdown() {
    if(notificationHistory.length === 0) return notyf.info('No new notifications.');
    let msg = "📢 Recent Activity:\n";
    notificationHistory.slice(-5).forEach(n => msg += `\n• ${n}`);
    alert(msg);
    document.getElementById('notif-badge').innerText = '0';
}

async function fetchCategories() {
    const res = await fetch('/api/media');
    const data = await res.json();
    const cats = [...new Set(data.map(item => item.category).filter(c => c))];
    const container = document.getElementById('categories-container');
    const list = document.getElementById('categories-list');
    if(cats.length > 0) {
        container.style.display = 'block';
        list.innerHTML = cats.map(c => `<a href="#" class="nav-item sub-item" onclick="loadViewByCategory('${c}')">📂 ${c}</a>`).join('');
    } else {
        container.style.display = 'none';
    }
}

function loadViewByCategory(cat) {
    loadView('category', cat);
}

async function checkAuth() {
    const res = await fetch('/api/me', { credentials: 'include' });
    const data = await res.json();
    const avatar = document.getElementById('user-avatar');
    const welcome = document.getElementById('user-welcome');
    if(data.loggedIn) {
        welcome.innerText = data.displayName || data.username;
        avatar.innerHTML = data.profilePic ? `<img src="${data.profilePic}" style="width:100%;height:100%;object-fit:cover;">` : (data.displayName ? data.displayName.charAt(0).toUpperCase() : data.username.charAt(0).toUpperCase());
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'block';
        document.getElementById('watch-later-link').style.display = 'block';
        if(data.isAdmin) document.getElementById('admin-link').style.display = 'block';
        loadView('home');
    } else {
        welcome.innerText = 'Guest';
        avatar.innerText = 'G';
        document.getElementById('login-link').style.display = 'block';
        document.getElementById('register-link').style.display = 'block';
        document.getElementById('logout-link').style.display = 'none';
        document.getElementById('watch-later-link').style.display = 'none';
        document.getElementById('admin-link').style.display = 'none';
        loadView('login');
    }
}

function loadView(view, category = '', mediaId = null) {
    const container = document.getElementById('main-container');
    switch(view) {
        case 'home': renderMedia('all', ''); break;
        case 'videos': renderMedia('video', ''); break;
        case 'audios': renderMedia('audio', ''); break;
        case 'photos': renderMedia('photo', ''); break;
        case 'games': renderMedia('game', ''); break;
        case 'category': renderMedia('all', category); break;
        case 'most-watched': renderMostWatched(); break;
        case 'trending': renderTrending(); break;
        case 'watch-later': renderWatchLater(); break;
        case 'admin': renderAdminPanel(); break;
        case 'profile': renderProfile(); break;
        case 'login': renderLogin(); break;
        case 'register': renderRegister(); break;
        case 'reset': renderResetPassword(); break;
        case 'upload': renderUpload(); break;
        case 'watch': renderWatchPage(mediaId); break;
        default: container.innerHTML = `<h2 class="page-title">Under Construction</h2>`;
    }
}

function renderLogin() {
    document.getElementById('main-container').innerHTML = `
        <h2 class="page-title" style="text-align:center;">Login</h2>
        <div class="auth-form">
            <input type="text" id="login-input" placeholder="Username or Email">
            <input type="password" id="login-pass" placeholder="Password">
            <button onclick="loginUser()">Login</button>
            <p style="text-align:center;margin-top:15px;color:#888;">
                <a href="#" onclick="loadView('reset')" style="color:#e50914;text-decoration:none;">Forgot Password?</a>
            </p>
        </div>
    `;
}

function renderRegister() {
    document.getElementById('main-container').innerHTML = `
        <h2 class="page-title" style="text-align:center;">Register</h2>
        <div class="auth-form">
            <input type="text" id="reg-user" placeholder="Username">
            <input type="email" id="reg-email" placeholder="Email">
            <input type="password" id="reg-pass" placeholder="Password">
            <input type="password" id="reg-pass-confirm" placeholder="Confirm Password">
            <button onclick="registerUser()">Register</button>
        </div>
    `;
}

function renderResetPassword() {
    document.getElementById('main-container').innerHTML = `
        <h2 class="page-title" style="text-align:center;">Reset Password</h2>
        <div class="auth-form">
            <input type="email" id="reset-email" placeholder="Enter your Email">
            <button onclick="resetPassword()">Send Reset Link</button>
            <p style="text-align:center;margin-top:15px;color:#888;">
                <a href="#" onclick="loadView('login')" style="color:#e50914;text-decoration:none;">Back to Login</a>
            </p>
        </div>
    `;
}

async function loginUser() {
    const loginInput = document.getElementById('login-input').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    if(!loginInput || !pass) return notyf.error('Fill in both fields');
    const res = await fetch('/api/login', {
        method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include',
        body: JSON.stringify({loginInput: loginInput, password: pass})
    });
    const data = await res.json();
    if(res.ok) { notyf.success('Welcome back!'); checkAuth(); } 
    else { notyf.error(data.message); }
}

async function registerUser() {
    const user = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const passConfirm = document.getElementById('reg-pass-confirm').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!user || !email || !pass || !passConfirm) return notyf.error('Fill in all fields');
    if(!emailRegex.test(email)) return notyf.error('Invalid email');
    if(pass !== passConfirm) return notyf.error('Passwords do not match');
    if(pass.length < 6) return notyf.error('Password must be 6+ characters');
    const res = await fetch('/api/register', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username: user, email: email, password: pass})
    });
    const data = await res.json();
    if(res.ok) { notyf.success('Account created!'); loadView('login'); } 
    else { notyf.error(data.message); }
}

async function resetPassword() {
    const email = document.getElementById('reset-email').value.trim();
    if(!email) return notyf.error('Please enter your email');
    notyf.success('Reset link sent! (Configure email service in production).');
}

async function logoutUser() {
    await fetch('/api/logout', { method:'POST', credentials:'include' });
    notyf.success('Logged out');
    checkAuth();
}

function renderProfile() {
    document.getElementById('main-container').innerHTML = `
        <h2 class="page-title" style="text-align:center;">Edit Profile</h2>
        <div class="auth-form">
            <input type="text" id="prof-display" placeholder="Display Name">
            <div style="background:#222; padding:10px; border-radius:6px; color:#aaa; margin-bottom:15px; border:1px solid #333;">
                <p style="margin-bottom:5px;">Upload Profile Picture:</p>
                <input type="file" id="prof-pic-file" accept="image/*" style="color:#fff; padding:5px;">
            </div>
            <button onclick="updateProfile()">Save Changes</button>
        </div>
    `;
}

async function updateProfile() {
    const display = document.getElementById('prof-display').value.trim();
    const fileInput = document.getElementById('prof-pic-file');
    if(!display) return notyf.error('Display name required');
    document.getElementById('user-welcome').innerText = display;
    if(fileInput.files && fileInput.files[0]) {
        const fd = new FormData();
        fd.append('profilePic', fileInput.files[0]);
        const res = await fetch('/api/profile/upload-pic', { method:'POST', body:fd, credentials:'include' });
        const data = await res.json();
        if(res.ok) {
            document.getElementById('user-avatar').innerHTML = `<img src="${data.profilePic}" style="width:100%;height:100%;object-fit:cover;">`;
            notyf.success('Profile picture uploaded!');
        } else {
            notyf.error('Failed to upload picture.');
        }
    } else {
        notyf.success('Profile name updated!');
    }
}

async function renderAdminPanel() {
    const container = document.getElementById('main-container');
    container.innerHTML = `<h2 class="page-title" style="color:#e50914;">🛡️ Admin Control Panel</h2><p style="color:#888;">Loading data...</p>`;
    try {
        const userRes = await fetch('/api/admin/users', { credentials: 'include' });
        const users = await userRes.json();
        const mediaRes = await fetch('/api/media');
        const media = await mediaRes.json();
        let html = `<h3 style="color:#aaa; margin-top:20px;">Users (${users.length})</h3><div style="background:#1a1a1a; padding:15px; border-radius:8px; margin-bottom:20px;">`;
        users.forEach(u => {
            html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #333; padding:8px 0;">
                <span>${u.username} (${u.email})</span>
                ${!u.isAdmin ? `<button onclick="deleteUser('${u._id}')" style="background:#e50914; border:none; color:#fff; padding:2px 10px; border-radius:4px; cursor:pointer;">Ban</button>` : '<span style="color:#ffd700;">Admin</span>'}
            </div>`;
        });
        html += `</div>`;
        html += `<h3 style="color:#aaa;">Media (${media.length})</h3><div style="background:#1a1a1a; padding:15px; border-radius:8px;">`;
        media.forEach(m => {
            html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #333; padding:8px 0;">
                <span>${m.title} (${m.type})</span>
                <button onclick="deleteMedia('${m._id}')" style="background:#e50914; border:none; color:#fff; padding:2px 10px; border-radius:4px; cursor:pointer;">Delete</button>
            </div>`;
        });
        html += `</div>`;
        container.innerHTML += html;
    } catch (err) {
        container.innerHTML += `<p style="color:red;">Error loading admin data.</p>`;
    }
}

async function deleteUser(id) {
    if(!confirm('Ban this user?')) return;
    await fetch('/api/admin/users/' + id, { method:'DELETE', credentials:'include' });
    notyf.success('User banned');
    renderAdminPanel();
}

async function deleteMedia(id) {
    if(!confirm('Delete this media?')) return;
    await fetch('/api/admin/media/' + id, { method:'DELETE', credentials:'include' });
    notyf.success('Media deleted');
    renderAdminPanel();
}

async function renderWatchLater() {
    const container = document.getElementById('main-container');
    container.innerHTML = `<p style="text-align:center; color:#888;">Loading your list...</p>`;
    try {
        const res = await fetch('/api/watch-later', { credentials: 'include' });
        const mediaList = await res.json();
        let html = `<h2 class="page-title" style="color:#ffd700;">⭐ Watch Later</h2><div class="list-container">`;
        if(mediaList.length === 0) {
            html += `<p style="color:#888; text-align:center;">You haven't saved any videos yet.</p>`;
        } else {
            mediaList.forEach(m => {
                html += buildListItem(m, true);
            });
        }
        container.innerHTML = html + `</div>`;
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error loading your list.</p>`;
    }
}

async function removeWatchLater(id) {
    await fetch('/api/watch-later/' + id, { method: 'DELETE', credentials: 'include' });
    notyf.success('Removed');
    renderWatchLater();
}

async function renderMedia(type = 'all', category = '') {
    const container = document.getElementById('main-container');
    container.innerHTML = `<p style="text-align:center; color:#888;">Loading...</p>`;
    try {
        let url = '/api/media';
        const params = [];
        if (type !== 'all') params.push(`type=${type}`);
        if (category) params.push(`category=${category}`);
        if (params.length) url += '?' + params.join('&');
        const res = await fetch(url);
        const mediaList = await res.json();

        let savedIds = [];
        const authRes = await fetch('/api/me', { credentials: 'include' });
        const authData = await authRes.json();
        if(authData.loggedIn) {
            const wlRes = await fetch('/api/watch-later', { credentials: 'include' });
            const wlData = await wlRes.json();
            savedIds = wlData.map(item => item._id);
        }
        let title = '🎬 All Media';
        if (type === 'video') title = '🎬 Videos';
        else if (type === 'audio') title = '🎵 Audio';
        else if (type === 'photo') title = '🖼️ Photos';
        else if (type === 'game') title = '🎮 Games';
        if (category) title += ` • ${category}`;

        let html = `<h2 class="page-title">${title}</h2><div class="list-container">`;
        if(mediaList.length === 0) {
            html += `<p style="color:#888; text-align:center;">No media found.</p>`;
        } else {
            mediaList.forEach(m => {
                const isSaved = savedIds.includes(m._id);
                html += buildListItem(m, false, isSaved);
            });
        }
        container.innerHTML = html + `</div>`;
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error loading media.</p>`;
    }
}

function buildListItem(m, isWatchLater = false, isSaved = false) {
    let thumbHtml = '';
    let playIcon = '';
    if (m.type === 'video') {
        thumbHtml = `<video muted><source src="${m.path}"></video>`;
        playIcon = '▶️';
    } else if (m.type === 'audio') {
        thumbHtml = `<div style="width:100%;height:100%;background:#222;display:flex;align-items:center;justify-content:center;font-size:30px;">🎵</div>`;
        playIcon = '▶️';
    } else if (m.type === 'photo') {
        thumbHtml = `<img src="${m.path}">`;
        playIcon = '🖼️';
    } else if (m.type === 'game') {
        thumbHtml = `<div style="width:100%;height:100%;background:#222;display:flex;align-items:center;justify-content:center;font-size:30px;">🎮</div>`;
        playIcon = '🎮';
    }

    return `
        <div class="media-item" onclick="loadView('watch', '', '${m._id}')">
            <div class="thumb-container">
                ${thumbHtml}
                <div class="play-overlay">${playIcon}</div>
            </div>
            <div class="details-container">
                <div class="top-row">
                    <h3>${m.title}</h3>
                    <p>👁️ ${m.views || 0} views • 👍 ${m.likes || 0} likes</p>
                </div>
                <div class="actions-row">
                    <button onclick="event.stopPropagation(); toggleLike('${m._id}', this)" class="like-btn">
                        👍 Like
                    </button>
                    ${isWatchLater ? 
                        `<button onclick="event.stopPropagation(); removeWatchLater('${m._id}')" style="color:#e50914;">❌ Remove</button>` :
                        `<button onclick="event.stopPropagation(); toggleWatchLater('${m._id}', this)" class="${isSaved ? 'starred' : ''}">${isSaved ? '⭐' : '☆'} Save</button>`
                    }
                    <button onclick="event.stopPropagation(); loadView('watch', '', '${m._id}')">💬 Comment</button>
                    <button onclick="event.stopPropagation(); shareMedia('${m._id}')">🔗 Share</button>
                </div>
            </div>
        </div>
    `;
}

async function toggleWatchLater(id, btn) {
    const isSaved = btn.innerText.includes('⭐');
    if(isSaved) {
        await fetch('/api/watch-later/' + id, { method: 'DELETE', credentials: 'include' });
        btn.innerText = '☆ Save';
        btn.classList.remove('starred');
        notyf.success('Removed from Watch Later');
    } else {
        await fetch('/api/watch-later/' + id, { method: 'POST', credentials: 'include' });
        btn.innerText = '⭐ Save';
        btn.classList.add('starred');
        notyf.success('Added to Watch Later!');
    }
}

async function toggleLike(id, btn) {
    const res = await fetch('/api/media/like/' + id, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if(res.ok) {
        if(data.liked) {
            btn.innerHTML = '👍 Liked';
            btn.classList.add('liked');
            notyf.success('Liked!');
        } else {
            btn.innerHTML = '👍 Like';
            btn.classList.remove('liked');
            notyf.success('Unliked');
        }
        loadView('videos');
    } else {
        notyf.error('Please log in to like.');
    }
}

function shareMedia(id) {
    const url = window.location.origin + '/?watch=' + id;
    navigator.clipboard.writeText(url).then(() => {
        notyf.success('Link copied to clipboard!');
    }).catch(() => {
        notyf.error('Failed to copy link.');
    });
}

async function renderWatchPage(id) {
    const container = document.getElementById('main-container');
    container.innerHTML = `<p style="text-align:center; color:#888;">Loading media...</p>`;
    try {
        const res = await fetch('/api/media/' + id);
        const media = await res.json();
        const commentRes = await fetch('/api/comments/' + id);
        const comments = await commentRes.json();

        let html = `
            <button onclick="loadView('videos')" style="background:transparent; border:none; color:#e50914; cursor:pointer; font-size:1rem; margin-bottom:15px;">← Back to Videos</button>
            <div style="background:#1a1a1a; border-radius:12px; padding:20px; max-width:800px; margin:0 auto;">
                <div style="width:100%; background:#000; border-radius:8px; overflow:hidden;">
                    ${getThumbnail(media)}
                </div>
                <h2 style="color:#fff; margin-top:15px;">${media.title}</h2>
                <p style="color:#888;">👁️ ${media.views || 0} views • 👍 ${media.likes || 0} likes</p>
                <hr style="border:0;border-top:1px solid #333; margin:20px 0;">
                <h3 style="color:#e50914;">Comments</h3>
                <div id="comment-section" style="margin-top:10px;">
        `;
        if(comments.length === 0) {
            html += `<p style="color:#888;">No comments yet. Be the first!</p>`;
        } else {
            comments.forEach(c => {
                html += `<div style="background:#222; padding:10px; border-radius:6px; margin-bottom:8px;">
                    <strong style="color:#e50914;">${c.username}</strong>
                    <span style="color:#888; font-size:0.8rem; margin-left:10px;">${new Date(c.createdAt).toLocaleString()}</span>
                    <p style="color:#ddd; margin-top:3px;">${c.text}</p>
                </div>`;
            });
        }
        html += `
                </div>
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <input type="text" id="comment-input" placeholder="Write a comment..." style="flex:1; background:#222; border:1px solid #333; padding:10px; border-radius:6px; color:#fff;">
                    <button onclick="postComment('${id}')" style="background:#e50914; border:none; color:#fff; padding:10px 20px; border-radius:6px; cursor:pointer;">Post</button>
                </div>
            </div>
        `;
        container.innerHTML = html;
        await fetch('/api/media/view/' + id, { method: 'POST' });
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error loading media.</p>`;
    }
}

async function postComment(mediaId) {
    const text = document.getElementById('comment-input').value.trim();
    if(!text) return notyf.error('Comment cannot be empty');
    const res = await fetch('/api/comments/' + mediaId, {
        method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include',
        body: JSON.stringify({text: text})
    });
    const data = await res.json();
    if(res.ok) {
        notyf.success('Comment posted!');
        renderWatchPage(mediaId);
    } else {
        notyf.error(data.message);
    }
}

function getThumbnail(m) {
    if (m.type === 'video') return `<video style="width:100%;height:200px;object-fit:cover;" controls><source src="${m.path}"></video>`;
    else if (m.type === 'audio') return `<div style="width:100%;height:200px;background:#222;display:flex;align-items:center;justify-content:center;font-size:40px;">🎵</div>`;
    else if (m.type === 'photo') return `<img src="${m.path}" style="width:100%;height:200px;object-fit:cover;">`;
    else if (m.type === 'game') return `<div style="width:100%;height:200px;background:#222;display:flex;align-items:center;justify-content:center;font-size:40px;">🎮</div>`;
}

async function renderMostWatched() {
    const container = document.getElementById('main-container');
    container.innerHTML = `<p style="text-align:center; color:#888;">Loading...</p>`;
    try {
        const res = await fetch('/api/most-watched');
        const mediaList = await res.json();
        let html = `<h2 class="page-title" style="color:#ffd700;">👑 Most Watched</h2><div class="list-container">`;
        if(mediaList.length === 0) {
            html += `<p style="color:#888;">No stats yet.</p>`;
        } else {
            mediaList.forEach((m, index) => {
                html += `<div class="media-item" onclick="loadView('watch', '', '${m._id}')">
                    <div style="position:absolute; background:#ffd700; color:#000; padding:5px 12px; border-radius:0 0 10px 0; font-weight:bold; font-size:1.1rem; z-index:10;">#${index + 1}</div>
                    ${buildListItem(m)}
                </div>`;
            });
        }
        container.innerHTML = html + `</div>`;
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error.</p>`;
    }
}

async function renderTrending() {
    const container = document.getElementById('main-container');
    container.innerHTML = `<p style="text-align:center; color:#888;">Loading...</p>`;
    try {
        const res = await fetch('/api/trending');
        const mediaList = await res.json();
        let html = `<h2 class="page-title" style="color:#ff4500;">🔥 Trending</h2><div class="list-container">`;
        if(mediaList.length === 0) {
            html += `<p style="color:#888;">No recent trends.</p>`;
        } else {
            mediaList.forEach((m) => {
                html += `<div class="media-item" onclick="loadView('watch', '', '${m._id}')">
                    <div style="position:absolute; background:#ff4500; color:#fff; padding:5px 12px; border-radius:0 0 10px 0; font-weight:bold; z-index:10;">🔥</div>
                    ${buildListItem(m)}
                </div>`;
            });
        }
        container.innerHTML = html + `</div>`;
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error.</p>`;
    }
}

async function trackView(id) {
    await fetch('/api/media/view/' + id, { method: 'POST' });
}

function handleSearch() {
    const query = document.getElementById('search-bar').value.toLowerCase().trim();
    const container = document.getElementById('main-container');
    const items = container.querySelectorAll('.media-item');
    if(items.length > 0) {
        items.forEach(item => {
            const title = item.querySelector('.top-row h3').innerText.toLowerCase();
            item.style.display = title.includes(query) ? 'flex' : 'none';
        });
    } else {
        notyf.info('Search works on loaded media.');
    }
}

function renderUpload() {
    document.getElementById('main-container').innerHTML = `
        <h2 class="page-title" style="text-align:center;">Upload</h2>
        <div class="upload-form">
            <input type="text" id="up-title" placeholder="Title">
            <select id="up-type"><option value="video">Video</option><option value="audio">Audio</option><option value="photo">Photo</option><option value="game">Game</option></select>
            <select id="up-category"><option value="">No Category</option><option value="Education">Education</option><option value="Entertainment">Entertainment</option><option value="Documentary">Documentary</option><option value="Music">Music</option><option value="Gaming">Gaming</option></select>
            <textarea id="up-desc" placeholder="Description" rows="3"></textarea>
            <input type="file" id="up-file">
            <button onclick="uploadMedia()">Upload</button>
        </div>
    `;
}

async function uploadMedia() {
    const title = document.getElementById('up-title').value.trim();
    const type = document.getElementById('up-type').value;
    const category = document.getElementById('up-category').value;
    const desc = document.getElementById('up-desc').value.trim();
    const file = document.getElementById('up-file').files[0];
    if(!title || !file) return notyf.error('Title and file required');
    const fd = new FormData(); fd.append('title', title); fd.append('type', type); fd.append('category', category); fd.append('description', desc); fd.append('media', file);
    const res = await fetch('/api/upload', { method:'POST', body:fd, credentials:'include' });
    const data = await res.json();
    if(res.ok) { notyf.success('Uploaded!'); loadView('videos'); } 
    else { notyf.error(data.message); }
}
