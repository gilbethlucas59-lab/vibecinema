const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');

const Media = mongoose.model('Media', new mongoose.Schema({ title: String, path: String, type: String }));

async function wipe() {
    await Media.deleteMany({});
    console.log('--- DATABASE WIPED CLEAN ---');
    process.exit();
}
wipe();
