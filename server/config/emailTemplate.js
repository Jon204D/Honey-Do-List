require('dotenv').config();
const sendGridAPI = process.env.SendGridApiKey;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sendGridAPI);
const businessEmail = 'jdameus2025@fau.edu';
const businessPOCEmail = 'jonathan.dameus@emerge-it.net';

function sendVerification(email, username) {
    const sentEmail = false;
    const msg = {
    to: email,
    from: {name:'Honey Do List', email: businessEmail},
    subject: 'Honey Do List Account Activation',
    html: '<h1 style="font-size: 22px; font-family: Montserrat, sans-serif;">Hello ' + username.toLowerCase() + ', </h1>' + 
    '\n\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">Thank you for registering with "Honey Do List".</p>' +
    '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">Kindly click "Verify my account" below to verify your account.</p>' +
    '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;"><a href="'+ process.env.FRONTEND_BASE_URL + "/AccountVerification/" + username.toLowerCase() + '">Verify my account</a></p>'
    }
    sgMail
    .send(msg)
    .then(() => {
        sentEmail = true;
        return;
    })
    .catch(error => {
        console.error(error);
        return;
    });
    return sentEmail;
}

function sendRecoveryVerification(email, username) {
    sentEmail = false;
    const msg = {
        to: email,
        from: {name:'Honey Do List', email: businessEmail},
        subject: 'Honey Do List Account Recovery',
        html: '<h1 style="font-size: 22px; font-family: Montserrat, sans-serif;">Hello ' + username.toLowerCase() + ', </h1>' + 
        '\n\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">This email is to provide you with your Honey Do List recovery link.</p>' +
        '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">Kindly click "Recover my account" below to verify your account.</p>' +
        '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;"><a href="'+ process.env.FRONTEND_BASE_URL + '/ForgotPasswordVerification/' + username.toLowerCase() + '">Recover my account</a></p>'
    }
    sgMail
    .send(msg)
    .then(() => {
        sentEmail = true;
        return;
    })
    .catch(error => {
        console.error(error);
        return;
    });
    return sentEmail;
}

module.exports = {
    sendVerification,
    sendRecoveryVerification
};