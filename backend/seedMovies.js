const mongoose = require('mongoose');

async function seed() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/vibecinema');
    const collection = mongoose.connection.db.collection('movies');

    const moviesToSeed = [
      {
        title: "Sean Paul - She Doesn't Mind",
        videoPath: "sean_paul.mp4",
        thumbnail: "https://via.placeholder.com/300/000000/FFFFFF?text=Sean+Paul",
        genre: "Music Video",
        description: "Official Music Video (720p)"
      },
      {
        title: "Bad Genius",
        videoPath: "bad_genius.mp4",
        thumbnail: "https://via.placeholder.com/300/000000/FFFFFF?text=Bad+Genius",
        genre: "Thriller",
        description: "Intellectual planning and brilliant ingenuity."
      }
    ];

    for (const movie of moviesToSeed) {
      await collection.updateOne(
        { videoPath: movie.videoPath },
        { $set: movie },
        { upsert: true }
      );
    }

    console.log('--- SYNC COMPLETE ---');
    console.log('Added/Updated: Sean Paul');
    console.log('Added/Updated: Bad Genius');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
