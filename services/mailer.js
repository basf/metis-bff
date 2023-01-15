const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const mjml2html = require('mjml');

const { mail: mailOptions } = require('../config');

const mailer = nodemailer.createTransport(
    {
        host: mailOptions.host,
        port: mailOptions.port,
        auth: {
            user: mailOptions.user,
            pass: mailOptions.pass,
        },
    },
    {
        from: mailOptions.from,
    }
);

module.exports = {
    renderMail,
    sendMail,
    mailer,
};

function checkMailOptions(mailOptions) {
    return (
        mailOptions &&
        Object.keys(mailOptions) &&
        Object.keys(mailOptions).every((key) => mailOptions[key])
    );
}

async function sendMail(options) {
    if (checkMailOptions(mailOptions)) {
        try {
            return mailer.sendMail(options);
        } catch (err) {
            console.error('ERROR: mail sending failed', err);
            throw err;
        }
    } else {
        console.error('ERROR: mail options invalid');
    }
}

async function renderMail(template, vars = {}) {
    try {
        const content = await injectVars(template, vars);
        return mjml2html(content).html;
    } catch (err) {
        return '';
    }
}

async function injectVars(template, vars = {}) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(process.cwd(), template), { encoding: 'utf8' }, (err, data) => {
            if (err) return reject(err);

            let finalTemplate = data;

            Object.keys(vars).forEach((key) => {
                const regex = new RegExp(`{${key}}`, 'g');
                finalTemplate = finalTemplate.replace(regex, vars[key]);
            });

            return resolve(finalTemplate);
        });
    });
}
