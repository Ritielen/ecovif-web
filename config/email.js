const nodemailer = require('nodemailer');


    const  transporter = nodemailer.createTransport({
        service: 'Hotmail',
          auth: {
            user: '',
            pass: ''
          }
      });

  module.exports = transporter;