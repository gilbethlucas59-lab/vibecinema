const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');

const Media = mongoose.model('Media', new mongoose.Schema({ 
    title: String, type: String, path: String, description: String 
}));

async function restore() {
    // Convert old "Sean Paul" movie to the new format
    await Media.updateOne({ title: /Sean Paul/i }, { : { type: 'video', path: 'sean_paul.mp4' } });
    // Convert old "Bad Genius" movie to the new format
    await Media.updateOne({ title: /Bad Genius/i }, { : { type: 'video', path: 'bad_genius.mp4' } });
    
    console.log('Media entries restored for the new gallery!');
    process.exit();
}
restore();
