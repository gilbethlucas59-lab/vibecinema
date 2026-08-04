const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');
const Media = mongoose.model('Media', new mongoose.Schema({ title: String, path: String, type: String }));

async function sync() {
    await Media.deleteMany({}); // Clear old broken entries
    const files = fs.readdirSync('/home/neptune/vibecinema/frontend/');
    
    for (const file of files) {
        let type = '';
        if (file.endsWith('.mp4')) type = 'video';
        else if (file.endsWith('.mp3')) type = 'audio';
        else if (file.endsWith('.jpg') || file.endsWith('.png')) type = 'image';

        if (type) {
            await new Media({ title: file, path: file, type: type }).save();
            console.log('Successfully added to gallery: ' + file);
        }
    }
    process.exit();
}
sync();
