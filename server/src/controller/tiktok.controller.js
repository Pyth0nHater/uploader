// TikTokController.js
const { GetLinksTikTok } = require('../service/get_tt_links');

async function getLinks(req, res) {
    try {
        const { id } = req.params;  // Assuming you're passing profile ID in the request params
        const newLinks = await GetLinksTikTok(id);
        
        if (newLinks) {
            res.status(200).json({ message: "New links found", links: newLinks });
        } else {
            res.status(200).json({ message: "No new links found" });
        }
    } catch (error) {
        console.error('Error in getLinks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getLinks
};
