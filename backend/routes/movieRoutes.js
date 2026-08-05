router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // optional: check owner
        if (movie.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }

        await movie.deleteOne();

        res.json({ message: "Movie deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});