const Subscriber = require('../../../models/subscriber');
const { ErrorHandler, handleError } = require('../../../helpers/errorHandler');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        const subscriber = new Subscriber({ email });
        await subscriber.save();
        res.status(201).json({ message: 'Subscription successful' });
    } catch (error) {
        handleError(error, res);
    }
};

exports.sendNewsletters = async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        const emails = subscribers.map((subscriber) => subscriber.email);
    } catch (error) {
        handleError(error, res);
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const { uuid } = req.query;
        const subscriber = await Subscriber.findOne({ uuid });

        if (!subscriber) {
            throw new ErrorHandler(404, 'You are not subscribed to our newsletters');
        }

        await Subscriber.deleteOne({ uuid });
        res.status(200).json({ message: 'You have been unsubscribed' });
    } catch (error) {
        handleError(error, res);
    }
};

module.exports = router;