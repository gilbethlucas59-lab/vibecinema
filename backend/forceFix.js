const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/vibecinema').then(async () => {
    // This will update the FIRST movie it finds to Sean Paul
    // and the SECOND movie it finds to Bad Genius
    const movies = await mongoose.connection.db.collection('movies').find().toArray();
    
    if (movies.length > 0) {
        await mongoose.connection.db.collection('movies').updateOne(
            { _id: movies[0]._id },
            { $set: { videoPath: "sean_paul.mp4", title: "Sean Paul - She Doesn't Mind" } }
        );
        console.log('Movie 1 synced!');
    }
    
    if (movies.length > 1) {
        await mongoose.connection.db.collection('movies').updateOne(
            { _id: movies[1]._id },
            { $set: { videoPath: "bad_genius.mp4", title: "Bad Genius" } }
        );
        console.log('Movie 2 synced!');
    }

    process.exit();
});