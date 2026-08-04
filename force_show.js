const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');
const Media = mongoose.model('Media', new mongoose.Schema({ title: String, path: String, type: String }));

async function fix() {
    // Get all files currently in your frontend folder
    const files = fs.readdirSync('/home/neptune/vibecinema/frontend/');
    
    for (const file of files) {
        if (file.endsWith('.mp4') || file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.mp3')) {
            const type = file.endsWith('.mp4') ? 'video' : (file.endsWith('.mp3') ? 'audio' : 'image');
            
            // Upsert: update if title exists, otherwise create new entry
            await Media.findOneAndUpdate(
                { path: file }, 
                { title: file.split('-').pop(), path: file, type: type },
                { upsert: true }
            );
        }
    }
    console.log('Database synced! All physical files are now visible.');
    process.exit();
}
fix();
