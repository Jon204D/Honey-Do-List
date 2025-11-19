require('dotenv').config();
const sendGridAPI = process.env.SendGridApiKey;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sendGridAPI);
const businessEmail = 'jdameus2025@fau.edu';
const businessPOCEmail = 'jonathan.dameus@emerge-it.net';

async function sendVerification(email, username) {
    try {
        const msg = {
        to: email,
        from: {name:'Honey Do List', email: businessEmail},
        subject: 'Honey Do List Account Activation',
        html: '<h1 style="font-size: 22px; font-family: Montserrat, sans-serif;">Hello ' + username.toLowerCase() + ', </h1>' + 
        '\n\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">Thank you for registering with "Honey Do List".</p>' +
        '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">Kindly click "Verify my account" below to verify your account.</p>' +
        '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;"><a href="'+ process.env.FRONTEND_BASE_URL + "/AccountVerification/" + username.toLowerCase() + '">Verify my account</a></p>'
        };

        const result = await sgMail.send(msg);
        
        return {
            status: 'success',
            messageId: result[0]?.headers?.['x-message-id'],
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Email sending failed:', error);
        return {
            status: 'failed',
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        };
    }
}

async function sendRecoveryVerification(email, username) {
    try {
        const msg = {
            to: email,
            from: {name:'Honey Do List', email: businessEmail},
            subject: 'Honey Do List Account Recovery',
            html: '<h1 style="font-size: 22px; font-family: Montserrat, sans-serif;">Hello ' + username.toLowerCase() + ', </h1>' + 
            '\n\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">This email is to provide you with your Honey Do List recovery link.</p>' +
            '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">Kindly click "Recover my account" below to verify your account.</p>' +
            '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;"><a href="'+ process.env.FRONTEND_BASE_URL + '/ForgotPasswordVerification/' + username.toLowerCase() + '">Recover my account</a></p>'
        }
        
        const result = await sgMail.send(msg);

        return {
            status: 'success',
            messageId: result[0]?.headers?.['x-message-id'],
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Recovery email sending failed:', error);
        return {
            status: 'failed',
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        };
    }
}

async function sendDeleteNotification(email, username) {
    try {
        const msg = {
            to: email,
            from: {name:'Honey Do List', email: businessEmail},
            subject: 'Honey Do List Account Deletion Confirmation',
            html: '<h1 style="font-size: 22px; font-family: Montserrat, sans-serif;">Hello ' + username.toLowerCase() + ', </h1>' + 
            '\n\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">This email is to confirm the deletion of your Honey Do List account.</p>' +
            '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">If you did not request this deletion, please contact our support team immediately.</p>'
        }
        
        const result = await sgMail.send(msg);

        return {
            status: 'success',
            messageId: result[0]?.headers?.['x-message-id'],
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Recovery email sending failed:', error);
        return {
            status: 'failed',
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        };
    }
}

async function sendUpdateNotification(email, username) {
    try {
        const msg = {
            to: email,
            from: {name:'Honey Do List', email: businessEmail},
            subject: 'Honey Do List Account Update Notification',
            html: '<h1 style="font-size: 22px; font-family: Montserrat, sans-serif;">Hello ' + username.toLowerCase() + ', </h1>' + 
            '\n\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">This email is to notify you of updates to your Honey Do List account.</p>' +
            '\n<p style="font-size: 16px; font-family: Montserrat, sans-serif;">If you did not request these updates, please contact our support team immediately.</p>'
        }
        
        const result = await sgMail.send(msg);

        return {
            status: 'success',
            messageId: result[0]?.headers?.['x-message-id'],
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Update notification email sending failed:', error);
        return {
            status: 'failed',
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    sendVerification,
    sendRecoveryVerification,
    sendDeleteNotification,
    sendUpdateNotification
};