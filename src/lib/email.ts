import { getResend } from "./resend";

const FROM_EMAIL = "SlotBuddy <noreply@slotbuddy.com>";

export async function sendBookingConfirmation({
  customerEmail,
  customerName,
  businessName,
  serviceName,
  date,
  time,
  businessPhone,
  businessAddress,
  cancellationToken,
  baseUrl,
}: {
  customerEmail: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  businessPhone?: string | null;
  businessAddress?: string | null;
  cancellationToken: string;
  baseUrl: string;
}) {
  const cancelUrl = `${baseUrl}/booking/cancel/${cancellationToken}`;
  const resend = getResend();

  await resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Your appointment at ${businessName} is confirmed`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Booking Confirmed</h2>
        <p>Hi ${customerName},</p>
        <p>Your appointment has been confirmed:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${serviceName}</strong><br/>
          ${date}<br/>
          ${time}
        </div>
        ${businessPhone ? `<p><strong>Phone:</strong> ${businessPhone}</p>` : ""}
        ${businessAddress ? `<p><strong>Address:</strong> ${businessAddress}</p>` : ""}
        <p>Need to cancel? <a href="${cancelUrl}">Cancel your appointment</a></p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">Sent by SlotBuddy</p>
      </div>
    `,
  });
}

export async function sendNewBookingNotification({
  ownerEmail,
  customerName,
  customerEmail,
  customerPhone,
  businessName,
  serviceName,
  date,
  time,
}: {
  ownerEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ownerEmail,
    subject: `New booking: ${customerName} - ${serviceName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>New Booking</h2>
        <p>You have a new booking at ${businessName}:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${serviceName}</strong><br/>
          ${date} at ${time}<br/><br/>
          <strong>Customer:</strong> ${customerName}<br/>
          <strong>Email:</strong> ${customerEmail}<br/>
          ${customerPhone ? `<strong>Phone:</strong> ${customerPhone}<br/>` : ""}
        </div>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">Sent by SlotBuddy</p>
      </div>
    `,
  });
}

export async function sendCancellationConfirmation({
  customerEmail,
  customerName,
  businessName,
  serviceName,
  date,
  time,
}: {
  customerEmail: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Your appointment at ${businessName} has been cancelled`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Appointment Cancelled</h2>
        <p>Hi ${customerName},</p>
        <p>Your appointment has been cancelled:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${serviceName}</strong><br/>
          ${date} at ${time}
        </div>
        <p>If this was a mistake, please rebook at your convenience.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">Sent by SlotBuddy</p>
      </div>
    `,
  });
}

export async function sendBookingReminder({
  customerEmail,
  customerName,
  businessName,
  serviceName,
  date,
  time,
  businessPhone,
  businessAddress,
  cancellationToken,
  baseUrl,
}: {
  customerEmail: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  businessPhone?: string | null;
  businessAddress?: string | null;
  cancellationToken: string;
  baseUrl: string;
}) {
  const cancelUrl = `${baseUrl}/booking/cancel/${cancellationToken}`;
  const resend = getResend();

  await resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Reminder: Your appointment at ${businessName} tomorrow`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Appointment Reminder</h2>
        <p>Hi ${customerName},</p>
        <p>This is a reminder about your appointment tomorrow:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${serviceName}</strong><br/>
          ${date}<br/>
          ${time}
        </div>
        ${businessPhone ? `<p><strong>Phone:</strong> ${businessPhone}</p>` : ""}
        ${businessAddress ? `<p><strong>Address:</strong> ${businessAddress}</p>` : ""}
        <p>Need to cancel? <a href="${cancelUrl}">Cancel your appointment</a></p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">Sent by SlotBuddy</p>
      </div>
    `,
  });
}
