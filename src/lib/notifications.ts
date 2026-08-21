import nodemailer from 'nodemailer'

interface NotificationItem {
  title: string
  quantity: number
  price: number
}

interface OrderNotificationParams {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerPincode: string
  totalAmount: number
  paymentMethod: string
  items: NotificationItem[]
}

/**
 * Creates a reusable nodemailer transporter based on environment variables
 */
function getTransporter() {
  const emailUser = process.env.SMTP_EMAIL
  const emailPass = process.env.SMTP_PASSWORD

  if (!emailUser || !emailPass) {
    return null
  }

  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  })
}

/**
 * Send SMS / Phone notification via SMS gateway or Webhook
 */
async function sendSmsNotification(phone: string, message: string) {
  try {
    const formattedPhone = phone.replace(/[^0-9+]/g, '')
    
    // Check if Fast2SMS or Twilio or Webhook is configured
    if (process.env.FAST2SMS_API_KEY) {
      // Fast2SMS integration (popular in India)
      await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: formattedPhone
        })
      })
      console.log(`[SMS] Fast2SMS dispatched to ${formattedPhone}`)
      return
    }

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      // Twilio SMS integration
      const twilioAuth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')
      const bodyParams = new URLSearchParams({
        To: formattedPhone.startsWith('+') ? formattedPhone : `+91${formattedPhone}`,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: message
      })

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      })
      console.log(`[SMS] Twilio dispatched to ${formattedPhone}`)
      return
    }

    if (process.env.SMS_WEBHOOK_URL) {
      // Generic Webhook integration for custom SMS / WhatsApp gateways
      await fetch(process.env.SMS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, message })
      })
      console.log(`[SMS] Webhook dispatched to ${formattedPhone}`)
      return
    }

    // Default simulated log when no API key is provided
    console.log(`[SMS Notification] (Configure FAST2SMS_API_KEY or TWILIO credentials in .env to send live SMS)`)
    console.log(`To: ${formattedPhone} | Message: ${message}`)
  } catch (err) {
    console.error(`[SMS Error] Failed to send SMS to ${phone}:`, err)
  }
}

/**
 * Sends both Email and Phone/SMS notifications to Customer and Admin upon order placement
 */
