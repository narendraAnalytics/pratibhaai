import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function buildInterviewHtml(params: {
  candidateName: string
  jobTitle: string
  companyName: string
  recruiterName: string
  interviewDate: string
  interviewTime: string
}): string {
  const { candidateName, jobTitle, companyName, recruiterName, interviewDate, interviewTime } = params
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Interview Invitation — ${jobTitle}</title>
</head>
<body style="margin:0;padding:0;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FB;padding:48px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="padding-bottom:24px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:8px;">
          <div style="width:32px;height:32px;background:#4F46E5;border-radius:8px;display:inline-block;vertical-align:middle;"></div>
          <span style="font-size:18px;font-weight:700;color:#111827;letter-spacing:-0.02em;vertical-align:middle;">Pratibha AI</span>
        </div>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">

        <!-- Indigo top bar -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:#4F46E5;padding:32px 40px 28px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#A5B4FC;">Interview Invitation</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;line-height:1.25;">You&rsquo;ve been shortlisted</h1>
            <p style="margin:8px 0 0;font-size:14px;color:#C7D2FE;line-height:1.5;">${jobTitle} at ${companyName}</p>
          </td></tr>
        </table>

        <!-- Body -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:36px 40px 0;">

            <!-- Greeting -->
            <p style="margin:0 0 6px;font-size:15px;color:#6B7280;">Hi ${candidateName},</p>
            <p style="margin:0 0 28px;font-size:15px;color:#111827;line-height:1.65;">
              We are pleased to inform you that your profile has been shortlisted for the next stage of the hiring process. Our team would like to invite you to an interview.
            </p>

            <!-- Interview details card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FB;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px 4px;">
                <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#6B7280;">Interview Details</p>
              </td></tr>
              <tr><td style="padding:0 24px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-size:13px;color:#6B7280;width:42%;">Position</td>
                    <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-size:13px;color:#111827;font-weight:500;">${jobTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-size:13px;color:#6B7280;">Interview Type</td>
                    <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-size:13px;color:#111827;font-weight:500;">Video / Online</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-size:13px;color:#6B7280;">Date</td>
                    <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-size:13px;color:#111827;font-weight:500;">${interviewDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-size:13px;color:#6B7280;">Time</td>
                    <td style="padding:6px 0;border-bottom:1px solid #E5E7EB;font-size:13px;color:#111827;font-weight:500;">${interviewTime}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#6B7280;">Duration</td>
                    <td style="padding:6px 0;font-size:13px;color:#111827;font-weight:500;">45–60 minutes</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- What to expect -->
            <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#111827;letter-spacing:-0.005em;">What to expect</p>
            <ul style="margin:0 0 24px;padding-left:20px;color:#6B7280;font-size:13px;line-height:2;">
              <li>Technical experience and projects</li>
              <li>Previous work experience</li>
              <li>Problem-solving approach</li>
              <li>Role-specific responsibilities</li>
              <li>Team collaboration and communication</li>
            </ul>

            <!-- Important notes -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;margin-bottom:32px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#92400E;">Important Notes</p>
                <ul style="margin:0;padding-left:18px;color:#78350F;font-size:13px;line-height:1.8;">
                  <li>Join the meeting 5 minutes early</li>
                  <li>Ensure stable internet connectivity</li>
                  <li>Keep your resume and portfolio ready</li>
                  <li>Reply to this email if you need to reschedule</li>
                </ul>
              </td></tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr><td align="center">
                <a href="https://pratibhaai.vercel.app" style="display:inline-block;padding:13px 32px;background:#4F46E5;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:-0.005em;">
                  Confirm Receipt
                </a>
              </td></tr>
            </table>

            <!-- Regards -->
            <p style="margin:0 0 4px;font-size:13px;color:#6B7280;">Best regards,</p>
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#111827;">${recruiterName}</p>
            <p style="margin:0 0 32px;font-size:13px;color:#6B7280;">${companyName}</p>

          </td></tr>
        </table>

        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#E5E7EB;"></div></td></tr>
        </table>

        <!-- About + Footer -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:24px 40px 32px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#6B7280;">About Pratibha AI</p>
            <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.65;">This interview process is managed through Pratibha AI — an AI-powered recruitment and candidate evaluation platform designed to streamline modern hiring workflows.</p>
          </td></tr>
        </table>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding-top:24px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;">Powered by <strong style="color:#4F46E5;">Pratibha AI</strong> &middot; <a href="https://pratibhaai.vercel.app" style="color:#4F46E5;text-decoration:none;">pratibhaai.vercel.app</a></p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

export async function sendInterviewInvitation(params: {
  to: string
  candidateName: string
  jobTitle: string
  companyName: string
  recruiterName: string
}): Promise<{ success: boolean; error?: string }> {
  const { to, candidateName, jobTitle, companyName, recruiterName } = params

  const interviewDateObj = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const interviewDate = interviewDateObj.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata',
  })
  const interviewTime = '10:00 AM IST'

  const html = buildInterviewHtml({ candidateName, jobTitle, companyName, recruiterName, interviewDate, interviewTime })

  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME ?? 'Pratibha AI'} <${process.env.RESEND_FROM_EMAIL ?? 'noreply@pratibhaai.vercel.app'}>`,
      to,
      subject: `Interview Invitation — ${jobTitle} at ${companyName}`,
      html,
    })
    if (error) {
      console.error('[email] Resend rejected send:', JSON.stringify(error))
      return { success: false, error: (error as { message?: string }).message ?? JSON.stringify(error) }
    }
    console.log('[email] sent successfully, id:', data?.id)
    return { success: true }
  } catch (err) {
    console.error('[email] unexpected throw:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
