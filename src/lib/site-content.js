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
    { label: "Partners", href: "/partners" },
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
        { label: "PARTNERS", href: "/partners" },
        { label: "CONTACT", href: "/contact" },
      ],
    },
  ],
  copyright: "©2026 Connecting Communities | All Rights Reserved.",
};

export const homeContent = {
  heroTitle: "Connection is only\nthe beginning.",
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
    },
    { label: "FinTech", image: "/images/home/06-partner-fintech-arch.jpg" },
    { label: "EdTech", image: "/images/home/05-partner-edtech-tree.jpg" },
    { label: "WashTech", image: "/images/about/09-sector-washtech.jpg" },
    { label: "AgriTech", image: "/images/about/11-sector-agritech.jpg" },
    {
      label: "Tele-conferencing",
      image: "/images/about/10-sector-teleconferencing.jpg",
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
    "Our launch will roll out across East Africa, beginning with Rwanda as our regional headquarters, with X community smart hubs and X digital centers by the end of 2026.",

  partnersTitle: "Partners & collaboration",
  partnersBody:
    "Connecting Communities brings together specialised businesses across essential services, aligning their capabilities through a shared platform, each operating independently, supported by best-in-class technology partners. Within Connecting Communities, selected capabilities are integrated into a single ecosystem, allowing proven platforms to work together to meet essential needs and enable sustainable community progress.",

  sectorCards: [
    {
      label: "Connectivity",
      image: "/images/about/08-sector-connectivity.jpg",
    },
    { label: "FinTech", image: "/images/home/06-partner-fintech-arch.jpg" },
    { label: "EdTech", image: "/images/home/05-partner-edtech-tree.jpg" },
    { label: "WashTech", image: "/images/about/09-sector-washtech.jpg" },
    { label: "AgriTech", image: "/images/about/11-sector-agritech.jpg" },
    {
      label: "Tele-conferencing",
      image: "/images/about/10-sector-teleconferencing.jpg",
    },
  ],

  akaTitle: "AKA Partners",
  akaBody:
    'AKA is the strategic architect behind the Connecting Communities (CC) ecosystem. Founded by experts in emerging markets, we build ventures that combine innovative technology with grounded business models to drive sustainable social and economic growth.\n\nAs the visionary force behind CC, AKA coordinates a "last-mile" ecosystem of essential services - including finance, agriculture, and tele-conferencing. By scaling critical enablers like TrAC, we ensure that reliable connectivity serves as the digital backbone for this entire network. At AKA, we design the infrastructure of opportunity, empowering communities to reach their full potential.',
  akaCtaLabel: "LEARN MORE",
  akaCtaHref: "https://akapartners.com",
  akaLogo: "/images/about/03-aka-partners-logo.png",

  leadersTitle: "Our leaders",
  leaders: [
    {
      name: "KARIM KHOJA",
      role: "Founding Partner and\nChairman, AKA Partners",
      image: "/images/about/05-leader-2.jpg",
    },
    {
      name: "ALTAF LADAK",
      role: "Founding Partner,\nAKA Partners",
      image: "/images/about/06-leader-3.jpg",
    },
    {
      name: "AMYN SAMJI",
      role: "Founding Partner,\nAKA Partners",
      image: "/images/about/07-leader-4.jpg",
    },
    {
      name: "NASHIR JIWANI",
      role: "Executive Partner,\nAKA Partners",
      image: "/images/about/04-leader-1.jpg",
    },
  ],
};

export const ourModelContent = {
  heroTitle: "Connecting\nis only the\nbeginning",
  heroBody: "Together, we build more than\nnetworks – we build futures.",
  heroImage: "/images/our-model/01-hero-boy-classroom.jpg",

  modelTitle: "Our model",
  modelBullets: [
    "Connecting Communities operates through Community Smart Hubs that bring essential services together in one place",
    "Each hub is supported by a network of nearby kiosks, all connected through a shared system that makes access easier and more distributed for communities to use",
    "Through this unified platform, service providers across connectivity, finance, agriculture, clean water, education, and tele-conferencing operate within a common infrastructure",
    "This integration removes the need for communities to navigate multiple, disconnected systems, allowing people to access what they need more simply and efficiently",
  ],
  modelImage: "/images/ecosystem/03-card-farmer-sunset.jpg",

  ecosystemBody:
    "As community smart hubs and digital centers connect across different locations, they form a growing local network that can evolve over time. This model enables services to reach people where they are, while remaining part of a single, adaptable ecosystem designed to support long-term community progress.",

  // Used by OurModelJourney as the section intro (above the scrollytelling)
  launchTitle: "Inside a TrAC",
  launchBody:
    "Our launch begins in Rwanda — our regional headquarters — and rolls out across East Africa with X community smart hubs and X digital centers by the end of 2026. Step inside one of our Transformation Aspirational Centres to see what that looks like.",

  // Closing band beneath the journey (kept from the previous launch section)
  bottomBandImage: "/images/our-model/05-village-aerial-landscape.jpg",
  bottomBandTitle: "X community smart hubs\nY digital centers",
  bottomBandSub: "by the end of 2026 — beginning in Rwanda",
};

/**
 * Scroll-driven scenes for the TrAC walkthrough on the Our Model page.
 * Each scene becomes one full viewport of scroll distance.
 *
 * To swap in real .glb/.gltf models from AKA Partners later, replace the
 * `image` field with a `model` field and update SceneLayer in
 * OurModelJourney.js to render <Canvas><Model/></Canvas>.
 */
