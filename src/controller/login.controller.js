// controllers/authController.js
const loginGetCookies = require('../service/login_cookie');
const profileService = require('../service/profile.service');

exports.loginAndFetchCookies = async (req, res) => {
    try {
        const body = req.body;
        let isLogin = await loginGetCookies(body);
        if (isLogin){
            const profile = await profileService.createProfile(body);
            res.status(200).send(profile);
        }else{
            res.status(500).json({ message: "Login is failed"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

