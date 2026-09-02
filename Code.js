/**
 * ============================================================
 * LENIZA PASION — TAHANAN NATIN SALES AGENT
 * Google Apps Script Web App
 * 
 * This application handles:
 * 1. Serving the landing page (doGet)
 * 2. Processing form submissions (handleFormSubmit)
 * 3. Managing Google Sheets for leads
 * 4. 15-day email drip campaign with branded HTML design
 * 5. Auto-responder emails
 * 6. UTM tracking
 * 7. Page visit tracking
 * 8. Starter Kit email delivery
 * ============================================================
 */

// ============================================================
// CONSTANTS & CONFIGURATION
// ============================================================

const APP_NAME = "Leniza Pasion — Tahanan Natin Sales Agent";
const SHEET_NAME = "Inquiries";
const VISITS_SHEET_NAME = "Visits";
const DRIP_SHEET_NAME = "Drip_Campaign";
const STARTER_KIT_SHEET_NAME = "Starter_Kit_Leads";
const EMAIL_FROM_NAME = "Leniza Pasion · Tahanan Natin";

// Brand Colors
const BRAND = {
  navy: "#0B1730",
  navyLight: "#132A54",
  gold: "#D8A94A",
  cream: "#F6F2E9",
  white: "#FFFFFF",
  dark: "#0F1B2E",
  muted: "#7C879C"
};

// Drive link for Starter Kit
const STARTER_KIT_DRIVE_LINK = "https://drive.google.com/file/d/1KNQGEfGTnxg5z1VZOYi2_QfUUU9MJAKz/view?usp=sharing";

// Rate limiting: minimum seconds between submissions from same email
const RATE_LIMIT_SECONDS = 60;

/**
 * Creates a branded HTML email template wrapper
 */
function createEmailTemplate(content, title = "") {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:${BRAND.cream};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.cream};padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,23,48,0.10);max-width:600px;width:100%;">
          
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%);padding:30px 40px 24px;text-align:center;border-bottom:4px solid ${BRAND.gold};">
              <div style="font-size:28px;font-weight:700;color:${BRAND.gold};font-family:'Georgia',serif;letter-spacing:0.5px;">
                ✦ TAHANAN NATIN
              </div>
              <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:6px;letter-spacing:0.5px;font-weight:400;">
                Leniza Pasion · Sales Agent
              </div>
              <div style="width:60px;height:2px;background:${BRAND.gold};margin:12px auto 0;border-radius:2px;"></div>
            </td>
          </tr>
          
          <!-- BODY -->
          <tr>
            <td style="padding:32px 40px 28px;background-color:${BRAND.white};">
              ${content}
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color:${BRAND.navy};padding:20px 40px;text-align:center;border-top:3px solid ${BRAND.gold};">
              <div style="color:rgba(255,255,255,0.7);font-size:12px;line-height:1.8;font-weight:400;">
                <span style="color:${BRAND.gold};font-weight:600;">TAHANAN NATIN</span>
                <span style="color:rgba(255,255,255,0.3);margin:0 8px;">|</span>
                Fuel Your Dream Home Today
                <br>
                <span style="color:rgba(255,255,255,0.5);font-size:11px;">
                  📞 0917 717 9863 &nbsp;·&nbsp; ✉️ lenizapasion.innersparc@gmail.com
                </span>
                <br>
                <span style="color:rgba(255,255,255,0.3);font-size:10px;display:block;margin-top:6px;">
                  © 2026 Leniza Pasion · All rights reserved
                </span>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================================
// THE 15-DAY EMAIL SEQUENCE WITH BRANDED HTML
// ============================================================

