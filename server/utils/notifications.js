import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// SMS client (using Twilio for demo - replace with local SMS service)
const smsClient = process.env.TWILIO_SID && process.env.TWILIO_TOKEN 
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  : null;

export const sendOrderConfirmationEmail = async (user, order) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h2>Order Confirmed!</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your order has been confirmed and is being processed.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Total Amount:</strong> ৳${order.totalAmount}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p>We'll notify you when your order is shipped.</p>
      <p>Thank you for choosing Online24 Pharmacy!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent');
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

export const sendOrderStatusSMS = async (phone, orderNumber, status) => {
  if (!smsClient) {
    console.warn('SMS client not configured - skipping SMS notification');
    return;
  }

  const messages = {
    confirmed: `Your order ${orderNumber} has been confirmed and is being processed. Track: online24pharmacy.com/orders`,
    processing: `Your order ${orderNumber} is being prepared for shipment.`,
    shipped: `Great news! Your order ${orderNumber} has been shipped and will arrive soon.`,
    delivered: `Your order ${orderNumber} has been delivered. Thank you for choosing Online24 Pharmacy!`
  };

  try {
    await smsClient.messages.create({
      body: messages[status] || `Order ${orderNumber} status updated to ${status}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
    console.log('SMS sent successfully');
  } catch (error) {
    console.error('SMS sending failed:', error);
  }
};

export const sendPrescriptionStatusEmail = async (user, prescription, status) => {
  const subject = status === 'approved' ? 'Prescription Approved' : 'Prescription Review Required';
  const message = status === 'approved' 
    ? 'Your prescription has been approved by our pharmacist. You can now order prescription medicines.'
    : 'Your prescription requires additional review. Please check your account for details.';

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: user.email,
    subject,
    html: `
      <h2>Prescription Update</h2>
      <p>Dear ${user.firstName},</p>
      <p>${message}</p>
      <p>Prescription ID: ${prescription.id}</p>
      ${prescription.adminNotes ? `<p><strong>Notes:</strong> ${prescription.adminNotes}</p>` : ''}
      <p>Visit your account to view details.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Prescription status email sent');
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

export const sendPrescriptionExpiryReminder = async (user, prescription) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: user.email,
    subject: `💊 Your prescription is expiring soon`,
    html: `
      <h2>Prescription Expiry Reminder</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your prescription from Dr. ${prescription.doctorName || 'your doctor'} is expiring in 3 days.</p>
      <p>Click here to reorder instantly: <a href="http://localhost:5173/my-prescriptions">Reorder Now</a></p>
      <p>Thank you for choosing Online24 Pharmacy!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Prescription expiry reminder sent to ${user.email}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};
