const express = require('express');

const router = express.Router();

const newslettersController = require('../../../controllers/api/v1/newslettersController');

router.post('/subscribe', newslettersController.subscribe); // /api/v1/newsletters/subscribe
router.post('/send', newslettersController.sendNewsletters); // /api/v1/newsletters/send
router.get('/unsubscribe', newslettersController.unsubscribe); // /api/v1/newsletters/unsubscribe

module.exports = router;