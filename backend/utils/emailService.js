const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const createTransporter = () => {
  // For Gmail, you need to use an App Password
  // For other services, adjust accordingly
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send notice notification email
exports.sendNoticeEmail = async (userEmail, userName, notice) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping email notification.');
      return;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `New Notice: ${notice.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Notice Posted</h2>
          <p>Hello ${userName},</p>
          <p>A new notice has been posted on the Smart College Notice Board:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">${notice.title}</h3>
            <p style="color: #666;">${notice.content.substring(0, 200)}${notice.content.length > 200 ? '...' : ''}</p>
            <p style="color: #999; font-size: 12px;">Category: ${notice.category} | Priority: ${notice.priority}</p>
          </div>
          <p>Please log in to the portal to view the full notice and details.</p>
          <p style="color: #999; font-size: 12px;">This is an automated notification from SCNBCP.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send bulk notice notifications
exports.sendBulkNoticeEmails = async (users, notice) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping bulk email notifications.');
      return;
    }

    const transporter = createTransporter();
    
    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(user => {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `New Notice: ${notice.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">New Notice Posted</h2>
                <p>Hello ${user.name},</p>
                <p>A new notice has been posted on the Smart College Notice Board:</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #007bff; margin-top: 0;">${notice.title}</h3>
                  <p style="color: #666;">${notice.content.substring(0, 200)}${notice.content.length > 200 ? '...' : ''}</p>
                  <p style="color: #999; font-size: 12px;">Category: ${notice.category} | Priority: ${notice.priority}</p>
                </div>
                <p>Please log in to the portal to view the full notice and details.</p>
                <p style="color: #999; font-size: 12px;">This is an automated notification from SCNBCP.</p>
              </div>
            `
          };
          return transporter.sendMail(mailOptions);
        })
      );
    }
    
    console.log(`Bulk emails sent to ${users.length} users`);
  } catch (error) {
    console.error('Error sending bulk emails:', error);
  }
};

