/**
 * site-content.js — single source of truth for every word and image.
 *
 * Image paths point at /public/images/* so they ship with the site.
 * Edit anything here and the website updates on save.
 */

export const siteSettings = {
  title: "Connecting Communities",
  tagline: "Connection is only the beginning",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Our Model", href: "/our-model" },
    { label: "Ecosystem in Action", href: "/ecosystem" },
    { label: "Contact", href: "/contact" },
  ],
  footerColumns: [
    {
      links: [
        { label: "HOME", href: "/" },
        { label: "ABOUT", href: "/about" },
      ],
    },
    {
      links: [
        { label: "OUR MODEL", href: "/our-model" },
        { label: "ECO SYSTEM IN ACTION", href: "/ecosystem" },
      ],
    },
    {
      links: [
        { label: "CONTACT", href: "/contact" },
      ],
    },
  ],
  copyright: "©2026 Connecting Communities | All Rights Reserved.",
};

export const homeContent = {
  heroTitle: "Connection is only\nthe beginning",
  heroBody: "Together, we build access, opportunity,\nand futures that thrive",
  heroCtaLabel: "LEARN MORE",
  heroCtaHref: "/about",
  heroImage: "/images/home/04-hero-mountain-laptop.jpg",

  whyTitle: "Why we exist",
  whyBody:
    "Billions of people around the world remain offline, cut off from the opportunities that digital access creates. Connecting Communities (CC) exists to close this gap by creating smart, self-sustaining ecosystem that delivers integrated access to essential services, from connectivity and finance to agriculture, clean water, education, and healthcare.",
  whyCtaLabel: "LEARN MORE",
  whyCtaHref: "/about",

  approachTitle: "Our approach",
  approachItems: [
    {
      label: "ACCESS",
      caption:
        "A single connection can open the door to knowledge and possibility",
      image: "/images/home/02-approach-access-boy.jpg",
    },
    {
      label: "OPPORTUNITY",
      caption:
        "When communities connect, people can grow, create, and thrive together",
      image: "/images/home/03-approach-opportunity-hands.jpg",
    },
    {
      label: "TRUST",
      caption: "Stronger networks build stronger futures that endure over time",
      image: "/images/home/01-approach-trust-tree.jpg",
    },
  ],

  impactTitle: "Our impact, in numbers",
  impactSubtitle: "Because connection isn't abstract, it's measurable",
  impactCtaLabel: "LEARN MORE",
  impactCtaHref: "/ecosystem",
  impactStats: [
    {
      value: "65%",
      label:
        "Communities within our network now have first-time digital access",
    },
    {
      value: "500K",
      label: "Students reached through edtech-enabled learning platforms",
    },
    {
      value: "1500+",
      label: "Entrepreneurs connected to new markets and digital tools",
    },
    {
      value: "85%",
      label:
        "Of our community smart hubs are powered by renewable energy sources",
    },
  ],

  partnersTitle: "Our partners",
  partnerSlides: [
    {
      label: "Connectivity",
      image: "/images/about/08-sector-connectivity.jpg",
      href: "https://trac.africa/",
    },
    {
      label: "FinTech",
      image: "/images/home/06-partner-fintech-arch.jpg",
      href: "https://aspire-finance.co/",
    },
    {
      label: "EdTech",
      image: "/images/home/05-partner-edtech-tree.jpg",
      href: "https://aka-partners.com/our-sectors/#edtech",
    },
    {
      label: "WashTech",
      image: "/images/about/09-sector-washtech.jpg",
      href: "https://aquasol-tech.com/",
    },
    {
      label: "AgriTech",
      image: "/images/about/11-sector-agritech.jpg",
      href: "https://aka-partners.com/our-sectors/#agritech",
    },
    {
      label: "Tele-conferencing",
      image: "/images/about/10-sector-teleconferencing.jpg",
      // No external partner site yet.
      href: null,
    },
  ],

  contactTitle: "Contact",
  contactCtaLabel: "LEARN MORE",
};

