const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');
const Media = mongoose.model('Media', new mongoose.Schema({ title: String, path: String, type: String }));

async function sync() {
    const files = fs.readdirSync('/home/neptune/vibecinema/frontend/');
    const mp4Files = files.filter(f => f.endsWith('.mp4'));
    
    for (let file of mp4Files) {
        // Update any entry that partially matches the filename
        await Media.updateOne(
            { title: { $regex: file.split('-').pop().replace('.mp4', ''), $options: 'i' } },
            { $set: { path: file, type: 'video' } }
        );
    }
    console.log('Database synced with physical files!');
    process.exit();
}
sync();
