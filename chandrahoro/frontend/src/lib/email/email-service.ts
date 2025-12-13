/**
 * ChandraHoro V2.1 - Email Service
 * 
 * Handles sending emails with template support.
 * Designed to work with various email providers (SendGrid, Resend, etc.)
 * 
 * Features:
 * - Template-based email rendering
 * - Provider abstraction
 * - Error handling and logging
 * - HTML and text email support
 * - Unsubscribe link handling
 */

export interface EmailParams {
  to: string;
  subject: string;
  template: string;
  data: any;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using configured email provider
 */
export async function sendEmail(params: EmailParams): Promise<EmailResult> {
  try {
    console.log('[Email] Sending email:', {
      to: params.to,
      subject: params.subject,
      template: params.template,
    });
    
    const html = renderTemplate(params.template, params.data);
    const text = renderTextTemplate(params.template, params.data);
    
    // Use environment variable to determine email provider
    const provider = process.env.EMAIL_PROVIDER || 'console';
    
    switch (provider) {
      case 'resend':
        return await sendWithResend(params, html, text);
      case 'sendgrid':
        return await sendWithSendGrid(params, html, text);
      case 'console':
      default:
        return await sendWithConsole(params, html, text);
    }
  } catch (error: any) {
    console.error('[Email] Failed to send email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send email using Resend
 */
async function sendWithResend(
  params: EmailParams,
  html: string,
  text: string
): Promise<EmailResult> {
  // TODO: Implement Resend integration
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  
  console.log('[Email] Would send via Resend:', {
    to: params.to,
    subject: params.subject,
    from: params.from || 'ChandraHoro <noreply@chandrahoro.com>',
  });
  
  // Example implementation:
  /*
  try {
    const { data, error } = await resend.emails.send({
      from: params.from || 'ChandraHoro <noreply@chandrahoro.com>',
      to: params.to,
      subject: params.subject,
      html,
      text,
      replyTo: params.replyTo,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
  */
  
  return { success: true, messageId: 'resend-mock-id' };
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(
  params: EmailParams,
  html: string,
  text: string
): Promise<EmailResult> {
  // TODO: Implement SendGrid integration
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  console.log('[Email] Would send via SendGrid:', {
    to: params.to,
    subject: params.subject,
    from: params.from || 'noreply@chandrahoro.com',
  });
  
  // Example implementation:
  /*
  try {
    const msg = {
      to: params.to,
      from: params.from || 'noreply@chandrahoro.com',
      subject: params.subject,
      text,
      html,
      replyTo: params.replyTo,
    };
    
    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
  */
  
  return { success: true, messageId: 'sendgrid-mock-id' };
}

/**
 * Console logger for development/testing
 */
async function sendWithConsole(
  params: EmailParams,
  html: string,
  text: string
): Promise<EmailResult> {
  console.log('\n' + '='.repeat(60));
  console.log('📧 EMAIL PREVIEW');
  console.log('='.repeat(60));
  console.log(`To: ${params.to}`);
  console.log(`Subject: ${params.subject}`);
  console.log(`Template: ${params.template}`);
  console.log('─'.repeat(60));
  console.log('TEXT VERSION:');
  console.log(text);
  console.log('─'.repeat(60));
  console.log('HTML VERSION:');
  console.log(html);
  console.log('='.repeat(60) + '\n');
  
  return {
    success: true,
    messageId: `console-${Date.now()}`,
  };
}

/**
 * Render HTML email template
 */
function renderTemplate(template: string, data: any): string {
  switch (template) {
    case 'daily-reading':
      return renderDailyReadingTemplate(data);
    case 'admin-alert':
      return renderAdminAlertTemplate(data);
    case 'welcome':
      return renderWelcomeTemplate(data);
    default:
      return `<p>Template "${template}" not found</p>`;
  }
}

/**
 * Render text email template
 */
function renderTextTemplate(template: string, data: any): string {
  switch (template) {
    case 'daily-reading':
      return renderDailyReadingTextTemplate(data);
    case 'admin-alert':
      return renderAdminAlertTextTemplate(data);
    case 'welcome':
      return renderWelcomeTextTemplate(data);
    default:
      return `Template "${template}" not found`;
  }
}

/**
 * Daily reading HTML template
 */
function renderDailyReadingTemplate(data: any): string {
  const highlightsList = data.highlights
    ?.map((h: string) => `<li style="margin-bottom: 8px;">${h}</li>`)
    .join('') || '';
  
  const favorableTimings = data.favorableTimings
    ?.map((t: string) => `<li>${t}</li>`)
    .join('') || '';
  
  const avoidTimings = data.avoidTimings
    ?.map((t: string) => `<li>${t}</li>`)
    .join('') || '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Reading</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7C3AED; margin-bottom: 10px;">✨ ChandraHoro</h1>
        <p style="color: #666; margin: 0;">Your Daily Astrological Guidance</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #7C3AED; margin-top: 0;">Hello ${data.userName}!</h2>
        <p>Your personalized daily reading for <strong>${data.readingDate}</strong> is ready.</p>
      </div>
      
      ${data.highlights?.length ? `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 5px;">🌟 Key Highlights</h3>
        <ul style="padding-left: 20px;">
          ${highlightsList}
        </ul>
      </div>
      ` : ''}
      
      ${data.work ? `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #059669;">💼 Work & Career</h4>
        <p>${data.work}</p>
      </div>
      ` : ''}
      
      ${data.love ? `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #DC2626;">❤️ Love & Relationships</h4>
        <p>${data.love}</p>
      </div>
      ` : ''}
      
      ${data.health ? `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #7C2D12;">🏥 Health & Wellness</h4>
        <p>${data.health}</p>
      </div>
      ` : ''}
      
      ${data.finance ? `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #B45309;">💰 Finance & Money</h4>
        <p>${data.finance}</p>
      </div>
      ` : ''}
      
      ${favorableTimings || avoidTimings ? `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 5px;">⏰ Timings</h3>
        ${favorableTimings ? `
        <div style="margin-bottom: 15px;">
          <h4 style="color: #059669;">✅ Favorable Times</h4>
          <ul>${favorableTimings}</ul>
        </div>
        ` : ''}
        ${avoidTimings ? `
        <div>
          <h4 style="color: #DC2626;">⚠️ Times to Avoid</h4>
          <ul>${avoidTimings}</ul>
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.readingUrl}" style="background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Reading →</a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <p>May the stars guide your path today! 🌟</p>
        <p>
          <a href="${data.unsubscribeUrl}" style="color: #666;">Manage notification preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Daily reading text template
 */
function renderDailyReadingTextTemplate(data: any): string {
  const highlights = data.highlights?.map((h: string) => `• ${h}`).join('\n') || '';
  const favorableTimings = data.favorableTimings?.map((t: string) => `• ${t}`).join('\n') || '';
  const avoidTimings = data.avoidTimings?.map((t: string) => `• ${t}`).join('\n') || '';
  
  return `
ChandraHoro - Your Daily Reading

Hello ${data.userName}!

Your personalized daily reading for ${data.readingDate} is ready.

${highlights ? `KEY HIGHLIGHTS:
${highlights}

` : ''}${data.work ? `WORK & CAREER:
${data.work}

` : ''}${data.love ? `LOVE & RELATIONSHIPS:
${data.love}

` : ''}${data.health ? `HEALTH & WELLNESS:
${data.health}

` : ''}${data.finance ? `FINANCE & MONEY:
${data.finance}

` : ''}${favorableTimings ? `FAVORABLE TIMES:
${favorableTimings}

` : ''}${avoidTimings ? `TIMES TO AVOID:
${avoidTimings}

` : ''}View your full reading: ${data.readingUrl}

May the stars guide your path today!

Manage notifications: ${data.unsubscribeUrl}
  `.trim();
}

/**
 * Admin alert HTML template
 */
function renderAdminAlertTemplate(data: any): string {
  return `
    <h2>🚨 Admin Alert: ${data.subject}</h2>
    <p><strong>Timestamp:</strong> ${data.timestamp}</p>
    <h3>Results Summary:</h3>
    <ul>
      <li>Total: ${data.results.total}</li>
      <li>Successful: ${data.results.successful}</li>
      <li>Failed: ${data.results.failed}</li>
      <li>Skipped: ${data.results.skipped}</li>
    </ul>
    ${data.errors?.length ? `
    <h3>Sample Errors:</h3>
    <ul>
      ${data.errors.map((err: any) => `<li>${err.userId}: ${err.error}</li>`).join('')}
    </ul>
    ` : ''}
  `;
}

/**
 * Admin alert text template
 */
function renderAdminAlertTextTemplate(data: any): string {
  return `
Admin Alert: ${data.subject}

Timestamp: ${data.timestamp}

Results Summary:
- Total: ${data.results.total}
- Successful: ${data.results.successful}
- Failed: ${data.results.failed}
- Skipped: ${data.results.skipped}

${data.errors?.length ? `Sample Errors:
${data.errors.map((err: any) => `- ${err.userId}: ${err.error}`).join('\n')}` : ''}
  `.trim();
}

/**
 * Welcome email templates (placeholder)
 */
function renderWelcomeTemplate(data: any): string {
  return `<h1>Welcome to ChandraHoro, ${data.userName}!</h1>`;
}

function renderWelcomeTextTemplate(data: any): string {
  return `Welcome to ChandraHoro, ${data.userName}!`;
}