const DRIP_SEQUENCE = [
  // Day 0 - Welcome
  {
    day: 0,
    subject: "🏡 Welcome to Tahanan Natin, {name}!",
    body: `{name}, welcome to Tahanan Natin! I'm so glad you're here.`
  },
  
  // Day 2 - Your Home Journey
  {
    day: 2,
    subject: "🚀 Here's What Happens Next — Your Home Journey",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Your Home Journey Starts Now
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Thank you again for reaching out to me at <strong style="color:${BRAND.gold};">TAHANAN NATIN</strong>. I want to make sure you know exactly what to expect on your home-buying journey.
      </p>
      
      <div style="background:${BRAND.cream};border-left:4px solid ${BRAND.gold};padding:16px 20px;border-radius:8px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">Here's how I work with my clients:</p>
        <ol style="margin:0;padding-left:20px;font-size:15px;line-height:2;color:${BRAND.dark};">
          <li><strong>We Talk</strong> — I learn about your needs, budget, and timeline</li>
          <li><strong>We Explore</strong> — I show you properties that actually fit your criteria</li>
          <li><strong>We Plan</strong> — I help you understand financing and payment options</li>
          <li><strong>We Close</strong> — I stay with you until you get the keys</li>
        </ol>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 8px;">
        There's no pressure — just honest guidance. When you're ready, I'm here.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Reply anytime if you have questions.
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          Warm regards,<br>
          <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span><br>
          <span style="color:${BRAND.gold};font-size:14px;">📞 0917 717 9863</span>
        </p>
      </div>
    `
  },
  
  // Day 3 - Choosing the Right Location
  {
    day: 3,
    subject: "📍 How to Choose the Right Location for Your Family",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Finding Your Perfect Location
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        One of the most important decisions you'll make is choosing the right location. Here are some things to consider:
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;line-height:2;color:${BRAND.dark};margin:0;">
          ✅ <strong>Commute time</strong> — How long will you spend traveling to work?<br>
          ✅ <strong>Schools</strong> — Are there quality schools nearby?<br>
          ✅ <strong>Amenities</strong> — Markets, hospitals, churches, and malls<br>
          ✅ <strong>Security</strong> — Is the community safe and well-maintained?<br>
          ✅ <strong>Future value</strong> — Is the area growing?
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        <strong style="color:${BRAND.gold};">Cavite</strong> offers a perfect balance — close enough to Metro Manila for work, peaceful enough to actually enjoy coming home.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Have you started thinking about which area you prefer? Reply and let me know — I'd love to help you narrow it down.
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 4 - Budgeting
  {
    day: 4,
    subject: "💰 Budgeting for Your Dream Home",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Smart Budgeting for Homebuyers
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        One of the biggest questions I get is: <em>"How much house can I actually afford?"</em>
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">📊 Use the 30% Rule</p>
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          Your monthly amortization should be <strong>no more than 30%</strong> of your monthly income.
        </p>
      </div>
      
      <p style="font-size:15px;font-weight:600;color:${BRAND.navy};margin:0 0 8px;">💸 Don't Forget Hidden Costs:</p>
      <div style="background:${BRAND.cream};border-radius:8px;padding:12px 20px;margin:0 0 16px;">
        <p style="font-size:14px;line-height:2;color:${BRAND.dark};margin:0;">
          • Down payment (10-20%)<br>
          • Transfer fees and taxes<br>
          • Insurance<br>
          • Association dues<br>
          • Moving costs
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        💰 <strong>Get Pre-Qualified</strong> — Knowing your budget before you start looking saves time and stress.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        If you'd like help with computations, I'm happy to run numbers for you. Just reply and tell me your monthly income and savings!
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 5 - Success Story 1
  {
    day: 5,
    subject: "🌟 A Success Story — Finding a Home in Cavite",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        A Real Success Story
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        I wanted to share a story from one of my clients — because I think it might inspire you.
      </p>
      
      <div style="background:${BRAND.cream};border-left:4px solid ${BRAND.gold};padding:16px 20px;border-radius:8px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">🏠 Levie & Family</p>
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;font-style:italic;">
          "Ang hirap mag-ipon para sa bahay, lalo na kapag may mga bata. Pero nung nakita ko yung computation, doon ko narealize na kaya pala. Hindi kami minadali — tinulungan lang kaming maintindihan bawat hakbang."
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        They're now proud homeowners in <strong style="color:${BRAND.gold};">Tanza, Cavite</strong>. It wasn't about finding the perfect house — it was about finding the right one for their family.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Your right home is out there too. I'm here to help you find it.
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 6 - Why Cavite
  {
    day: 6,
    subject: "🏡 Why Cavite? The Best Place to Build Your Future",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Why Families Choose Cavite
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        You're probably wondering: <em>"Why Cavite?"</em> Here's why so many families are choosing to settle here:
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;line-height:2;color:${BRAND.dark};margin:0;">
          🏡 <strong>Affordable Homes</strong> — More house for your money compared to Metro Manila<br>
          🚗 <strong>Accessible</strong> — Direct access to SLEX, CAVITEX, and major roads<br>
          🏥 <strong>Complete Amenities</strong> — Malls, hospitals, schools, and churches nearby<br>
          🌿 <strong>Peaceful Living</strong> — Less traffic, more green space, a real community feel
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        <strong style="color:${BRAND.gold};">Tanza, Cavite</strong> is quickly becoming one of the most sought-after locations for families like yours. Good schools. Great neighborhoods. The kind of place where you actually want to come home.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Would you like to see what's available in your budget?
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 7 - Check-in
  {
    day: 7,
    subject: "💬 How's Your Search Going? Let's Check In",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Just Checking In 👋
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        It's been about a week since you reached out to me. I hope you're feeling good about your home search!
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        I just wanted to check in:
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;line-height:2;color:${BRAND.dark};margin:0;">
          ❓ Have you found any properties you're excited about?<br>
          ❓ Do you have any new questions about the process?<br>
          ❓ Is there anything you're still unsure about?
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        No pressure at all — I'm here when you're ready to take the next step. Just reply whenever you'd like to chat.
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span><br>
          <span style="color:${BRAND.gold};font-size:14px;">📞 0917 717 9863</span>
        </p>
      </div>
    `
  },
  
  // Day 8 - Financing Options
  {
    day: 8,
    subject: "🏦 Financing Made Simple — Your Options Explained",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Understanding Your Financing Options
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        One of the most confusing parts of buying a home is financing. Let me break it down simply:
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">🏦 Bank Financing</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0 0 12px;">
          • Lower interest rates<br>
          • Longer terms (up to 25 years)<br>
          • Requires good credit and higher down payment
        </p>
        
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">🏠 In-House Financing</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0 0 12px;">
          • Easier approval process<br>
          • Lower down payment<br>
          • Higher interest rates
        </p>
        
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">📋 Pag-IBIG Financing</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0;">
          • Affordable rates for qualified members<br>
          • Lower down payment<br>
          • Long repayment terms
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Which one sounds right for you? I can help you compare and choose what fits your situation.
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 9 - Success Story 2
  {
    day: 9,
    subject: "🌟 A Success Story — Angel's Journey Home",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Angel's Journey Home ✈️🏡
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Here's another story from someone who was in your shoes:
      </p>
      
      <div style="background:${BRAND.cream};border-left:4px solid ${BRAND.gold};padding:16px 20px;border-radius:8px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">✈️ Angel — An OFW Buyer</p>
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;font-style:italic;">
          "Ang hirap kapag malayo ka. Lalo na sa documentations. Pero hindi ako pinabayaan. Every step, malinaw na paliwanag. Nung nakauwi ako at nakita na totoo na pala, naiyak ako."
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Angel bought a home for her family while she was working abroad. The process wasn't easy, but having the right guidance made all the difference.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        That's what I do — I make the journey clear and manageable, no matter where you are.
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 10 - Hidden Costs
  {
    day: 10,
    subject: "💰 10 Hidden Costs When Buying a House",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        10 Hidden Costs You Should Know
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Most first-time buyers are surprised by hidden costs. Here are 10 to watch out for:
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:14px;line-height:2;color:${BRAND.dark};margin:0;">
          💰 <strong>1. Down Payment</strong> — Usually 10-20% of the property price<br>
          💰 <strong>2. Transfer Tax</strong> — Paid when the title is transferred to you<br>
          💰 <strong>3. Registration Fees</strong> — For registering the property in your name<br>
          💰 <strong>4. Legal Fees</strong> — For the Deed of Absolute Sale<br>
          💰 <strong>5. Association Dues</strong> — Monthly fees for community maintenance<br>
          💰 <strong>6. Property Taxes</strong> — Annual taxes you'll need to pay<br>
          💰 <strong>7. Insurance</strong> — Fire and earthquake insurance<br>
          💰 <strong>8. Move-in Fees</strong> — Some communities charge these<br>
          💰 <strong>9. Utility Connection Fees</strong> — Water, electricity, internet<br>
          💰 <strong>10. Appliances and Furnishing</strong> — Budget for making it your home
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Want a complete list I can send you? Just reply and say <strong>"YES"</strong>!
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 11 - Preselling vs RFO
  {
    day: 11,
    subject: "🏗️ Preselling vs. RFO — Which Is Better for You?",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Preselling vs. RFO: What's Right for You?
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        You have two main options when buying a property:
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">🏗️ Preselling</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0 0 12px;">
          ✅ Lower price — lock in before construction starts<br>
          ✅ Flexible payment terms<br>
          ✅ Choose your unit and design options<br>
          ❌ Need to wait for construction (1-3 years)
        </p>
        
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">🏡 RFO (Ready For Occupancy)</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0;">
          ✅ Move in immediately<br>
          ✅ See exactly what you're getting<br>
          ✅ No waiting period<br>
          ❌ Higher price point<br>
          ❌ Less choice in unit selection
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Which one fits your timeline? If you're not sure, I can help you decide based on your situation.
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 12 - Homeowner's Journey
  {
    day: 12,
    subject: "📋 The Homeowner's Journey — Step by Step",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Your Step-by-Step Guide to Homeownership
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Buying a home doesn't have to be confusing. Here's how it works from start to finish:
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;line-height:2.2;color:${BRAND.dark};margin:0;">
          <strong style="color:${BRAND.gold};">Step 1:</strong> Tell me what you're looking for — budget, location, must-haves<br>
          <strong style="color:${BRAND.gold};">Step 2:</strong> I'll match you with the right properties<br>
          <strong style="color:${BRAND.gold};">Step 3:</strong> Visit the community and see homes in person<br>
          <strong style="color:${BRAND.gold};">Step 4:</strong> Reserve your unit with a small fee<br>
          <strong style="color:${BRAND.gold};">Step 5:</strong> Complete financing and documentation<br>
          <strong style="color:${BRAND.gold};">Step 6:</strong> Get the keys — you're a homeowner! 🎉
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        The whole process takes anywhere from 1-6 months, depending on financing. I'm with you for every single step.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Ready to start? Reply and let's talk!
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 13 - Success Story 3
  {
    day: 13,
    subject: "🌟 A Success Story — Benemerito & Kaka",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Benemerito & Kaka's Dream Home
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        One last success story to inspire you:
      </p>
      
      <div style="background:${BRAND.cream};border-left:4px solid ${BRAND.gold};padding:16px 20px;border-radius:8px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">🏠 Benemerito & Kaka</p>
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;font-style:italic;">
          "Akala ko laging next year na lang kami. Pero nung pinakita ng team yung computation, doon ko nakita na may paraan pala. Hindi kami minadali. Tinulungan lang kaming maintindihan bawat hakbang."
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        They realized their dream was closer than they thought. Sometimes, the only thing standing between you and your home is the right guidance.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        That's what I'm here for.
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 14 - FAQs
  {
    day: 14,
    subject: "❓ Your Questions Answered — Home Buying FAQs",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Frequently Asked Questions
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Here are the most common questions I get from first-time buyers:
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">Q: How much down payment do I need?</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0 0 12px;">
          A: Usually 10-20% of the property price. Some developers offer lower down payment options.
        </p>
        
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">Q: What documents do I need?</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0 0 12px;">
          A: Valid ID, proof of income, bank statements, and marriage certificate (if applicable).
        </p>
        
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">Q: Can I buy even if I'm an OFW?</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0 0 12px;">
          A: Yes! I've helped many OFWs buy homes while they're abroad.
        </p>
        
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">Q: What if I don't get approved for a loan?</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0 0 12px;">
          A: There are options — I can help you explore different financing paths.
        </p>
        
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">Q: How long does the process take?</p>
        <p style="font-size:14px;line-height:1.8;color:${BRAND.dark};margin:0;">
          A: Typically 1-6 months, depending on financing and document preparation.
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Have other questions? Just reply and ask — no question is too small!
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          — <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `
  },
  
  // Day 15 - Final Call to Action
  {
    day: 15,
    subject: "🏡 Ready to Make the Move? Your Dream Home Awaits",
    body: `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Your Dream Home is Waiting! 🏡
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>{name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        It's been 15 days since you first reached out. I hope this email series has helped you feel more confident about your home-buying journey.
      </p>
      
      <p style="font-size:15px;font-weight:600;color:${BRAND.navy};margin:0 0 8px;">You've learned about:</p>
      <div style="background:${BRAND.cream};border-radius:8px;padding:12px 20px;margin:0 0 16px;">
        <p style="font-size:14px;line-height:2;color:${BRAND.dark};margin:0;">
          ✅ Budgeting and financing<br>
          ✅ Choosing the right location<br>
          ✅ Hidden costs and what to expect<br>
          ✅ Success stories from real families
        </p>
      </div>
      
      <div style="background:${BRAND.navy};border-radius:8px;padding:20px;text-align:center;margin:0 0 16px;">
        <p style="font-size:16px;font-weight:700;color:${BRAND.white};margin:0 0 4px;">
          Now, the only question left is:
        </p>
        <p style="font-size:20px;font-weight:700;color:${BRAND.gold};margin:0;">
          Are you ready?
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        🏡 Your home is waiting for you in Cavite — affordable, peaceful, and just right for your family.
      </p>
      
      <div style="text-align:center;margin:16px 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="background:${BRAND.gold};padding:12px 32px;border-radius:8px;">
              <a href="tel:+639177179863" style="color:${BRAND.navy};text-decoration:none;font-size:16px;font-weight:700;">
                📞 Call Me Now: 0917 717 9863
              </a>
            </td>
          </tr>
        </table>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;text-align:center;">
        ✨ No pressure. No pushy sales. Just honest guidance to help you make the best decision for your family.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        I look forward to helping you find your dream home!
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          Warm regards,<br>
          <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span><br>
          <span style="color:${BRAND.gold};font-size:14px;">📞 0917 717 9863</span>
        </p>
      </div>
    `
  }
];

// ============================================================
// WEB APP ENTRY POINT
// ============================================================

function doGet(e) {
  trackVisit(e);
  return HtmlService
    .createHtmlOutputFromFile("index")
    .setTitle(APP_NAME)
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
// FORM HANDLING - UPDATED FOR NEW FORM FIELDS
// ============================================================

function handleFormSubmit(formData) {
  try {
    Logger.log("========================================");
    Logger.log("📝 FORM SUBMISSION RECEIVED");
    Logger.log("📝 Full data: " + JSON.stringify(formData));
    Logger.log("========================================");
    
    // Get all form fields
    const fullName = clean(formData.fullName);
    const email = clean(formData.emailAddress);
    const phone = clean(formData.phoneNumber || "");
    const buyerType = clean(formData.buyerType);
    const goal = clean(formData.goal);
    const budget = clean(formData.budget);
    const location = clean(formData.location);
    const propertyType = clean(formData.propertyType);
    const timeline = clean(formData.timeline);
    const consultationDate = clean(formData.consultationDate || "");
    const consultationTime = clean(formData.consultationTime || "");
    
    // UTM tracking
    const utmSource = clean(formData.utmSource) || "direct";
    const utmMedium = clean(formData.utmMedium) || "direct";
    const utmCampaign = clean(formData.utmCampaign) || "direct";
    const utmContent = clean(formData.utmContent) || "";
    const utmTerm = clean(formData.utmTerm) || "";

    // Validation
    if (!fullName) throw new Error("Please enter your full name.");
    if (!email || !isValidEmail(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (!buyerType) throw new Error("Please select your buyer type.");
    if (!goal) throw new Error("Please select your goal.");
    if (!budget) throw new Error("Please select your budget range.");
    if (!location) throw new Error("Please select your preferred location.");
    if (!propertyType) throw new Error("Please select a property type.");
    if (!timeline) throw new Error("Please select your timeline.");

    // Rate limiting check
    if (isRateLimited(email)) {
      throw new Error("Please wait " + RATE_LIMIT_SECONDS + " seconds before submitting again.");
    }

    // Build message with all inquiry details
    const message = `Buyer Type: ${buyerType}
Goal: ${goal}
Budget: ${budget}
Location: ${location}
Property Type: ${propertyType}
Timeline: ${timeline}
Consultation: ${consultationDate} ${consultationTime}`;

    Logger.log("📝 Parsed data:");
    Logger.log("  Name: " + fullName);
    Logger.log("  Email: " + email);
    Logger.log("  Phone: " + phone);
    Logger.log("  Buyer Type: " + buyerType);
    Logger.log("  Goal: " + goal);
    Logger.log("  Budget: " + budget);
    Logger.log("  Location: " + location);
    Logger.log("  Property Type: " + propertyType);
    Logger.log("  Timeline: " + timeline);

    saveInquiry({
      name: fullName,
      email: email,
      phone: phone,
      buyerType: buyerType,
      goal: goal,
      budget: budget,
      location: location,
      propertyType: propertyType,
      timeline: timeline,
      consultationDate: consultationDate,
      consultationTime: consultationTime,
      message: message,
      utmSource: utmSource,
      utmMedium: utmMedium,
      utmCampaign: utmCampaign,
      utmContent: utmContent,
      utmTerm: utmTerm
    });

    // Send auto-response with branded design
    sendAutoResponse(email, fullName);

    // Add to drip campaign
    addLeadToDrip(email, fullName);

    // Send agent notification
    sendAgentNotification(fullName, email, phone, buyerType, goal, budget, location, propertyType, timeline, consultationDate, consultationTime, message, utmSource, utmMedium, utmCampaign);

    // Save the submission timestamp for rate limiting
    saveSubmissionTimestamp(email);

    Logger.log("✅ FORM SUBMISSION COMPLETE");
    Logger.log("========================================");
    
    return "Thank you, " + fullName + "! Leniza will get back to you soon.";
    
  } catch (error) {
    Logger.log("❌ ERROR: " + error.toString());
    Logger.log("❌ Stack: " + error.stack);
    throw new Error(error.message || "Something went wrong. Please try again.");
  }
}

// ============================================================
// RATE LIMITING
// ============================================================

function isRateLimited(email) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const key = "last_submission_" + email;
    const lastSubmission = properties.getProperty(key);
    
    if (!lastSubmission) return false;
    
    const lastTime = new Date(lastSubmission).getTime();
    const now = new Date().getTime();
    const diffSeconds = (now - lastTime) / 1000;
    
    return diffSeconds < RATE_LIMIT_SECONDS;
  } catch (error) {
    Logger.log("⚠️ Rate limiting check error: " + error.toString());
    return false; // Allow submission if rate limiting fails
  }
}

function saveSubmissionTimestamp(email) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const key = "last_submission_" + email;
    properties.setProperty(key, new Date().toISOString());
  } catch (error) {
    Logger.log("⚠️ Error saving submission timestamp: " + error.toString());
  }
}

// ============================================================
// SPREADSHEET OPERATIONS - UPDATED HEADERS
// ============================================================

function getOrCreateSpreadsheet() {
  const properties = PropertiesService.getScriptProperties();
  let id = properties.getProperty("LEAD_SPREADSHEET_ID");
  let spreadsheet;
  
  Logger.log("📊 Checking for existing spreadsheet ID: " + id);
  
  if (id) {
    try {
      spreadsheet = SpreadsheetApp.openById(id);
      Logger.log("📊 Found existing spreadsheet: " + spreadsheet.getUrl());
      return spreadsheet;
    } catch(e) {
      Logger.log("⚠️ Could not open existing spreadsheet: " + e.toString());
      Logger.log("⚠️ Creating new one...");
    }
  }
  
  spreadsheet = SpreadsheetApp.create("Leniza Pasion — Tahanan Natin Leads");
  const newId = spreadsheet.getId();
  properties.setProperty("LEAD_SPREADSHEET_ID", newId);
  Logger.log("✅ Created NEW spreadsheet: " + spreadsheet.getUrl());
  Logger.log("✅ New ID: " + newId);
  return spreadsheet;
}

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log("📋 " + sheetName + " sheet not found, creating...");
    sheet = spreadsheet.insertSheet(sheetName);
    Logger.log("✅ Created " + sheetName + " sheet");
  }
  
  const lastCol = sheet.getLastColumn();
  const expectedColCount = headers.length;
  let needsHeaders = false;
  
  if (sheet.getLastRow() === 0) {
    needsHeaders = true;
    Logger.log("📋 Sheet is empty, adding headers...");
  } else if (lastCol !== expectedColCount) {
    needsHeaders = true;
    Logger.log("📋 Wrong column count: " + lastCol + " vs expected " + expectedColCount + ". Resetting headers...");
  } else {
    try {
      const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      const headersMatch = headers.every((h, i) => h === existingHeaders[i]);
      if (!headersMatch) {
        needsHeaders = true;
        Logger.log("📋 Headers don't match. Resetting...");
      }
    } catch(e) {
      needsHeaders = true;
    }
  }
  
  if (needsHeaders) {
    sheet.clear();
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setFontWeight("bold");
    range.setBackground("#132A54");
    range.setFontColor("#FFFFFF");
    range.setHorizontalAlignment("center");
    
    Logger.log("✅ Headers added to " + sheetName + " sheet");
  }
  
  return sheet;
}

function saveInquiry(data) {
  const spreadsheet = getOrCreateSpreadsheet();
  const headers = [
    "Timestamp", "Name", "Email", "Phone", 
    "Buyer Type", "Goal", "Budget", "Location", 
    "Property Type", "Timeline", "Consultation Date", "Consultation Time",
    "Message", "Status", 
    "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content", "UTM Term"
  ];
  
  const sheet = getOrCreateSheet(spreadsheet, SHEET_NAME, headers);
  
  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.phone || "",
    data.buyerType || "",
    data.goal || "",
    data.budget || "",
    data.location || "",
    data.propertyType || "",
    data.timeline || "",
    data.consultationDate || "",
    data.consultationTime || "",
    data.message || "",
    "New",
    data.utmSource || "direct",
    data.utmMedium || "direct",
    data.utmCampaign || "direct",
    data.utmContent || "",
    data.utmTerm || ""
  ]);
  
  Logger.log("✅ Inquiry saved for: " + data.name);
}

// ============================================================
// STARTER KIT LEAD STORAGE
// ============================================================

function saveStarterKitLead(data) {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const headers = ["Timestamp", "Name", "Email", "Phone", "Source"];
    const sheet = getOrCreateSheet(spreadsheet, STARTER_KIT_SHEET_NAME, headers);
    
    sheet.appendRow([
      new Date(),
      data.name,
      data.email,
      data.phone || "",
      data.source || "Website"
    ]);
    
    Logger.log("✅ Starter Kit lead saved for: " + data.name);
  } catch (error) {
    Logger.log("⚠️ Error saving starter kit lead: " + error.toString());
  }
}

// ============================================================
// VISIT TRACKING
// ============================================================

function trackVisit(e) {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const headers = ["Timestamp", "Referrer"];
    const sheet = getOrCreateSheet(spreadsheet, VISITS_SHEET_NAME, headers);
    
    const referrer = e && e.parameter && e.parameter.referrer
      ? clean(e.parameter.referrer)
      : "Direct";
    
    sheet.appendRow([new Date(), referrer]);
    Logger.log("✅ Visit tracked: " + referrer);
  } catch (error) {
    Logger.log("⚠️ Visit tracking error: " + error.toString());
  }
}

// ============================================================
// BRANDED EMAIL FUNCTIONS
// ============================================================

/**
 * Sends a branded HTML auto-response email to the lead.
 */
function sendAutoResponse(email, name) {
  try {
    const subject = "Thank you for your inquiry, " + name + "!";
    
    const content = `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Thank You for Reaching Out! 🙏
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>${name}</strong>,
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Thank you for reaching out to <strong style="color:${BRAND.gold};">Leniza Pasion</strong> at <strong style="color:${BRAND.gold};">TAHANAN NATIN</strong>.
      </p>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        I've received your inquiry and will get back to you within <strong>24 hours</strong>.
      </p>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:600;color:${BRAND.navy};margin:0 0 8px;">
          In the meantime, feel free to:
        </p>
        <p style="font-size:14px;line-height:2;color:${BRAND.dark};margin:0;">
          📄 Download our free guides from the website<br>
          🏠 Check out our latest properties<br>
          📞 Call us directly at <strong style="color:${BRAND.gold};">0917 717 9863</strong>
        </p>
      </div>
      
      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Looking forward to helping you find your dream home!
      </p>
      
      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          Warm regards,<br>
          <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `;
    
    const htmlBody = createEmailTemplate(content, subject);
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      name: EMAIL_FROM_NAME
    });
    
    Logger.log("✅ Branded auto-response sent to: " + email);
  } catch (error) {
    Logger.log("⚠️ Error sending auto-response: " + error.toString());
  }
}

// ============================================================
// STARTER KIT EMAIL - TOP LEVEL FUNCTION (FIXED)
// ============================================================

function sendStarterKitEmail(name, email, phone) {
  try {
    const subject = "📘 Ito ang Home Buyer Kit mo, " + name + "!";

    const content = `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        Ito ang Home Buyer Kit Mo! 📘
      </div>

      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        Hi <strong>${name}</strong>, si Leniza ito! Thank you sa pag-request ng Free Home Buyer Starter Kit ko. I-click mo lang ang button sa baba para makuha mo agad.
      </p>

      <div style="text-align:center;margin:20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="background:${BRAND.gold};padding:14px 32px;border-radius:8px;">
              <a href="${STARTER_KIT_DRIVE_LINK}" style="color:${BRAND.navy};text-decoration:none;font-size:16px;font-weight:700;">
                📘 I-download ang Kit Mo
              </a>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:${BRAND.cream};border-left:4px solid ${BRAND.gold};padding:16px 20px;border-radius:8px;margin:0 0 16px;">
        <p style="font-size:15px;font-weight:700;color:${BRAND.navy};margin:0 0 8px;">Andito lahat sa kit:</p>
        <p style="font-size:14px;line-height:2;color:${BRAND.dark};margin:0;">
          ✓ Home Buying Checklist<br>
          ✓ Bank vs Pag-IBIG Quick Comparison Guide<br>
          ✓ Estimated Monthly Amortization Worksheet<br>
          ✓ 7 Questions to Ask Before Reserving a Property<br>
          ✓ Sample Budget Plan for First-Time Buyers<br>
          ✓ OFW Home Buying Preparation Tips
        </p>
      </div>

      <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0 0 16px;">
        I-follow up pa kita para masagot ang mga tanong mo — wag ka lang mahiyang mag-message sa akin ha.
      </p>

      <div style="border-top:1px solid #E5E7EB;padding-top:16px;margin-top:8px;">
        <p style="font-size:15px;line-height:1.8;color:${BRAND.dark};margin:0;">
          Salamat po,<br>
          <strong style="color:${BRAND.navy};">Leniza Pasion</strong><br>
          <span style="color:${BRAND.muted};font-size:14px;">TAHANAN NATIN · Sales Agent</span>
        </p>
      </div>
    `;

    const htmlBody = createEmailTemplate(content, subject);

    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      name: EMAIL_FROM_NAME
    });

    Logger.log("✅ Starter Kit email sent to: " + email);

    // Save to Starter Kit sheet
    saveStarterKitLead({
      name: name,
      email: email,
      phone: phone || "",
      source: "Website Starter Kit Form"
    });

    // Also add to main inquiries sheet with special tag
    saveInquiry({
      name: name,
      email: email,
      phone: phone || "",
      buyerType: "Starter Kit Download",
      goal: "Starter Kit",
      budget: "N/A",
      location: "N/A",
      propertyType: "N/A",
      timeline: "N/A",
      consultationDate: "",
      consultationTime: "",
      message: "Requested the Free Home Buyer Starter Kit",
      utmSource: "starter_kit",
      utmMedium: "website",
      utmCampaign: "starter_kit_download"
    });

    addLeadToDrip(email, name);

  } catch (error) {
    Logger.log("⚠️ Error sending Starter Kit email: " + error.toString());
    throw new Error("Something went wrong sending your kit. Please try again.");
  }
}

// ============================================================
// AGENT NOTIFICATION
// ============================================================

/**
 * Sends a branded notification email to the agent - UPDATED
 */
function sendAgentNotification(name, email, phone, buyerType, goal, budget, location, propertyType, timeline, consultationDate, consultationTime, message, utmSource, utmMedium, utmCampaign) {
  try {
    const recipient = Session.getActiveUser().getEmail();
    if (!recipient) {
      Logger.log("⚠️ No recipient email found. Using fallback.");
      // Fallback to a hardcoded email or skip
      return;
    }
    
    const content = `
      <div style="font-size:18px;font-weight:700;color:${BRAND.navy};margin-bottom:16px;">
        🎯 New Lead Alert!
      </div>
      
      <div style="background:${BRAND.cream};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:15px;line-height:2;color:${BRAND.dark};margin:0;">
          <strong>Name:</strong> ${name}<br>
          <strong>Email:</strong> ${email}<br>
          <strong>Phone:</strong> ${phone || "Not provided"}<br>
          <strong>Buyer Type:</strong> ${buyerType}<br>
          <strong>Goal:</strong> ${goal}<br>
          <strong>Budget:</strong> ${budget}<br>
          <strong>Location:</strong> ${location}<br>
          <strong>Property Type:</strong> ${propertyType}<br>
          <strong>Timeline:</strong> ${timeline}<br>
          <strong>Consultation:</strong> ${consultationDate || "Not set"} ${consultationTime || ""}
        </p>
      </div>
      
      <div style="background:${BRAND.navy};border-radius:8px;padding:16px 20px;margin:0 0 16px;">
        <p style="font-size:13px;font-weight:600;color:${BRAND.gold};margin:0 0 8px;">
          📊 UTM DATA
        </p>
        <p style="font-size:13px;line-height:2;color:${BRAND.white};margin:0;">
          Source: ${utmSource}<br>
          Medium: ${utmMedium}<br>
          Campaign: ${utmCampaign}
        </p>
      </div>
      
      <p style="font-size:13px;color:${BRAND.muted};margin:0;">
        Source: Tahanan Natin Landing Page
      </p>
    `;
    
    const htmlBody = createEmailTemplate(content, "New Lead — " + name);
    
    MailApp.sendEmail({
      to: recipient,
      subject: "New Lead — " + name,
      htmlBody: htmlBody,
      replyTo: email,
      name: "Tahanan Natin Lead Form"
    });
    
    Logger.log("✅ Branded notification sent to agent");
  } catch (error) {
    Logger.log("⚠️ Error sending notification: " + error.toString());
  }
}

// ============================================================
// DRIP CAMPAIGN FUNCTIONS
// ============================================================

function addLeadToDrip(email, name) {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const headers = [
      "Email", "Name", "Lead Date", "Last Sent Day",
      "Next Send Date", "Campaign Started", "Campaign Completed", "Status"
    ];
    const sheet = getOrCreateSheet(spreadsheet, DRIP_SHEET_NAME, headers);
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
      if (emails.includes(email)) {
        Logger.log("ℹ️ Lead already in drip campaign: " + email);
        return;
      }
    }
    
    const now = new Date();
    sheet.appendRow([
      email,
      name,
      now,
      0,
      now,
      now,
      "",
      "Active"
    ]);
    
    Logger.log("✅ Lead added to drip campaign: " + email);
  } catch (error) {
    Logger.log("❌ Error adding lead to drip: " + error.toString());
  }
}

/**
 * Sends branded HTML drip emails instead of plain text.
 */
function sendNextDripEmail() {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const headers = [
      "Email", "Name", "Lead Date", "Last Sent Day",
      "Next Send Date", "Campaign Started", "Campaign Completed", "Status"
    ];
    const sheet = getOrCreateSheet(spreadsheet, DRIP_SHEET_NAME, headers);
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log("ℹ️ No leads in drip campaign.");
      return;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let sentCount = 0;
    
    data.forEach((row, index) => {
      const email = row[0];
      const name = row[1];
      const leadDate = new Date(row[2]);
      const lastSentDay = row[3] || 0;
      const status = row[7] || "Active";
      
      if (status !== "Active") return;
      
      const daysSinceLead = Math.floor((today - leadDate) / (1000 * 60 * 60 * 24));
      const nextEmail = DRIP_SEQUENCE.find(e => e.day > lastSentDay && e.day <= daysSinceLead);
      
      if (nextEmail && nextEmail.day > 0) {
        // Replace {name} placeholder
        let emailBody = nextEmail.body.replace(/{name}/g, name);
        const subject = nextEmail.subject.replace(/{name}/g, name);
        
        // Wrap in branded template
        const htmlBody = createEmailTemplate(emailBody, subject);
        
        MailApp.sendEmail({
          to: email,
          subject: subject,
          htmlBody: htmlBody,
          name: EMAIL_FROM_NAME
        });
        
        const rowIndex = index + 2;
        sheet.getRange(rowIndex, 4).setValue(nextEmail.day);
        sheet.getRange(rowIndex, 5).setValue(today);
        sentCount++;
        Logger.log("📧 Sent branded drip email day " + nextEmail.day + " to " + email);
      }
      
      const lastDay = DRIP_SEQUENCE[DRIP_SEQUENCE.length - 1].day;
      if (lastSentDay >= lastDay) {
        sheet.getRange(index + 2, 7).setValue(today);
        sheet.getRange(index + 2, 8).setValue("Completed");
        Logger.log("✅ Campaign completed for: " + email);
      }
    });
    
    Logger.log("📊 Drip campaign sent: " + sentCount + " branded emails today.");
  } catch (error) {
    Logger.log("❌ Error sending drip emails: " + error.toString());
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function clean(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSpreadsheetUrl() {
  const properties = PropertiesService.getScriptProperties();
  const id = properties.getProperty("LEAD_SPREADSHEET_ID");
  if (!id) {
    Logger.log("❌ No spreadsheet found.");
    return null;
  }
  const ss = SpreadsheetApp.openById(id);
  return ss.getUrl();
}

// ============================================================
// TESTING & MAINTENANCE FUNCTIONS
// ============================================================

function testForm() {
  Logger.log("🧪 RUNNING TEST...");
  const testData = {
    fullName: "Test User",
    emailAddress: "test@example.com",
    phoneNumber: "09171234567",
    buyerType: "Corporate Employee",
    goal: "Buy My First Home",
    budget: "₱1M – ₱3M",
    location: "Cavite",
    propertyType: "House and Lot",
    timeline: "ASAP",
    consultationDate: "2026-09-01",
    consultationTime: "10:00",
    utmSource: "test",
    utmMedium: "test",
    utmCampaign: "test",
    utmContent: "",
    utmTerm: ""
  };
  
  try {
    const result = handleFormSubmit(testData);
    Logger.log("✅ Test result: " + result);
    Logger.log("📊 Spreadsheet URL: " + getSpreadsheetUrl());
    Logger.log("📊 Check your Google Drive for the spreadsheet!");
  } catch(e) {
    Logger.log("❌ Test failed: " + e.toString());
  }
}

function testStarterKit() {
  Logger.log("🧪 Testing Starter Kit email...");
  try {
    sendStarterKitEmail("Test User", "test@example.com", "09171234567");
    Logger.log("✅ Starter Kit test complete");
  } catch(e) {
    Logger.log("❌ Starter Kit test failed: " + e.toString());
  }
}

function testDripCampaign() {
  Logger.log("🧪 Testing drip campaign manually...");
  sendNextDripEmail();
}

function forceSendDrip() {
  addLeadToDrip("test@email.com", "Test User");
  testDripCampaign();
}

function getDripStatus() {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const headers = [
      "Email", "Name", "Lead Date", "Last Sent Day",
      "Next Send Date", "Campaign Started", "Campaign Completed", "Status"
    ];
    const sheet = getOrCreateSheet(spreadsheet, DRIP_SHEET_NAME, headers);
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log("ℹ️ No leads in drip campaign.");
      return;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    Logger.log("===== 📊 DRIP CAMPAIGN STATUS =====");
    data.forEach(row => {
      Logger.log("📧 " + row[0] + " | Status: " + row[7] + " | Last Sent: Day " + row[3]);
    });
    Logger.log("===================================");
  } catch (error) {
    Logger.log("❌ Error getting drip status: " + error.toString());
  }
}

function resetDripLead(email) {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = spreadsheet.getSheetByName(DRIP_SHEET_NAME);
    
    if (!sheet) {
      Logger.log("⚠️ Drip sheet not found.");
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    
    const emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const index = emails.indexOf(email);
    
    if (index === -1) {
      Logger.log("❌ Email not found: " + email);
      return;
    }
    
    const rowIndex = index + 2;
    sheet.getRange(rowIndex, 4).setValue(0);
    sheet.getRange(rowIndex, 5).setValue(new Date());
    sheet.getRange(rowIndex, 7).setValue("");
    sheet.getRange(rowIndex, 8).setValue("Active");
    
    Logger.log("✅ Reset drip campaign for: " + email);
  } catch (error) {
    Logger.log("❌ Error resetting drip: " + error.toString());
  }
}

function setupEverything() {
  try {
    Logger.log("🚀 Starting complete setup...");
    
    const spreadsheet = getOrCreateSpreadsheet();
    Logger.log("📊 Spreadsheet: " + spreadsheet.getUrl());
    
    // Create Inquiries sheet
    const inquiryHeaders = [
      "Timestamp", "Name", "Email", "Phone", 
      "Buyer Type", "Goal", "Budget", "Location", 
      "Property Type", "Timeline", "Consultation Date", "Consultation Time",
      "Message", "Status", 
      "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content", "UTM Term"
    ];
    getOrCreateSheet(spreadsheet, SHEET_NAME, inquiryHeaders);
    Logger.log("✅ Inquiries sheet ready");
    
    // Create Drip Campaign sheet
    const dripHeaders = [
      "Email", "Name", "Lead Date", "Last Sent Day",
      "Next Send Date", "Campaign Started", "Campaign Completed", "Status"
    ];
    getOrCreateSheet(spreadsheet, DRIP_SHEET_NAME, dripHeaders);
    Logger.log("✅ Drip_Campaign sheet ready");
    
    // Create Visits sheet
    const visitHeaders = ["Timestamp", "Referrer"];
    getOrCreateSheet(spreadsheet, VISITS_SHEET_NAME, visitHeaders);
    Logger.log("✅ Visits sheet ready");
    
    // Create Starter Kit sheet
    const starterKitHeaders = ["Timestamp", "Name", "Email", "Phone", "Source"];
    getOrCreateSheet(spreadsheet, STARTER_KIT_SHEET_NAME, starterKitHeaders);
    Logger.log("✅ Starter_Kit_Leads sheet ready");
    
    // Set up the daily drip-email trigger
    const existingTriggers = ScriptApp.getProjectTriggers();
    existingTriggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === "sendNextDripEmail") {
        ScriptApp.deleteTrigger(trigger);
        Logger.log("🔄 Removed old trigger");
      }
    });
    ScriptApp.newTrigger("sendNextDripEmail")
      .timeBased()
      .everyDays(1)
      .atHour(9)
      .create();
    Logger.log("✅ Drip trigger set for daily at 9:00 AM");
    
    // Add a test lead
    Logger.log("🧪 Adding test lead...");
    const testData = {
      fullName: "Test Client",
      emailAddress: "test@example.com",
      phoneNumber: "09171234567",
      buyerType: "Corporate Employee",
      goal: "Buy My First Home",
      budget: "₱1M – ₱3M",
      location: "Cavite",
      propertyType: "House and Lot",
      timeline: "ASAP",
      consultationDate: "2026-09-01",
      consultationTime: "10:00",
      utmSource: "test",
      utmMedium: "test",
      utmCampaign: "test",
      utmContent: "",
      utmTerm: ""
    };
    
    // Save test inquiry
    const inquiryData = {
      name: testData.fullName,
      email: testData.emailAddress,
      phone: testData.phoneNumber,
      buyerType: testData.buyerType,
      goal: testData.goal,
      budget: testData.budget,
      location: testData.location,
      propertyType: testData.propertyType,
      timeline: testData.timeline,
      consultationDate: testData.consultationDate,
      consultationTime: testData.consultationTime,
      message: `Buyer Type: ${testData.buyerType}\nGoal: ${testData.goal}\nBudget: ${testData.budget}\nLocation: ${testData.location}\nProperty Type: ${testData.propertyType}\nTimeline: ${testData.timeline}`,
      utmSource: testData.utmSource,
      utmMedium: testData.utmMedium,
      utmCampaign: testData.utmCampaign,
      utmContent: testData.utmContent,
      utmTerm: testData.utmTerm
    };
    saveInquiry(inquiryData);
    addLeadToDrip(testData.emailAddress, testData.fullName);
    
    Logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    Logger.log("✅ SETUP COMPLETE!");
    Logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    Logger.log("📊 Spreadsheet: " + spreadsheet.getUrl());
    Logger.log("📋 All sheets created with proper headers");
    Logger.log("⏰ Daily trigger set for 9:00 AM");
    Logger.log("📧 Branded HTML emails ready!");
    Logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    Logger.log("✅ Your form is ready to receive submissions!");
    Logger.log("📝 Submit a test form to see it work.");
    Logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return {
      status: "success",
      spreadsheetUrl: spreadsheet.getUrl(),
      spreadsheetId: spreadsheet.getId()
    };
    
  } catch (error) {
    Logger.log("❌ ERROR: " + error.toString());
    throw error;
  }
}