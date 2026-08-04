const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');
const Media = mongoose.model('Media', new mongoose.Schema({ title: String, path: String, type: String, description: String }));

async function rebuild() {
    await Media.deleteMany({}); // Clear old, broken entries
    const files = fs.readdirSync('/home/neptune/vibecinema/frontend/');
    
    for (const file of files) {
        let type = '';
        if (file.endsWith('.mp4')) type = 'video';
        else if (file.endsWith('.mp3')) type = 'audio';
        else if (file.endsWith('.jpg') || file.endsWith('.png')) type = 'image';

        if (type) {
            await new Media({
                title: file.replace(/^[0-9]+-/, '').replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
                path: file,
                type: type,
                description: "Auto-synced from storage"
            }).save();
            console.log("Added to Gallery: " + file);
        }
    }
    console.log('--- REBUILD COMPLETE ---');
    process.exit();
}
rebuild();
