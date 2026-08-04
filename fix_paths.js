const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');

const Movie = mongoose.model('Movie', new mongoose.Schema({ title: String, videoPath: String }));

async function fix() {
    await Movie.updateOne({ title: /Sean Paul/i }, { videoPath: 'sean_paul.mp4' });
    await Movie.updateOne({ title: /Bad Genius/i }, { videoPath: 'bad_genius.mp4' });
    console.log('Paths updated in Database!');
    process.exit();
}
fix();
