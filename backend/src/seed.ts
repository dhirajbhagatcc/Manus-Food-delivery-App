import { db } from "./db";
import { initSchema } from "./db";

initSchema();

const RESUME = `DHIRAJ BHAGAT
Senior Customer Success Manager | AI-Driven CS Operations | SaaS & Cloud
Dhiraj.Bhagat@iiml.org | +91 9555177850 | Greater Noida West, India | linkedin.com/in/dhirajbhagat

PROFESSIONAL SUMMARY
Senior Customer Success Leader with 13+ years of experience managing CS teams and enterprise
portfolios across SaaS and cloud environments. Deep expertise in AI-powered Customer Success —
designing AI agents, workflow automation, and predictive analytics that improve retention,
adoption, and team productivity. Proven track record of leading and mentoring CS teams, building
onboarding playbooks, managing renewal pipelines, and driving product adoption across US/UK
enterprise accounts. Hands-on experience with Claude API integration, n8n workflow automation,
and Salesforce-driven CS operations. IIM Lucknow MBA. Holds AWS Solutions Architect Associate.

CORE SKILLS
Customer Success Leadership: Team Management & Mentoring, Customer Onboarding, Renewal Pipeline
Management, Churn Mitigation, 30-60-90 Day Plans, QBRs / MSRs, Customer Health Monitoring,
Escalation Management, Risk Register, Customer Advocacy, NPS & CSAT
AI & Automation: AI Agents, AI Workflow Automation, Generative AI, LLM Integration, Predictive
Churn Modeling, AI-Based Sentiment Analysis, n8n Workflows, Claude API, GPT, Process Automation,
Automated Ticket Routing, AI-Driven Health Scoring
Platforms & Tools: Salesforce CRM, Zendesk, AWS, Adobe Experience Cloud, Microsoft Azure,
Hybrid Cloud, SaaS Platforms, REST APIs
Business Acumen: Enterprise Account Management, US/UK Market Engagement, Multi-Million Dollar
Books of Business ($30M+), Upsell & Cross-Sell, C-Level Stakeholder Engagement, Strategic
Account Planning

PROFESSIONAL EXPERIENCE
Senior Customer Success Manager | Rackspace Technology | Oct 2025 - Present | Remote
- Leading enterprise CS engagements with a $30M+ Book of Business for US/UK-based clients on
  hybrid cloud platforms.
- Design and execute 30-60-90 day Customer Success Plans; conduct QBRs and MSRs with C-level
  stakeholders covering adoption, performance, and strategic roadmap alignment.
- Proactively monitor customer health indicators and risk signals; lead escalation management
  and churn mitigation strategies to protect and grow the revenue base.
- Built a Digital CSM Command Centre for real-time account intelligence, automated playbook
  retrieval, and live health monitoring across a 25-account enterprise portfolio.
- AI-Powered CS Operations: Introduced AI agents and workflow automation for health score alerts,
  renewal risk flagging, and meeting summary generation — reducing manual effort by ~30%.
- Predictive Churn Mitigation: Leveraged AI-based sentiment analysis and usage pattern tracking
  to identify at-risk accounts earlier in the renewal cycle.

Deputy Manager - Customer Success | ToTheNew (CloudKeeper) | Jul 2024 - Mar 2025 | Noida
- Led a CS team managing enterprise AWS cloud accounts; owned team KPIs, onboarding, and health
  across a US client portfolio.
- Managed and mentored a CS team; set performance targets, ensured SLA compliance.
- Designed a CS Playbook standardizing onboarding, reducing average onboarding time by 25%.
- Led AWS Well-Architected Reviews, generating $300K+ in revenue.
- Built automated health score triggers, Zendesk ticket routing (35% faster first-response).

Senior Customer Success Manager | Rackspace Technology | Jul 2021 - Jul 2024 | Remote
- Managed a $20M+ enterprise portfolio across complex cloud environments for US/UK accounts.
- Drove full customer lifecycle: onboarding, success planning, adoption, renewals, advocacy.
- Conducted QBRs/MSRs with C-level stakeholders; led NPS improvement and critical escalations.

Customer Success Account Manager | Adobe Inc. | Mar 2016 - Jul 2021 | Noida
- Managed enterprise accounts on Adobe Experience Cloud SaaS platforms for US/UK customers.
- Primary post-sales partner: onboarding, adoption, QBRs, health monitoring, renewals.

EARLIER CAREER
Technical Consultant | Adobe Inc. | May 2015 - Feb 2016
Technical Sales Specialist | iYogi | Jul 2014 - May 2015
Customer Care Executive | Wipro | Jul 2011 - Oct 2013

EDUCATION
MBA | Indian Institute of Management (IIM), Lucknow | 2018 - 2020
B.Com | Vinoba Bhave University, Dhanbad | 2010 - 2014

CERTIFICATIONS
AWS Solutions Architect Associate, AWS Cloud Practitioner, AWS Partner (Sales & Technical
Accreditation), Microsoft Certified: Azure Fundamentals (AZ-900), Rackspace MultiCloud Practitioner`;

db.prepare(
  `UPDATE profile SET
     resume_text = ?,
     full_name = ?,
     email = ?,
     min_salary_usd = ?,
     levels = ?,
     keywords = ?,
     locations = ?,
     updated_at = datetime('now')
   WHERE id = 1`
).run(
  RESUME,
  "Dhiraj Bhagat",
  "dhirajbhagatcc@gmail.com",
  50000,
  "mid,senior",
  "Customer Success, AI, SaaS, Cloud, Account Management, Customer Success Manager",
  "remote worldwide"
);

console.log("✓ Seeded profile for Dhiraj Bhagat.");
