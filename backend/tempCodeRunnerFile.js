const express = require('express');
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});
const mongoose = require('mongoose');
const cors = require('cors');

const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Define absolute path for uploads
const UPLOAD_PATH = path.resolve(__dirname, 'uploads');

// Create folder if it doesn't exist
if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(UPLOAD_PATH));

// MongoDB Atlas Connection
mongoose.connect('mongodb+srv://gilbethlucas59_db_user:p4PR2SYAEo77pq8S@vibecinemacluster.abcde.mongodb.net/vibecinema?retryWrites=true&w=majority')
    .then(() => console.log('✅ MongoDB Atlas Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const Media = mongoose.model('Media', new mongoose.Schema({
    title: String,
    path: String,
    type: String,
    description: String
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const newMedia = new Media({
            title: req.body.title,
            path: 'http://localhost:5000/uploads/' + req.file.filename,
            type: req.body.type,
            description: req.body.description
        });
        await newMedia.save();
        res.json({ message: 'Upload Successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/api/media', async (req, res) => {
    try {
        const media = await Media.find();
        res.json(media);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching media' });
    }
});

app.listen(5000, () => console.log('🎬 VibeCinema Backend Active on Port 5000'));
