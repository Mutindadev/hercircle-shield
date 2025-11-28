# HerCircle Shield User Guide

## Welcome to HerCircle Shield

HerCircle Shield is your personal safety companion for navigating online spaces. This guide will help you understand and use all features effectively.

---

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Features Overview](#features-overview)
4. [Using the Extension](#using-the-extension)
5. [Safety Tips](#safety-tips)
6. [Troubleshooting](#troubleshooting)
7. [Privacy & Security](#privacy--security)
8. [Getting Help](#getting-help)

---

## Installation

### Step 1: Download the Extension

Download the HerCircle Shield extension package from the official website or Chrome Web Store.

### Step 2: Install in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top right
3. Click "Load unpacked"
4. Select the `extension` folder from the downloaded package
5. The HerCircle Shield icon (pink heart) will appear in your toolbar

### Step 3: Initial Setup

1. Click the HerCircle Shield icon
2. Review and accept the privacy policy
3. Configure your initial settings (sensitivity level, notifications)
4. Add at least one trusted contact for emergency alerts

---

## Getting Started

### Understanding the Interface

The HerCircle Shield popup has four main tabs accessible from the bottom navigation:

**Home Tab** displays your safety statistics, panic button, and quick actions for evidence capture and support.

**Circle Tab** manages your trusted contacts and support circles where you can connect with peers.

**Learn Tab** provides educational resources, legal information, and regional hotlines.

**Settings Tab** allows you to customize detection sensitivity, notifications, and privacy preferences.

### First Steps

1. **Add Trusted Contacts**: Navigate to the Circle tab and add 3-5 people you trust who can respond to emergency alerts.

2. **Configure Detection Sensitivity**: Go to Settings and adjust the slider based on your needs:
   - **Low**: Detects only severe threats
   - **Balanced**: Recommended for most users
   - **High**: Maximum protection, may have more false positives

3. **Test the Extension**: Visit a social media platform and observe how the extension monitors content in real-time.

---

## Features Overview

### Real-Time Content Detection

HerCircle Shield continuously monitors web pages for harmful content including:

- Harassment and verbal abuse
- Threats and violence
- Doxxing (personal information leaks)
- Sexual harassment
- Financial control and coercion
- Gaslighting patterns
- African language GBV slang

When harmful content is detected, you'll see:
- Red border around the content
- Warning banner with threat details
- Options to hide, report, or dismiss

### Panic Button

The prominent red button on the Home tab is your emergency lifeline. When pressed:

1. Instant alerts are sent to all your trusted contacts
2. Your current location is shared (if GPS is enabled)
3. Evidence is automatically captured
4. The platform is notified (optional)

**When to Use:**
- You feel unsafe or threatened
- Someone is harassing you persistently
- You need immediate help from your support network

### Evidence Capture

The "Capture Evidence" button takes a screenshot of the current page and stores it securely with:
- Timestamp
- URL and platform
- Content hash for legal verification
- Your description (optional)

**Use Cases:**
- Documenting harassment for legal action
- Building a case for HR complaints
- Reporting to platform moderators
- Creating evidence packages for police reports

### Support Circles

Join or create circles to connect with peers facing similar challenges:

**Types of Circles:**
- Emotional support groups
- Legal advice sharing
- Safety planning
- General peer support

**Features:**
- End-to-end encrypted chat
- Moderated discussions
- Anonymous participation option
- Real-time messaging via WebSocket

### NCII Takedown

If intimate images are shared without your consent:

1. Navigate to the Learn tab
2. Select "NCII Takedown Hub"
3. Choose the platform (Facebook, Instagram, Twitter, TikTok, Telegram)
4. Provide the content URL
5. Submit the takedown request

The system generates pre-filled forms and tracks your request status.

### Legal Resources

Access country-specific legal information:

**Available for:**
- Kenya
- Nigeria
- South Africa
- Ghana
- Other African nations

**Resources Include:**
- Applicable laws and regulations
- Emergency hotlines
- Legal aid organizations
- Document templates (HR letters, police reports, cease & desist)

---

## Using the Extension

### On Social Media Platforms

#### Twitter/X
The extension monitors tweets, replies, and direct messages for harmful content. Detected threats appear with red borders and warning banners.

#### Facebook
Monitors posts, comments, and Messenger conversations. You can hide harmful content with one click.

#### Instagram
Scans posts, stories, comments, and DMs. Supports both feed and story detection.

#### LinkedIn
Monitors professional harassment in posts, messages, and comments.

#### TikTok
Detects harmful content in video descriptions and comments.

#### WhatsApp Web
Monitors chat messages for threats and harassment patterns.

#### Gmail
Scans email content for harassment, threats, and doxxing attempts.

### Managing Trusted Contacts

1. Click the Circle tab
2. Click "Add Trusted Contact"
3. Enter their name, email, and/or phone number
4. Select your relationship (friend, family, colleague)
5. Click "Save"

**Best Practices:**
- Add people who are responsive and supportive
- Include contacts in different locations
- Update contact information regularly
- Test alerts to ensure they work

### Customizing Settings

#### Detection Sensitivity
Adjust how aggressively the system detects threats:
- **Low**: Only critical threats
- **Balanced**: Recommended default
- **High**: Maximum protection

#### Auto-Hide Content
When enabled, harmful content is automatically blurred after detection.

#### Notifications
Control when you receive browser notifications:
- Threat detected
- Trusted contact alerts
- Daily safety reports
- Heart animations (motivational messages)

#### GPS Sharing
Enable location sharing for panic button alerts. Your location is only shared when you press the panic button.

#### Heart Animations
Periodic motivational messages with heart icons. Disable if you prefer minimal notifications.

---

## Safety Tips

### Online Safety Best Practices

1. **Document Everything**: Use the evidence capture feature regularly to build a comprehensive record.

2. **Don't Engage with Harassers**: Responding often escalates the situation. Use the hide and report features instead.

3. **Update Privacy Settings**: Review platform privacy settings regularly to limit who can contact you.

4. **Use Strong Passwords**: Enable two-factor authentication on all accounts.

5. **Trust Your Instincts**: If something feels wrong, use the panic button or reach out to your support circle.

### When to Escalate

Contact authorities if you experience:
- Direct threats of violence
- Stalking or persistent harassment
- Doxxing with intent to harm
- Non-consensual intimate images
- Extortion or blackmail

### Building Your Support Network

1. **Diverse Contacts**: Include friends, family, colleagues, and professionals
2. **Clear Communication**: Explain what kind of support you need from each contact
3. **Regular Check-ins**: Stay connected with your support network
4. **Professional Help**: Don't hesitate to seek counseling or legal advice

---

## Troubleshooting

### Extension Not Working

**Issue:** Extension icon is grayed out  
**Solution:** Refresh the page or restart Chrome

**Issue:** Detection not working on a specific site  
**Solution:** Check if the site is supported. Report unsupported sites via GitHub issues.

**Issue:** Panic button not sending alerts  
**Solution:** Verify trusted contacts are configured correctly and have valid contact information.

### Performance Issues

**Issue:** Page loading slowly  
**Solution:** Reduce detection sensitivity or disable auto-hide feature

**Issue:** Too many false positives  
**Solution:** Lower detection sensitivity to "Balanced" or "Low"

### Data & Privacy

**Issue:** Want to export your data  
**Solution:** Go to Settings → Data & Privacy → Export My Data

**Issue:** Want to delete all data  
**Solution:** Go to Settings → Data & Privacy → Delete All Data (irreversible)

---

## Privacy & Security

### Data Collection

HerCircle Shield collects minimal data necessary for functionality:
- Incident reports (stored locally by default)
- Detection logs (anonymous statistics)
- Trusted contact information (encrypted)
- Chat messages (end-to-end encrypted)

### Data Storage

**Local Storage:**
- Settings and preferences
- Trusted contacts
- Evidence captures
- Detection logs

**Cloud Storage (Optional):**
- Incident reports (encrypted)
- Chat history (end-to-end encrypted)
- Peer matching data (anonymous)

### Your Rights

You have the right to:
- Access your data at any time
- Export your data in JSON format
- Delete your data permanently
- Opt out of cloud storage
- Request data correction

### Security Measures

- End-to-end encryption for all peer communications
- HTTPS-only connections
- No third-party tracking
- Anonymous usage analytics (opt-in)
- Regular security audits

---

## Getting Help

### Support Channels

**Technical Support:**
- Email: support@hercircle.org
- GitHub Issues: https://github.com/hercircle/shield/issues
- Discord Community: https://discord.gg/hercircle

**Emergency Support:**
- Use the panic button for immediate help
- Contact local authorities for serious threats
- Reach out to regional GBV hotlines (listed in Learn tab)

### Regional Hotlines

**Kenya:**
- GBV Hotline: 1195
- FIDA Kenya: +254 20 387 2131

**Nigeria:**
- GBV Hotline: 0800 ABUSE (22873)
- NHRC: 0800 9000 NHRC

**South Africa:**
- GBV Command Centre: 0800 150 150
- Police: 10111

**Ghana:**
- Domestic Violence Hotline: 055 378 9991
- Police: 191

### Feedback & Suggestions

We welcome your feedback to improve HerCircle Shield:
- Feature requests: GitHub Issues
- Bug reports: support@hercircle.org
- General feedback: feedback@hercircle.org

---

## Appendix

### Glossary

**GBV**: Gender-Based Violence  
**NCII**: Non-Consensual Intimate Images  
**Doxxing**: Publishing private information without consent  
**Gaslighting**: Psychological manipulation to make someone question their reality  
**PDQ Hash**: Perceptual hash for image matching  
**E2E Encryption**: End-to-end encryption where only sender and receiver can read messages

### Supported Platforms

- Twitter/X
- Facebook
- Instagram
- LinkedIn
- TikTok
- WhatsApp Web
- Gmail
- More platforms coming soon

### System Requirements

- Chrome 88 or higher
- Internet connection (for AI detection)
- 50MB free storage
- Windows, macOS, or Linux

---

**Remember: You are not alone. HerCircle Shield is here to support you every step of the way.**

*Made with 💗 for African women*

Version 1.0.0 | Last Updated: November 2025