export const trACScenes = [
  {
    id: "exterior",
    label: "Exterior",
    title: "A TrAC at the heart of the community",
    body: "Each Transformation Aspirational Centre — TrAC — is a single welcoming address where every Connecting Communities service lives side by side. This is what arriving at one looks like.",
    image: "/images/our-model/journey/01-exterior.jpg",
    alt: "Exterior of a TrAC building with TrAC and aspire signage at dusk",
  },
  {
    id: "reception",
    label: "Reception",
    title: "One front desk for everything",
    body: "Aspire microfinance and TrAC services share a single counter, so a farmer applying for a loan, a parent enrolling a child, and a trader topping up data all start in the same place.",
    image: "/images/our-model/journey/02-reception-aspire.jpg",
    alt: "Reception area with Aspire microfinance and TrAC counters",
  },
  {
    id: "tele-conferencing",
    label: "Tele-conferencing",
    title: "Connecting people across borders",
    body: "Private rooms equipped for tele-conferencing let community members meet a doctor, an instructor, or a relative anywhere in the world — without leaving the village.",
    image: "/images/our-model/journey/03-trac-room.jpg",
    alt: "Tele-conferencing room with desk, monitor and TrAC branding",
  },
  {
    id: "edtech",
    label: "EdTech",
    title: "Learning, locally",
    body: "Classrooms host literacy, vocational training, and digital-skills programmes — built into the same building as the rest of the services families already rely on.",
    image: "/images/our-model/journey/05-classroom.jpg",
    alt: "Classroom with shared desks and screens",
  },
  {
    id: "agritech",
    label: "AgriTech",
    title: "Tools for the farms outside the door",
    body: "AgroEdu counters give smallholder farmers access to diversified-crop guidance, market prices, and the buyers who want to source from them.",
    image: "/images/our-model/journey/07-agroedu.jpg",
    alt: "AgroEdu counter with farming education poster",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    title: "Where the local economy lives",
    body: "Shelving, payment, and inventory tools turn the same building into a community marketplace — owned by the people who use it, supported by everything else under this roof.",
    image: "/images/our-model/journey/08-marketplace.jpg",
    alt: "Marketplace and retail shelving area with chalkboard pricing",
  },
];

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
      title: "Farmer in highlands",
      category: "people",
      image: "/images/ecosystem/02-card-farmer-rice.jpg",
      size: "md",
      row: 1,
      col: 3,
      rotate: -2,
    },
    {
      title: "Bridge crossing",
      category: "people",
      image: "/images/ecosystem/03-card-farmer-sunset.jpg",
      size: "md",
      row: 1,
      col: 5,
      rotate: 1,
    },
    {
      title: "Market vendor",
      category: "people",
      image: "/images/ecosystem/01-hero-market-shop.jpg",
      size: "sm",
      row: 1,
      col: 6,
      rotate: 0,
    },
    {
      title: "Sunrise meeting",
      category: "partnerships",
      image: "/images/ecosystem/03-card-farmer-sunset.jpg",
      size: "lg",
      row: 1,
      col: 8,
      rotate: 1,
    },
    {
      title: "Hands joined",
      category: "partnerships",
      image: "/images/about/08-sector-connectivity.jpg",
      size: "md",
      row: 1,
      col: 9,
      rotate: -1,
    },
    {
      title: "Community elder",
      category: "leaders",
      image: "/images/ecosystem/04-card-woman-laundry.jpg",
      size: "md",
      row: 3,
      col: 2,
      rotate: -2,
    },
    {
      title: "Children with laptop",
      category: "education",
      image: "/images/home/05-partner-edtech-tree.jpg",
      size: "md",
      row: 3,
      col: 4,
      rotate: 0,
    },
    {
      title: "Water collection",
      category: "people",
      image: "/images/ecosystem/06-card-water-tap.jpg",
      size: "md",
      row: 3,
      col: 5,
      rotate: 0,
    },
    {
      title: "Telehealth booth",
      category: "leaders",
      image: "/images/about/11-sector-agritech.jpg",
      size: "sm",
      row: 3,
      col: 7,
      rotate: 2,
    },
    {
      title: "Aerial market",
      category: "leaders",
      image: "/images/ecosystem/08-card-aerial-market.jpg",
      size: "md",
      row: 3,
      col: 8,
      rotate: 0,
    },
    {
      title: "Mountain bridge",
      category: "partnerships",
      image: "/images/home/04-hero-mountain-laptop.jpg",
      size: "md",
      row: 3,
      col: 10,
      rotate: 1,
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

export const partnersContent = {
  heroTitle: "Our\npartners",
  heroBody: "Specialised businesses, working under one ecosystem.",
  heroImage: "/images/about/08-sector-connectivity.jpg",

  introTitle: "Partners & collaboration",
  introBody:
    "Connecting Communities brings together specialised businesses across essential services, aligning their capabilities through a shared platform, each operating independently, supported by best-in-class technology partners. Within Connecting Communities, selected capabilities are integrated into a single ecosystem, allowing proven platforms to work together to meet essential needs and enable sustainable community progress.",

  partnerCards: [
    {
      label: "Connectivity",
      image: "/images/partners/08-sector-connectivity.jpg",
    },
    { label: "FinTech", image: "/images/partners/06-partner-fintech-arch.jpg" },
    { label: "EdTech", image: "/images/partners/05-partner-edtech-tree.jpg" },
    { label: "WashTech", image: "/images/partners/09-sector-washtech.jpg" },
    { label: "AgriTech", image: "/images/partners/11-sector-agritech.jpg" },
    {
      label: "Tele-conferencing",
      image: "/images/partners/10-sector-teleconferencing.jpg",
    },
  ],
};
