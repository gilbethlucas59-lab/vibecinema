const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');

const Media = mongoose.model('Media', new mongoose.Schema({ 
    title: String, type: String, path: String 
}));

async function fix() {
    // This tells the database to look for 'sean_paul.mp4' instead of a full link
    await Media.updateMany({}, { $set: { type: 'video' } });
    console.log('Database updated. Refresh your browser!');
    process.exit();
}
fix();
