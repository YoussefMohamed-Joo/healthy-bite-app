const BREVO_API = 'https://api.brevo.com/v3/smtp/email'

const SENDER = { name: 'HealthyBite', email: 'bookbeacon.books@gmail.com' }

async function sendBrevo({ to, subject, html }) {
  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: SENDER, to: [{ email: to }], subject, htmlContent: html }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Brevo API error ${res.status}: ${text}`)
  }
}

function wrapHtml(body) {
  return `
    <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2E7D32; font-size: 24px; margin: 0;">HealthyBite</h1>
        <p style="color: #666; font-size: 14px;">أكل صحي يوصل لباب بيتك</p>
      </div>
      ${body}
      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="color: #999; font-size: 12px;">© 2026 HealthyBite. جميع الحقوق محفوظة.</p>
      </div>
    </div>`
}

function orderItemsHtml(order) {
  const items = (order.items || []).map(i => {
    const name = i.nameAr || 'منتج'
    return `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${name}</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">${i.quantity}</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: left;">${i.price} ج.م</td></tr>`
  }).join('')
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px;">
      <thead><tr style="background: #f0fdf4;"><th style="padding: 8px; text-align: right;">المنتج</th><th style="padding: 8px; text-align: center;">الكمية</th><th style="padding: 8px; text-align: left;">السعر</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot><tr><td colspan="2" style="padding: 8px 0; text-align: left; font-weight: bold;">الإجمالي</td><td style="padding: 8px 0; text-align: left; font-weight: bold; color: #2E7D32;">${order.total} ج.م</td></tr></tfoot>
    </table>`
}

export async function sendOtpEmail(email, otp) {
  await sendBrevo({
    to: email,
    subject: 'رمز التحقق - HealthyBite',
    html: wrapHtml(`
      <div style="background: white; padding: 24px; border-radius: 12px; text-align: center;">
        <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 16px;">رمز التحقق الخاص بك</h2>
        <div style="background: #f0fdf4; border: 2px dashed #2E7D32; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <span style="font-size: 36px; font-weight: bold; color: #2E7D32; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 13px;">هذا الرقم صالح لمدة <strong style="color: #2E7D32;">5 دقائق</strong></p>
        <p style="color: #999; font-size: 12px;">إذا لم تقم بطلب هذا الرمز، تجاهل هذه الرسالة.</p>
      </div>`),
  })
}

export async function sendOrderConfirmation(order, email) {
  await sendBrevo({
    to: email,
    subject: `تأكيد الطلب #${order._id.toString().slice(-6)} - HealthyBite`,
    html: wrapHtml(`
      <div style="background: white; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; background: #f0fdf4; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">✅</span>
          </div>
          <h2 style="color: #2E7D32; font-size: 20px; margin: 8px 0 0;">تم استلام طلبك بنجاح!</h2>
        </div>
        <p style="color: #666; font-size: 14px;">مرحباً <strong>${order.customerName}</strong>،</p>
        <p style="color: #666; font-size: 14px;">نشكرك على طلبك من HealthyBite. طلبك قيد المراجعة وسنبدأ في تجهيزه قريباً.</p>
        ${orderItemsHtml(order)}
        <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 13px; color: #666;">
          <p style="margin: 4px 0;"><strong>العنوان:</strong> ${order.customerAddress}</p>
          <p style="margin: 4px 0;"><strong>التليفون:</strong> ${order.customerPhone}</p>
          <p style="margin: 4px 0;"><strong>حالة الطلب:</strong> ${order.status === 'payment_pending' ? 'في انتظار تأكيد الدفع' : 'قيد المراجعة'}</p>
        </div>
      </div>`),
  })
}

export async function sendStatusUpdate(order, email) {
  const statusMap = {
    confirmed: { icon: '✅', text: 'تم تأكيد طلبك', color: '#2E7D32' },
    preparing: { icon: '👨‍🍳', text: 'جاري تجهيز طلبك', color: '#f59e0b' },
    delivering: { icon: '🛵', text: 'طلبك في الطريق إليك', color: '#3b82f6' },
    delivered: { icon: '🎉', text: 'تم توصيل طلبك', color: '#2E7D32' },
    cancelled: { icon: '❌', text: 'تم إلغاء الطلب', color: '#ef4444' },
    rejected: { icon: '❌', text: 'تم رفض الطلب', color: '#ef4444' },
  }
  const s = statusMap[order.status] || { icon: '📋', text: `تم تحديث الطلب إلى: ${order.status}`, color: '#666' }

  await sendBrevo({
    to: email,
    subject: `تحديث الطلب #${order._id.toString().slice(-6)} - ${s.text}`,
    html: wrapHtml(`
      <div style="background: white; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="width: 64px; height: 64px; background: #f0fdf4; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 32px;">${s.icon}</span>
          </div>
          <h2 style="color: ${s.color}; font-size: 20px; margin: 8px 0 0;">${s.text}</h2>
        </div>
        <p style="color: #666; font-size: 14px;">مرحباً <strong>${order.customerName}</strong>،</p>
        <p style="color: #666; font-size: 14px;">${order.status === 'rejected' && order.paymentInfo?.rejectionReason ? `سبب الرفض: ${order.paymentInfo.rejectionReason}` : ''}</p>
        ${orderItemsHtml(order)}
      </div>`),
  })
}

export async function sendPaymentVerified(order, email) {
  await sendBrevo({
    to: email,
    subject: `تأكيد الدفع #${order._id.toString().slice(-6)} - HealthyBite`,
    html: wrapHtml(`
      <div style="background: white; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; background: #f0fdf4; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">💳</span>
          </div>
          <h2 style="color: #2E7D32; font-size: 20px; margin: 8px 0 0;">تم تأكيد الدفع!</h2>
        </div>
        <p style="color: #666; font-size: 14px;">مرحباً <strong>${order.customerName}</strong>،</p>
        <p style="color: #666; font-size: 14px;">تم التحقق من عملية الدفع بنجاح. سنبدأ في تجهيز طلبك فوراً.</p>
        ${orderItemsHtml(order)}
      </div>`),
  })
}

export async function sendOrderCancelled(order, email, reason) {
  await sendBrevo({
    to: email,
    subject: `إلغاء الطلب #${order._id.toString().slice(-6)} - HealthyBite`,
    html: wrapHtml(`
      <div style="background: white; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; background: #fef2f2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">❌</span>
          </div>
          <h2 style="color: #ef4444; font-size: 20px; margin: 8px 0 0;">تم إلغاء الطلب</h2>
        </div>
        <p style="color: #666; font-size: 14px;">مرحباً <strong>${order.customerName}</strong>،</p>
        ${reason ? `<p style="color: #666; font-size: 14px;">السبب: ${reason}</p>` : ''}
        <p style="color: #666; font-size: 14px;">إذا كان لديك أي استفسار، يرجى التواصل معنا.</p>
        ${orderItemsHtml(order)}
      </div>`),
  })
}
