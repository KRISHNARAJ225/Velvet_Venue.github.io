const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to Velvet Venue! 🎉',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px; border-radius: 16px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Welcome to Velvet Venue!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your journey to amazing events starts here</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hello ${userName},</h2>
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for joining Velvet Venue! We're excited to have you as part of our community. 
              You can now create, discover, and manage amazing events with ease.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">What you can do:</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">🎯 Create and manage your own events</li>
                <li style="margin-bottom: 8px;">🔍 Discover exciting events around you</li>
                <li style="margin-bottom: 8px;">👥 Connect with other event enthusiasts</li>
                <li style="margin-bottom: 8px;">📈 Track your event performance</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" 
                 style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>Best regards,<br>The Velvet Venue Team</p>
            <p style="margin-top: 10px; font-size: 12px;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send event registration confirmation
const sendEventRegistrationEmail = async (userEmail, userName, eventTitle, eventDate, eventLocation) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Successfully Registered for ${eventTitle}! 🎉`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; border-radius: 16px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Registration Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">You're all set for the event</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hello ${userName},</h2>
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
              Great news! You have successfully registered for the event. We're excited to see you there!
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0 0 15px 0;">Event Details:</h3>
              <div style="color: #6b7280;">
                <p style="margin: 8px 0;"><strong>Event:</strong> ${eventTitle}</p>
                <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 8px 0;"><strong>Location:</strong> ${eventLocation}</p>
              </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Reminder:</strong> Please arrive 15 minutes before the event starts. Don't forget to bring any necessary items mentioned in the event description.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" 
                 style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; display: inline-block;">
                View My Events
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>Best regards,<br>The Velvet Venue Team</p>
            <p style="margin-top: 10px; font-size: 12px;">
              Need help? Contact us at support@velvetvenue.com
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Event registration email sent successfully');
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
};

// Send event cancellation notification
const sendEventCancellationEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Event Cancelled: ${eventTitle}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; border-radius: 16px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Event Cancelled</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">We apologize for the inconvenience</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hello ${userName},</h2>
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
              We regret to inform you that the following event has been cancelled:
            </p>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
              <h3 style="color: #991b1b; margin: 0 0 10px 0;">Cancelled Event:</h3>
              <p style="color: #6b7280; margin: 0; font-weight: 600;">${eventTitle}</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">What's Next?</h3>
              <p style="color: #6b7280; margin: 0;">
                We encourage you to explore other exciting events on our platform. 
                Your registration fee (if any) will be refunded automatically.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/explore" 
                 style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; display: inline-block;">
                Explore Other Events
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>We apologize for any inconvenience caused.<br>The Velvet Venue Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Event cancellation email sent successfully');
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendEventRegistrationEmail,
  sendEventCancellationEmail
};