export async function sendOrderNotifications(params: OrderNotificationParams) {
  const {
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    customerPincode,
    totalAmount,
    paymentMethod,
    items
  } = params

  const shortOrderId = orderId.slice(0, 8).toUpperCase()
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_EMAIL || 'admin@daisy.com'
  const adminPhone = process.env.ADMIN_PHONE_NUMBER || ''

  const itemsListHtml = items.map(item => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('')

  const itemsSummaryText = items.map(i => `${i.quantity}x ${i.title}`).join(', ')

  // ─── 1. SEND CUSTOMER NOTIFICATIONS ─────────────────────────────────────────

  // Customer Email
  const transporter = getTransporter()
  if (transporter && customerEmail) {
    try {
      const customerMailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eedbf0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #d388be 0%, #b2589a 100%); color: #ffffff; padding: 25px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">Daisy Store</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Order Confirmation</p>
          </div>

          <div style="padding: 30px 25px;">
            <h2 style="color: #4a2040; margin-top: 0; font-size: 20px;">Thank you for your order, ${customerName}! 🌸</h2>
            <p style="color: #666; font-size: 15px; line-height: 1.5;">
              We have received your order <strong>#${shortOrderId}</strong>. Here are the details of your purchase:
            </p>

            <div style="background: #faf4f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #444;">
                <thead>
                  <tr style="background: #f0e2ed; color: #4a2040;">
                    <th style="padding: 8px 12px; text-align: left;">Item</th>
                    <th style="padding: 8px 12px; text-align: center;">Qty</th>
                    <th style="padding: 8px 12px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                  <tr>
                    <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right;">Total Amount:</td>
                    <td style="padding: 12px; font-weight: bold; text-align: right; color: #b2589a; font-size: 16px;">₹${totalAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-bottom: 20px; font-size: 14px; color: #555;">
              <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${paymentMethod === 'COD' ? '💵 Cash on Delivery (Pay upon arrival)' : '💳 UPI Payment'}</p>
              <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${customerAddress} (PIN: ${customerPincode})</p>
              <p style="margin: 4px 0;"><strong>Contact Phone:</strong> ${customerPhone}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${siteUrl}/track" style="display: inline-block; background: #b2589a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 25px; font-weight: bold; font-size: 14px;">
                Track Your Order Status
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;" />
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              If you have any questions, reply directly to this email or contact us. Thank you for shopping with Daisy!
            </p>
          </div>
        </div>
      `

      await transporter.sendMail({
        from: `"Daisy Store" <${process.env.SMTP_EMAIL}>`,
        to: customerEmail,
        subject: `🌸 Order Confirmed #${shortOrderId} - Daisy Store`,
        html: customerMailHtml,
      })
      console.log(`[Email] Customer confirmation sent to ${customerEmail}`)
    } catch (err) {
      console.error('[Email Error] Failed to send customer confirmation email:', err)
    }
  }

  // Customer SMS
  if (customerPhone) {
    const customerSmsText = `Daisy Store: Hi ${customerName}, your order #${shortOrderId} for ₹${totalAmount} (${paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI'}) has been placed successfully! Track at: ${siteUrl}/track`
    await sendSmsNotification(customerPhone, customerSmsText)
  }

  // ─── 2. SEND ADMIN NOTIFICATIONS ───────────────────────────────────────────

  // Admin Email
  if (transporter && adminEmail) {
    try {
      const adminMailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eedbf0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #4a2040; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">🛍️ New Order Alert!</h2>
            <p style="margin: 5px 0 0; font-size: 13px; color: #f5d3ee;">Order #${shortOrderId} received</p>
          </div>

          <div style="padding: 25px;">
            <div style="background: #fdf5fc; border-left: 4px solid #b2589a; padding: 12px 16px; margin-bottom: 20px;">
              <p style="margin: 2px 0; font-size: 15px;"><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
              <p style="margin: 2px 0; font-size: 15px;"><strong>Phone:</strong> ${customerPhone}</p>
              <p style="margin: 2px 0; font-size: 15px;"><strong>Address:</strong> ${customerAddress}, PIN: ${customerPincode}</p>
              <p style="margin: 2px 0; font-size: 15px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p style="margin: 2px 0; font-size: 16px; color: #b2589a;"><strong>Total Amount: ₹${totalAmount}</strong></p>
            </div>

            <h4 style="margin: 0 0 10px; color: #4a2040;">Ordered Items:</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #444; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f0e2ed; color: #4a2040;">
                  <th style="padding: 8px 12px; text-align: left;">Item</th>
                  <th style="padding: 8px 12px; text-align: center;">Qty</th>
                  <th style="padding: 8px 12px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <div style="text-align: center; margin-top: 25px;">
              <a href="${siteUrl}/admin/orders" style="display: inline-block; background: #4a2040; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                Open Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `

      await transporter.sendMail({
        from: `"Daisy Store Notifications" <${process.env.SMTP_EMAIL}>`,
        to: adminEmail,
        subject: `🚨 [New Order] #${shortOrderId} from ${customerName} - ₹${totalAmount} (${paymentMethod})`,
        html: adminMailHtml,
      })
      console.log(`[Email] Admin order alert sent to ${adminEmail}`)
    } catch (err) {
      console.error('[Email Error] Failed to send admin alert email:', err)
    }
  }

  // Admin SMS
  if (adminPhone) {
    const adminSmsText = `Daisy Alert: New order #${shortOrderId} received from ${customerName} for ₹${totalAmount} (${paymentMethod}). Items: ${itemsSummaryText}. Check admin panel!`
    await sendSmsNotification(adminPhone, adminSmsText)
  }
}