export const aboutContent = {
  heroTitle: "Connecting\nis only the\nbeginning",
  heroBody: "Together, we build more than\nnetworks – we build futures.",
  heroImage: "/images/about/01-hero-kids-running.jpg",

  storyTitle: "Our story",
  storyBody:
    "Our founders spent years working across emerging markets in the telecommunications and fintech sectors, witnessing firsthand how access to essential infrastructure can reshape everyday life. They helped build mobile networks, launch financial services, and saw communities use these tools to connect, transact, and move forward.",
  storyImage: "/images/about/02-story-boy-reading.jpg",

  launchTitle: "Our launch",
  launchBody:
    "Our launch will roll out across East Africa, beginning with Rwanda as our regional headquarters. From there we will expand into the Democratic Republic of Congo, Tanzania, Uganda, and Kenya — building a connected East African network of community smart hubs.",
  launchImage: "/images/our-model/05-village-aerial-landscape.jpg",

  partnersTitle: "Partners & collaboration",
  partnersBody:
    "Connecting Communities brings together specialised businesses across essential services, aligning their capabilities through a shared platform, each operating independently, supported by best-in-class technology partners. Within Connecting Communities, selected capabilities are integrated into a single ecosystem, allowing proven platforms to work together to meet essential needs and enable sustainable community progress.",

  sectorCards: [
    {
      label: "Connectivity",
      image: "/images/about/08-sector-connectivity.jpg",
      back:
        "Reliable mobile and fixed-line networks form the digital backbone of every community we serve.",
      ctaLabel: "Learn more",
      ctaHref: "https://trac.africa/",
    },
    {
      label: "FinTech",
      image: "/images/home/06-partner-fintech-arch.jpg",
      back:
        "Aspire microfinance puts savings, loans, and digital payments within reach of every family in the network.",
      ctaLabel: "Learn more",
      ctaHref: "https://aspire-finance.co/",
    },
    {
      label: "EdTech",
      image: "/images/home/05-partner-edtech-tree.jpg",
      back:
        "Locally hosted classrooms deliver literacy, vocational, and digital-skills programmes for all ages.",
      ctaLabel: "Learn more",
      ctaHref: "https://aka-partners.com/our-sectors/#edtech",
    },
    {
      label: "WashTech",
      image: "/images/about/09-sector-washtech.jpg",
      back:
        "Clean-water infrastructure and pay-as-you-use sanitation tools, integrated with the local hub.",
      ctaLabel: "Learn more",
      ctaHref: "https://aquasol-tech.com/",
    },
    {
      label: "AgriTech",
      image: "/images/about/11-sector-agritech.jpg",
      back:
        "AgroEdu counters give smallholder farmers crop guidance, market prices, and direct buyer connections.",
      ctaLabel: "Learn more",
      ctaHref: "https://aka-partners.com/our-sectors/#agritech",
    },
    {
      label: "Tele-conferencing",
      image: "/images/about/10-sector-teleconferencing.jpg",
      back:
        "Private rooms equipped to connect community members with doctors, instructors, and family abroad.",
      // No external site for tele-conferencing yet — back side shows the
      // description without a CTA button.
      ctaLabel: null,
      ctaHref: null,
    },
  ],

  akaTitle: "AKA Partners",
  akaBody:
    'AKA is the strategic architect behind the Connecting Communities (CC) ecosystem. Founded by experts in emerging markets, we build ventures that combine innovative technology with grounded business models to drive sustainable social and economic growth.\n\nAs the visionary force behind CC, AKA coordinates a "last-mile" ecosystem of essential services - including finance, agriculture, and tele-conferencing. By scaling critical enablers like TrAC, we ensure that reliable connectivity serves as the digital backbone for this entire network. At AKA, we design the infrastructure of opportunity, empowering communities to reach their full potential.',
  akaCtaLabel: "LEARN MORE",
  akaCtaHref: "https://aka-partners.com/",
  akaLogo: "/logo/aka-logo-tagline.svg",

  leadersTitle: "Our leaders",
  leaders: [
    {
      name: "KARIM KHOJA",
      role: "Founding Partner and\nChairman, AKA Partners",
      image: "/images/about/leader-karim.jpg",
    },
    {
      name: "ALTAF LADAK",
      role: "Founding Partner,\nAKA Partners",
      image: "/images/about/leader-altaf.jpg",
    },
    {
      name: "AMYN SAMJI",
      role: "Founding Partner,\nAKA Partners",
      image: "/images/about/07-leader-4.jpg",
    },
    {
      name: "NASHIR JIWANI",
      role: "Executive Partner,\nAKA Partners",
      image: "/images/about/leader-nashir.jpg",
    },
  ],
};

