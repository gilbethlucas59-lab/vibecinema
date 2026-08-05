const express = require('express');
const path = require("path");
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const multer = require("multer");
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();

app.use(cors({ origin: 'http://localhost:5000', credentials: true }));
app.use(express.json());
app.use(session({
    secret: 'vibecinema_secret_key_2026',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// --- DATABASE CONNECTION ---
mongoose.connect('mongodb+srv://gilbethlucas59_db_user:p4PR2SYAEo77pq8S@vibecinemacluster.h4kfnxp.mongodb.net/?appName=VibeCinemaCluster')
    .then(() => console.log('✅ MongoDB Atlas Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- SCHEMAS ---
const Media = mongoose.model('media', new mongoose.Schema({
    title: String, path: String, type: String, category: String, description: String,
    views: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now }
}));

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    displayName: { type: String, default: '' },
    profilePic: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    watchLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }]
}));

// --- UPLOAD SETUP ---
const UPLOAD_PATH = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_PATH)) fs.mkdirSync(UPLOAD_PATH, { recursive: true });
app.use('/uploads', express.static(UPLOAD_PATH));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_PATH),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    res.status(401).json({ message: 'Please log in first' });
}

function isAdmin(req, res, next) {
    if (req.session.isAdmin) return next();
    res.status(403).json({ message: 'Admin access required' });
}

// --- SSE NOTIFICATIONS ---
let adminClients = []; 
app.get('/api/admin/notifications', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    adminClients.push(res);
    req.on('close', () => {
        adminClients = adminClients.filter(client => client !== res);
    });
});
function notifyAdmin(message) {
    adminClients.forEach(client => {
        client.write(`data: ${JSON.stringify({ message })}\n\n`);
    });
}

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body; 
        if (await User.findOne({ username })) return res.status(400).json({ message: 'Username taken' });
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email registered' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, displayName: username, watchLater: [] });
        await user.save();
        notifyAdmin(`🆕 New user: ${username}`);
        res.status(201).json({ message: 'Account created!' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { loginInput, password } = req.body;
        const user = await User.findOne({ $or: [{ username: loginInput }, { email: loginInput }] });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = user.isAdmin || false;
        res.json({ message: 'Login successful', username: user.username, isAdmin: user.isAdmin });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/me', async (req, res) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId);
        res.json({ loggedIn: true, username: user.username, displayName: user.displayName, profilePic: user.profilePic, isAdmin: user.isAdmin });
    } else {
        res.json({ loggedIn: false });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.json({ message: 'Logged out' });
    });
});

// --- ADMIN ROUTES ---
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.delete('/api/admin/media/:id', isAdmin, async (req, res) => {
    try {
        const media = await Media.findByIdAndDelete(req.params.id);
        if(media && media.path) {
            const filePath = path.join(__dirname, 'uploads', path.basename(media.path));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

// --- MEDIA & UPLOAD ROUTES ---
app.post('/api/upload', isAuthenticated, upload.single('media'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });
        const { title, type, category, description } = req.body; 
        const newMedia = new Media({
            title, path: 'http://localhost:5000/uploads/' + req.file.filename,
            type, category, description
        });
        await newMedia.save();
        res.json({ message: 'Upload Successful' });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server Error' }); }
});

app.get('/api/media', async (req, res) => {
    try {
        const media = await Media.find().sort({ uploadedAt: -1 });
        res.json(media);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/media/view/:id', async (req, res) => {
    try {
        await Media.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/most-watched', async (req, res) => {
    try {
        const media = await Media.find().sort({ views: -1 }).limit(10);
        res.json(media);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/trending', async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const media = await Media.find({ uploadedAt: { $gte: sevenDaysAgo } }).sort({ views: -1 }).limit(10);
        res.json(media);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

// --- WATCH LATER ROUTES ---
app.get('/api/watch-later', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('watchLater');
        res.json(user.watchLater);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.post('/api/watch-later/:id', isAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, { $addToSet: { watchLater: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.delete('/api/watch-later/:id', isAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, { $pull: { watchLater: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

// --- FRONTEND SERVING ---
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));

app.listen(5000, () => console.log('🎬 VibeCinema Backend Active on Port 5000'));
