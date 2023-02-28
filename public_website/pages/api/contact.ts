import {NextApiRequest, NextApiResponse} from "next";

interface IDiscordBody {
  embeds: any[];
}

interface IMailBody {
  name: string;
  email: string;
  company?: string;
  phoneNumber?: string;
  interests?: string[];
  otherInterest?: string;
}

enum MailReply {
  OK = 'Notification sent correctly',
  BAD_REQUEST = 'Missing body name and/or email',
  ERROR = 'Unexpected error'
}

// eslint-disable-next-line
export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const body: IMailBody = JSON.parse(req.body);
    if (!body || !body.name || !body.email)
      return res.status(400).json({msg: MailReply.BAD_REQUEST, status: 400});

    const errorSendingEmailNotification = sendEmailNotification(body);
    const response = await sendDiscordNotification(body);
    const errorSendingDiscordNotification = response.status >= 400;

    if(errorSendingEmailNotification && errorSendingDiscordNotification)
      return res.status(500).json({msg: MailReply.ERROR, status: 500});

    return res.status(201).json({msg: MailReply.OK, status: 201});
  } catch (e) {
    console.log(e);
    return res.status(500).json({msg: MailReply.ERROR, status: 500});
  }
}

const getInterests = (interestArray?: string[], otherInterest?: string) => {
  if(!interestArray || interestArray.length === 0) return 'N/A';
  return `${interestArray.join(', ')}.${otherInterest ? ` Also added: ${otherInterest}` : ''}`;
}

const sendDiscordNotification = (body: IMailBody): Promise<any> => {
  if(!process.env.DISCORD_CONTACT_WEBHOOK_URL) return Promise.reject();
  const discordBody: IDiscordBody = {
    embeds: [
      {
        title: 'New Radar Contact Submission',
        color: 4946917,
        fields: [
          {
            name: 'Name',
            value: body.name
          },
          {
            name: 'Email',
            value: body.email,
            url: `mailto:${body.email}`
          },
          {
            name: 'Company',
            value: !!body.company ? body.company : 'N/A'
          },
          {
            name: 'Phone Number',
            value: !!body.phoneNumber ? body.phoneNumber : 'N/A'
          },
          {
            name: 'Interests',
            value: getInterests(body.interests)
          },
          {
            name: 'Other Interests',
            value: body.otherInterest ?? 'N/A',
          }
        ]
      }
    ]
  };
  return fetch(process.env.DISCORD_CONTACT_WEBHOOK_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(discordBody)
  });
}

const sendEmailNotification = (body: IMailBody) => {
  const newUserEmailBody = `New Radar Contact Submission:<br/><br/>
      * Name: ${body.name}<br/>
      * Email: ${body.email}<br/>
      ${body.company ? `* Company: ${body.company}<br/>` : ''}
      ${body.phoneNumber ? `* Phone Number: ${body.phoneNumber}<br/>` : ''}
      ${body.interests ? `* Interests: ${getInterests(body.interests, body.otherInterest)}<br/>` : ''}
    `;
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: process.env.SMTP_AUTH_USER,
      pass: process.env.SMTP_AUTH_PASSWORD,
    },
    secure: true,
  });
  const mailData = {
    from: 'eugenio@exactlylabs.com',
    to: 'eugenio@exactlylabs.com',
    subject: 'New Contact Submission',
    html: `<div>${newUserEmailBody}</div>`,
    replyTo: body.email,
  }
  let errorSendingEmail = false;
  transporter.sendMail(mailData, (err: any, info: any) => {
    if (err) {
      console.error(err);
      errorSendingEmail = true;
    }
  });
  return errorSendingEmail;
}