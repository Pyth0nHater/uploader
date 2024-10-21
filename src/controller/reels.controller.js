const scrollReels = require('../service/reels');

exports.postReels = async (req, res) => {
    const { id } = req.params;

    try {
        await scrollReels(id);
        res.status(200).send('Reels posted successfully');
    } catch (error) {
        console.error('Error posting reels:', error);
        res.status(500).send('Error posting reels');
    }
};
