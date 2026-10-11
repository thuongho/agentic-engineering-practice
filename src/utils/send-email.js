// TODO: replace with real email provider (SendGrid, SES, etc.)

/**
 * @description Sends an email (currently a stub that only logs the recipient and subject to the console).
 * @param {Object} email - The email to send.
 * @param {string} email.to - Recipient address.
 * @param {string} email.subject - Subject line.
 * @param {string} email.body - Message body (not used by the stub).
 * @returns {Promise<{ sent: boolean, to: string, subject: string }>} Resolves with a send receipt.
 */
function sendEmail({ to, subject, body }) {
  console.log('[EMAIL] Sending to:', to, '| Subject:', subject);
  return Promise.resolve({ sent: true, to, subject });
}

module.exports = { sendEmail };
