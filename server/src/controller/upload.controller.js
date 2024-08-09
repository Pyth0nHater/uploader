const { main } = require('../service/auto_post'); // Adjust the path to where your main function is located

// Start processing a profile by ID
exports.processProfile = async (req, res) => {
    const { id } = req.params;
    
    try {
        await main(id);
        res.status(200).send({ message: 'Profile processing started successfully.' });
    } catch (error) {
        console.error('Error processing profile:', error);
        res.status(500).send({ message: 'Failed to process profile.', error: error.message });
    }
};
