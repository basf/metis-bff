const { sendMail, renderMail } = require('../../../services/mailer');

module.exports = {
    sendVerifyEmail,
};

async function sendVerifyEmail(req, res, next) {
    if (req.user && !req.user.emailVerified && req.user.email) {
        const redirectURL = req.session.redirectURL || req.headers.origin || req.headers.referer;
        const verificationLink = `${req.protocol}://${req.get('host')}/v0/auth/verify?code=${
            req.user.emailCode
        }&redirectURL=${redirectURL}`;
        const html = await renderMail('emails/verifyEmail.html', { verificationLink });

        await sendMail({
            subject: 'Email Verification',
            to: req.user.email,
            html,
        });
    }
    return next();
}