export const ourModelContent = {
  heroTitle: "Inside the\nhubsite",
  heroBody:
    "A guided walkthrough of the building that holds every Connecting\nCommunities service under one roof.",
  heroImage: "/images/our-model/01-hero-boy-classroom.jpg",

  // Walkthrough chapters — driven by the WebGL scroll timeline.
  walkthroughIntroTitle: "A walkthrough of the hubsite",
  walkthroughIntroBody:
    "Each Transformation Aspirational Centre — TrAC — brings every Connecting Communities service together in one welcoming address. Scroll to step inside.",

  // Supplementary information that appears AFTER the walkthrough
  afterTitle: "Our model",
  afterBullets: [
    "Connecting Communities operates through Community Smart Hubs that bring essential services together in one place",
    "Each hub is supported by a network of nearby kiosks, all connected through a shared system that makes access easier and more distributed for communities to use",
    "Through this unified platform, service providers across connectivity, finance, agriculture, clean water, education, and tele-conferencing operate within a common infrastructure",
    "This integration removes the need for communities to navigate multiple, disconnected systems, allowing people to access what they need more simply and efficiently",
  ],
};


export const ecosystemContent = {
  heroTitle: "This is what\nconnection\nlooks like",
  heroBody: "Stories from the people building\nbetter lives with our services.",
  heroImage: "/images/ecosystem/01-hero-market-shop.jpg",

  categories: [
    { id: "people", label: "People" },
    { id: "partnerships", label: "Partnerships" },
    { id: "education", label: "Education" },
    { id: "leaders", label: "Leaders" },
  ],
  cards: [
    {
      id: "uwase",
      title: "Meet Uwase",
      eyebrow: "People",
      category: "people",
      image: "/images/ecosystem/01-hero-market-shop.jpg",
      // Position is a percentage relative to the gallery box; size is in
      // viewport-relative units. Together they give a foam-style scatter
      // (varied sizes, breathable spacing) without overlapping captions.
      x: 18, y: 16,
      w: 22, h: 30,
      rotate: -2,
      story: {
        intro: "Uwase runs a tailoring stall in Kigali. Last year she had no way to keep records or accept digital payments — today she does both, from the same hub her daughter learns to read in.",
        body: "She joined the local TrAC for a digital-skills evening class, opened her first bank account through Aspire microfinance the following week, and now uses a simple mobile POS to take payments from customers across the country. Her stall is the same — but the reach of the business has changed completely.",
      },
    },
    {
      id: "highland-farmer",
      title: "Highland farmer",
      eyebrow: "People",
      category: "people",
      image: "/images/ecosystem/02-card-farmer-rice.jpg",
      x: 44, y: 8,
      w: 16, h: 22,
      rotate: 1,
      story: {
        intro: "From rice terraces, market prices used to feel like a rumour. Now they arrive on screen, twice a day.",
        body: "Through the AgroEdu counter, smallholder farmers receive crop guidance, weather alerts, and direct buyer connections — putting fairer pricing within reach.",
      },
    },
    {
      id: "bridge-crossing",
      title: "Bridge crossing",
      eyebrow: "Partnerships",
      category: "partnerships",
      image: "/images/ecosystem/03-card-farmer-sunset.jpg",
      x: 64, y: 14,
      w: 24, h: 32,
      rotate: 1,
      story: {
        intro: "A connected hub at the end of a remote bridge means a journey doesn't have to start with a missing service.",
        body: "Each TrAC opens a single welcoming door to finance, training, and tele-conferencing — wherever the road ends.",
      },
    },
    {
      id: "market-aerial",
      title: "Aerial market",
      eyebrow: "Leaders",
      category: "leaders",
      image: "/images/ecosystem/08-card-aerial-market.jpg",
      x: 8, y: 50,
      w: 20, h: 26,
      rotate: 0,
      story: {
        intro: "Seen from above, a community market becomes a network — vendors, buyers, and the hub that makes it visible.",
        body: "Inventory tools and shared payment rails turn the same building into a community marketplace owned by the people who use it.",
      },
    },
    {
      id: "edtech-class",
      title: "Children with laptops",
      eyebrow: "Education",
      category: "education",
      image: "/images/home/05-partner-edtech-tree.jpg",
      x: 32, y: 56,
      w: 22, h: 28,
      rotate: -1,
      story: {
        intro: "EdTech classrooms host literacy, vocational training, and digital-skills programmes for every age.",
        body: "Built into the same building as the rest of the services families already rely on — so showing up to learn is the same trip as showing up for everything else.",
      },
    },
    {
      id: "water-tap",
      title: "Water collection",
      eyebrow: "People",
      category: "people",
      image: "/images/ecosystem/06-card-water-tap.jpg",
      x: 58, y: 60,
      w: 17, h: 23,
      rotate: 2,
      story: {
        intro: "WashTech infrastructure — clean water, pay-as-you-use sanitation — sits next to every other service the community depends on.",
        body: "Because access shouldn't depend on travelling to a different building for every thing a family needs in a day.",
      },
    },
    {
      id: "elder",
      title: "Community elder",
      eyebrow: "Leaders",
      category: "leaders",
      image: "/images/ecosystem/04-card-woman-laundry.jpg",
      x: 80, y: 54,
      w: 16, h: 24,
      rotate: -2,
      story: {
        intro: "Trust is built in person. The hub is designed to be a place that welcomes the elders who lead the community first.",
        body: "Every TrAC opens with the same front desk and the same staff who know everyone's name — financial services, classrooms, and tele-conferencing all live behind that desk.",
      },
    },
    {
      id: "mountain-bridge",
      title: "Connection at altitude",
      eyebrow: "Partnerships",
      category: "partnerships",
      image: "/images/home/04-hero-mountain-laptop.jpg",
      x: 16, y: 82,
      w: 22, h: 24,
      rotate: 1,
      story: {
        intro: "Connectivity reaches places the road doesn't always.",
        body: "Reliable mobile and fixed-line networks are the digital backbone of every community we serve.",
      },
    },
    {
      id: "hands",
      title: "Hands joined",
      eyebrow: "Partnerships",
      category: "partnerships",
      image: "/images/about/08-sector-connectivity.jpg",
      x: 44, y: 86,
      w: 18, h: 22,
      rotate: 0,
      story: {
        intro: "Connecting Communities is built by partners — best-in-class operators, working under one ecosystem.",
        body: "Each capability is independent, but operated through a shared platform — so the user only ever has one front door.",
      },
    },
    {
      id: "telehealth",
      title: "Telehealth booth",
      eyebrow: "Leaders",
      category: "leaders",
      image: "/images/about/11-sector-agritech.jpg",
      x: 68, y: 84,
      w: 16, h: 22,
      rotate: 2,
      story: {
        intro: "Tele-conferencing rooms let community members meet a doctor, an instructor, or a relative anywhere in the world — without leaving the village.",
        body: "Private, equipped, and bookable — part of the same building as everything else the family needs.",
      },
    },
  ],
};

export const contactContent = {
  heroTitle: "Connecting\nis only the\nbeginning",
  heroBody: "Together, we build more than\nnetworks – we build futures.",
  heroImage: "/images/contact/01-hero-girl-portrait.jpg",

  blockTitle: "Contact",
  blockBody:
    "Whether you're an investor, policymaker, educator, or community\nleader, there's a role for you in building the next generation of\nconnected communities.",
  blockImage: "/images/about/08-sector-connectivity.jpg",

  hqTitle: "Kigali headquarters",
  hqOrgName: "Connecting Communities Africa (CCA)",
  hqAddress: "Suit# 46, Ground Floor, xyz Street, Kigali.",
  hqEmail: "info@connetingcommunities.com",
  hqMapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5!2d30.06!3d-1.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!2sKigali",

  formCtaLabel: "SUBMIT",
};

