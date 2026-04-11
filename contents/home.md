# Home

> **URL:** https://cwkexperience.com/
> **New route:** `/`

---

## Hero

**Headline:**
CWK. is like a sports agent for entrepreneurs.

**Subtext:**
We rep your career, install the infrastructure that scales you, and manage your growth like a PE firm manages a portfolio company.

**CTA:**
Find Your Bottleneck (2 Min, Free) →

*Links to: `/brand-mirror`*

---

## The Mission

Most high-performing entrepreneurs between $150k–$5M are stuck because their infrastructure is leaking.

Your systems are fragmented.

Your authority is scattered across tools or locked in your head.

Deals die because you can't prove value fast enough, or you forgot to follow up.

The result? You're working harder to earn the same.

CWK. is your long-term partner, we install the infrastructure that catches everything, then manage your operations and coordinate your growth. We're not consultants who give advice and leave. We're business managers who acquire a stake in your future and stay for the long game.

We support you across four categories:

**Mind:** Strategic clarity, decision frameworks, mental performance

**Body:** Operational systems, time/energy optimization

**Soul:** Legacy building, IP development, thought leadership

**Pocket:** Revenue systems, opportunity sourcing, deal structuring

This is for entrepreneurs who always knew they needed a different kind of partner, one built for leverage, not hustle.

One that doesn't leave after the install.

If you're ready to move from scattered systems to operational sovereignty, this is where you stop rebuilding every week.

---

## Waitlist

**Eyebrow:** EARLY ACCESS

**Headline:**
We're building something for founders who are done patching leaks.

**Subtext:**
CWK. Agent+ is the operating system that manages your growth across Mind, Body, Soul, and Pocket. Join the waitlist to get early access when we launch.

**Form:**
- Email input (placeholder: "your@email.com")
- Submit button: "Join the Waitlist →"

**Social proof line:**
Join 50+ founders already on the list.

**Post-submit confirmation:**
You're in. We'll reach out when it's your turn.

**Implementation Notes:**
- React Island component (`WaitlistForm.tsx`) with `client:visible`
- Submits to Cloudflare Workers endpoint or Cloudflare Pages Function (`/api/waitlist`)
- Stores email + timestamp to Cloudflare KV (namespace: `WAITLIST`)
- Client-side validation: valid email format, not empty
- Honeypot field for spam prevention (hidden input, reject if filled)
- Success/error states with animation (fadeUp)
- Glassmorphic card container matching brand system

---

## Product Preview

**Eyebrow:** THE PLATFORM

**Headline:**
See what's inside CWK. Agent+

**Subtext:**
Your personal command center for managing relationships, tracking momentum, and executing with clarity.

**CTA:**
Explore the Product → `/product`

---

## CTAs

- Learn More About Kris → `/about`
- Learn More About The Work → `/work`

---

## Footer

ABOUT CWK.

CWK. gamifies your growth across Mind, Body, Soul, and Pocket.

Privacy Policy | Terms and Conditions

© 2026 All rights reserved
