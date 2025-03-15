const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'seuemail@email.com', // utilize seu email
        pass: 'suasenha' // utilize sua senha gerada no link: https://myaccount.google.com/apppassword
    }
});

const mailOptions = {
    from: 'seuemail@gmail.com', // email que será enviado
    to: 'outroemail@gmail.com', // email que receberá a mensagem
    subject: 'Test Email',
    text: 'Hello from nodemailer!'
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Email sent: ' + info.response);
});