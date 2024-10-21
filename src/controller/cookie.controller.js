// controllers/authController.js
const loginGetCookies = require('../service/login_cookie');
const getCookies = require('../service/get_cookie');

exports.loginAndFetchCookies = async (req, res) => {
    try {
        const { id } = req.params;
        await loginGetCookies(id);
        res.status(200).json({ message: "Cookies fetched and saved successfully via login" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

exports.fetchCookies = async (req, res) => {
    try {
        const { id } = req.params;
        await getCookies(id);
        res.status(200).json({ message: "Cookies fetched and saved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};
