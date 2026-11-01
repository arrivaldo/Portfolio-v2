// Content migrated from v1 (D:\Proyects\Portfolio_versions\v1\my_portfolio).

export type Lang = 'en' | 'es'
export type Social = { id: 'github' | 'linkedin' | 'whatsapp' | 'email'; label: string; href: string }
export type Brand = { name: string; logo: string; height: number; badge?: { logo: string; height: number } }
export type Article = { id: number; title: string; description: string; href: string; tag: string; meta: string }
export type Skill = { id: 'frontend' | 'styles' | 'backend' | 'devops'; title: string; items: string[] }
export type Job = { period: string; company: string; role: string; logo: string; highlights: string[] }
/** How a project's headline metric is demonstrated on screen. */
export type Proof = { kind: 'race'; before: number; after: number } | { kind: 'count'; to: number; unit: 'person' | 'client' | 'page' } | { kind: 'live' }
export type Project = {
  id: string
  title: string
  summary: string
  stack: string[]
  metric: { value: string; label: string }
  image: string
  /** Accent of the glow behind the cut-out image. */
  glow: string
  href: string
  proof: Proof
  story: { problem: string; solution: string; result: string }
  /** Set on work done for a client while employed elsewhere: shows who it was for, through whom, and my part. */
  client?: { via: string; role: string; period: string }
}
/** Smaller projects. `story` feeds the same case-study modal as the featured projects (drafted by Claude from the v1 descriptions — user to review). */
export type ArchiveProject = { name: string; tagline: string; description: string; stack: string[]; href: string; image: string; glow: string; story: { problem: string; solution: string; result: string } }
export type Stat = { value: number; prefix?: string; suffix?: string; decimals?: number; label: string }
export type Step = { title: string; text: string }
export type Testimonial = { quote: string; name: string; role: string; photo?: string }
export type Role = { slug: string; title: string; description: string; stack: string[]; signal: string }
export type NowItem = { label: string; text: string }

export type LabCopy = {
  bento: { title: string; lead: string; globeTitle: string; globeText: string; cubeTitle: string; cubeText: string; spin: string; spinLabel: string; loading: string; timeTitle: string; day: string; night: string; ahead: string; behind: string; same: string; nowTitle: string; ghTitle: string; ghText: string; ghNote: string; ghError: string; askTitle: string; askText: string; askOpen: string }
}

export type Content = {
  meta: { title: string; description: string }
  profile: {
    firstName: string
    lastName: string
    fullName: string
    /** First word of the title rotates through these; the second line stays fixed. */
    role: [string[], string]
    goal: string
    intro: string
    quote: string
    email: string
    city: string
    timeZone: string
    status: string
    years: string
    resume: string
  }
  nav: { label: string; href: string }[]
  ui: {
    projects: string
    loading: string
    resume: string
    menu: { open: string; close: string }
    readMore: string
    readArticle: string
    prevArticle: string
    nextArticle: string
    aboutLabel: string
    aboutTitle: string
    workLabel: string
    workTitle: string
    workTotal: string
    brandsLabel: string
    brandsCount: (n: number) => string
    projectsLabel: string
    projectsTitle: string
    projectsIntro: string
    /** Short right-hand leads for section heads (drafted 2026-10-07, user to review). */
    aboutIntro: string
    processIntro: string
    workIntro: string
    testimonialsIntro: string
    contactIntro: string
    archiveLabel: string
    archiveTitle: string
    viewAll: string
    showMore: string
    showLess: string
    viewCase: string
    clientWork: string
    processLabel: string
    processTitle: string
    /** Label over the project thumbnails on the What I do cards. */
    processProof: string
    testimonialsLabel: string
    testimonialsTitle: string
    labLabel: string
    /** "Beyond the code" bento copy. */
    lab: LabCopy
    contactLabel: string
    contactTitle: [string, string]
    contactText: string
    contactCta: string
    copy: string
    copied: string
    backToTop: string
    rights: string
    switchTo: (mode: string) => string
    proof: { manual: string; withAi: string; live: string; checking: string; latency: (ms: number) => string; median: string; saved: string }
    story: { open: string; problem: string; solution: string; result: string; visit: string; close: string }
    build: string
    chat: { open: string; hint: string; title: string; intro: string; placeholder: string; send: string; close: string; thinking: string; suggestions: string[]; errors: { busy: string; offline: string; generic: string } }
    form: { title: string; name: string; email: string; subject: string; message: string; send: string; sending: string; sent: string; error: string }
    pauseCarousel: string
    skip: string
    playCarousel: string
    themes: { dark: string; light: string }
  }
  stats: Stat[]
  projects: Project[]
  archive: ArchiveProject[]
  articles: Article[]
  skills: Skill[]
  skillGroups: Record<string, string[]>
  jobs: Job[]
  education: string[]
  certifications: string[]
  process: Step[]
  roles: Role[]
  testimonials: Testimonial[]
  now: NowItem[]
}

/** Gmail's web compose window with the address already in To: — mailto opened the visitor's desktop client (Outlook). */
export const gmailCompose = (email: string) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`

export const socials: Social[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/arrivaldo' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/erickbarcena7/' },
  { id: 'whatsapp', label: 'WhatsApp', href: 'https://api.whatsapp.com/send?phone=525540779049' },
  { id: 'email', label: 'Email', href: gmailCompose('erickbarcena00@gmail.com') },
]

/**
 * Heights (px, desktop) match the v1 strip: each mark is tuned by eye so they read at the same visual weight.
 * Mercedes is split into badge + wordmark, as in v1.
 */
export const brands: Brand[] = [
  { name: 'PepsiCo', logo: '/brands/pepsico.svg', height: 31 },
  { name: 'Unilever', logo: '/brands/unilever.svg', height: 25 },
  { name: 'Banco Azteca', logo: '/brands/banco-azteca.svg', height: 24 },
  { name: 'Alpina', logo: '/brands/alpina.svg', height: 53 },
  { name: 'LALA', logo: '/brands/lala.svg', height: 42 },
  { name: 'FEMSA', logo: '/brands/femsa.svg', height: 29 },
  { name: 'Mercedes-Benz', logo: '/brands/mercedes-text.webp', height: 24, badge: { logo: '/brands/mercedes-badge.webp', height: 42 } },
  { name: 'OXXO', logo: '/brands/oxxo.svg', height: 42 },
  { name: 'Munich Re', logo: '/brands/munichRE.svg', height: 42 },
  { name: 'Grupo Bimbo', logo: '/brands/bimbo.svg', height: 42 },
  { name: 'Nestlé', logo: '/brands/nestle.svg', height: 31 },
  { name: 'Heineken', logo: '/brands/heineken.svg', height: 36 },
  { name: 'Santander', logo: '/brands/santander.svg', height: 70 },
  { name: 'Mondelēz', logo: '/brands/mondelez.svg', height: 31 },
  { name: 'Claro', logo: '/brands/claro.svg', height: 31 },
  { name: 'Banco Popular Dominicano', logo: '/brands/popular.svg', height: 31 },
  { name: 'Postobón', logo: '/brands/postobon.svg', height: 31 },
  { name: 'Kellanova', logo: '/brands/kellanova.svg', height: 31 },
]

const profile = {
  firstName: 'Erick',
  lastName: 'Bárcena',
  fullName: 'Erick Rodríguez Bárcena',
  email: 'erickbarcena00@gmail.com',
  city: 'México',
  timeZone: 'America/Mexico_City',
  resume: '/Erick_Rodriguez_Barcena_CV.pdf',
}

const projectsBase = [
  { id: 'ai-email', title: 'AI Email Reply Extension', stack: ['JavaScript', 'Java', 'Spring Boot'], image: '/projects/art-email.webp', glow: '#8b7cff', href: 'https://chromewebstore.google.com/detail/email-writer-assistant/bkpahmihgmehmppafbnmonmagfohckno', proof: { kind: 'race', before: 100, after: 20 } as Proof },
  { id: 'incidents', title: 'Incidence Management App', stack: ['React', 'Node.js', 'MongoDB'], image: '/projects/art-incidents.webp', glow: '#22c3e6', href: 'https://cds-estafeta.vercel.app/', proof: { kind: 'count', to: 30, unit: 'person' } as Proof },
  // Client work (texts drafted by Claude from the resume — user to review). Images are illustrative mockups of my part of the work, not the clients' sites.
  { id: 'yalo', title: 'AI Agents', stack: ['TypeScript', 'Python', 'Lua', 'AWS', 'MCP'], image: '/projects/art-yalo.webp', glow: '#ffb020', href: 'https://platform.happyrobot.ai/deployments/cxbnp1tydydh', proof: { kind: 'count', to: 20, unit: 'client' } as Proof },
  { id: 'apesa', title: 'APESA QA Automation', stack: ['Playwright', 'GitLab CI/CD', '.NET', 'JMeter', 'SQL'], image: '/projects/art-apesa.webp', glow: '#3ddc84', href: 'https://apesa.mx/', proof: { kind: 'count', to: 12, unit: 'person' } as Proof },
  // HealthTech and Life US merged into one card: same client, stack and image.
  { id: 'munichre', title: 'Munich Re', stack: ['Pega', 'Java', 'SQL', 'Playwright', 'Jenkins'], image: '/projects/art-munich.webp', glow: '#4d7cff', href: 'https://www.munichre.com/mrhealthtech/en.html', proof: { kind: 'live' } as Proof },
  { id: 'claro360', title: 'Claro 360', stack: ['JavaScript', 'TypeScript', 'JSP', 'Webpack', 'Laravel'], image: '/projects/art-claro.webp', glow: '#ff5a5a', href: 'https://claro360.com/plataforma360/suitePersona', proof: { kind: 'count', to: 25, unit: 'page' } as Proof },
]

const archiveBase = [
  { name: 'QueueStack', stack: ['TypeScript', 'HTML', 'JavaScript'], href: 'https://github.com/arrivaldo/To-Do-Extension', image: '/projects/archive-queuestack.webp', glow: '#22c3e6' },
  { name: 'Heimdall', stack: ['TypeScript', 'React', 'Ruby'], href: 'https://heimdall.yalochat.com/', image: '/projects/archive-heimdall.webp', glow: '#8b7cff' },
  { name: 'MERN Blog + AWS S3', stack: ['MongoDB', 'Express', 'Node.js', 'React', 'AWS S3'], href: 'https://github.com/arrivaldo/Blog-app', image: '/projects/archive-mernblog.webp', glow: '#4d7cff' },
  { name: 'webtemplate-js', stack: ['JavaScript', 'HTML', 'CSS'], href: 'https://www.npmjs.com/package/webtemplate-js', image: '/projects/archive-webtemplate.webp', glow: '#ff8a3d' },
  { name: 'notes.io', stack: ['MongoDB', 'Express', 'React', 'Node.js', 'JWT', 'bcrypt'], href: 'https://quicknotes-io.vercel.app/', image: '/projects/archive-notes.webp', glow: '#3ddc84' },
  { name: 'Docs-pi-app', stack: ['React', 'Tailwind CSS', 'Vite'], href: 'https://docs-pi-app.vercel.app/', image: '/projects/archive-docs.webp', glow: '#ff7ac8' },
  { name: 'Store management system', stack: ['C'], href: 'https://onlinegdb.com/OXOlVWJFj', image: '/projects/archive-store.webp', glow: '#22c3e6' },
  { name: 'Arkanoid', stack: ['Java'], href: 'https://github.com/arrivaldo/Java-Arkanoid', image: '/projects/archive-arkanoid.webp', glow: '#ffb020' },
  { name: 'ScreenRec.io', stack: ['JavaScript', 'HTML', 'CSS'], href: 'https://screen-recorder-apk.vercel.app/', image: '/projects/archive-screenrec.webp', glow: '#8b7cff' },
  { name: 'Convert.io', stack: ['React', 'Next.js', 'Shadcn/ui', 'ffmpeg'], href: 'https://convertio-file.vercel.app/', image: '/projects/archive-convertio.webp', glow: '#7ef0ff' },
  { name: 'Threefolio', stack: ['JavaScript', 'Three.js', 'GSAP'], href: 'https://threefolio.vercel.app/', image: '/projects/archive-threefolio.webp', glow: '#c86cff' },
  // Same Chrome Web Store listing as the featured AI Email Reply Extension.
  { name: 'Reply.io', stack: ['Java', 'Spring Boot', 'JavaScript'], href: 'https://chromewebstore.google.com/detail/email-writer-assistant/bkpahmihgmehmppafbnmonmagfohckno', image: '/projects/archive-reply.webp', glow: '#4d7cff' },
  // Moved down from the featured projects; listed first in the archive.
  { name: 'Full Stack Blog App', stack: ['Next.js', 'React', 'GraphQL'], href: 'https://code-toast-blog.vercel.app/', image: '/projects/archive-blog.webp', glow: '#4d7cff' },
  { name: 'Real Artist Personal Website', stack: ['React', 'Vite', 'Tailwind'], href: 'https://nedelka.vercel.app/', image: '/projects/archive-artist.webp', glow: '#ff7ac8' },
  { name: 'Software Agency App', stack: ['React', 'TypeScript', 'Next.js'], href: 'https://rodri-labs.vercel.app/', image: '/projects/agency.webp', glow: '#ff8a3d' },
  { name: 'Popular en Línea', stack: ['React', 'C#', '.NET', 'SQL Server', 'SharePoint'], href: 'https://popularenlinea.com/personas/Paginas/Home.aspx', image: '/projects/archive-popular.webp', glow: '#4d7cff' },
  // The previous version of this site, kept live on its own domain since v2 took engineerick-portfolio.vercel.app.
  { name: 'Portfolio v1', stack: ['Next.js', 'React', 'Tailwind CSS', 'Three.js', 'Framer Motion'], href: 'https://engineerick-v1.vercel.app/', image: '/projects/archive-portfolio-v1.webp', glow: '#1f7aff' },
]

/** DOM id of a company's row in Experience, so other sections can link to it. */
export const jobAnchor = (company: string) =>
  `job-${company.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

const jobsBase = [
  { company: 'Casa Médica', logo: '/companies/casa-medica.webp' },
  { company: 'Yalo.ai', logo: '/companies/yalo.webp' },
  { company: 'APESA Software', logo: '/companies/apesa.webp' },
  { company: 'Rules Cube', logo: '/companies/rules-cube.webp' },
  { company: 'Global Human Capital', logo: '/companies/global-hc.webp' },
  { company: 'NEORIS', logo: '/companies/neoris.webp' },
  { company: 'HSBC', logo: '/companies/hsbc.webp' },
]

const skillGroups = {
  Languages: ['JavaScript', 'TypeScript', 'Python', 'C', 'Lua', 'Java', 'C#', 'SQL', 'Go', 'Bash'],
  Frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'GSAP', 'Three.js', 'React Native'],
  Backend: ['Node.js', 'Express', '.NET', 'Django'],
  Cloud: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'Azure'],
  Databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQL Server'],
  QA: ['Playwright', 'Cypress', 'JMeter', 'Postman', 'Swagger', 'SonarQube'],
  DevOps: ['GitHub Actions', 'GitLab CI/CD', 'Jenkins'],
  AI: ['LLMs', 'MCP', 'n8n', 'OpenAI', 'Gemini', 'Prompt Engineering'],
  Business: ['Pega', 'Salesforce', 'SAP', 'Zendesk', 'ServiceNow'],
}

const skillItems = {
  software: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go', 'React', 'Next.js', 'React Native', 'Node.js', '.NET', 'Django'],
  quality: ['Playwright', 'Cypress', 'Selenium', 'Appium', 'Jest', 'JMeter', 'Postman', 'SonarQube'],
  automation: ['LLMs', 'MCP', 'RAG', 'OpenAI', 'Gemini', 'n8n', 'Make', 'Zapier', 'Webhooks', 'GitHub Actions', 'Apps Script'],
  cloud: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'SQL Server'],
}

const roleStacks = {
  software: ['TypeScript', 'React', 'Node.js', 'Python', 'Django', 'C#', '.NET', 'React Native', 'SQL', 'MongoDB', 'AWS', 'GCP', 'Java', 'Git'],
  automation: ['Python', 'TypeScript', 'GitHub Actions', 'Docker', 'AWS Lambda', 'EventBridge', 'Cloud Functions', 'n8n', 'Webhooks', 'RAG', 'MCP', 'Make', 'Zapier', 'Apps Script'],
  qa: ['Playwright', 'Cypress', 'Selenium', 'Postman', 'Jest', 'Appium', 'TDD', 'SonarQube', 'Swagger', 'JMeter', 'Cucumber'],
  business: ['Jira', 'Pega', 'Confluence', 'Notion', 'Scrum', 'Power BI'],
  product: ['SQL', 'Datadog', 'CloudWatch', 'Zendesk', 'ServiceNow', 'Bash', 'Docker', 'Postman', 'Linux', 'REST APIs'],
  mechatronics: ['C/C++', 'Python', 'CAD', 'PLC', 'Matlab', 'SolidWorks', 'Simulink', 'IoT', 'PID', 'Arduino', 'Raspberry Pi'],
}

const photos = {
  sam: '/people/sam.webp',
  madhu: '/people/madhu.webp',
  darwin: '/people/darwin.webp',
  aldo: '/people/aldo.webp',
  carlos: '/people/carlos.webp',
  juan: '/people/juan.webp',
  luis: '/people/luis.webp',
  manuel: '/people/manuel.webp',
  rulesCube: '/companies/rules-cube.webp',
}

const en: Content = {
  meta: {
    title: 'Erick Rodríguez Bárcena — Software & Automation Engineer',
    description: 'Mechatronic Engineer with 9+ years delivering software, automation and AI solutions across 22+ international projects.',
  },
  profile: {
    ...profile,
    role: [['Software', 'Automation', 'Quality', 'Solutions'], 'Engineer'],
    goal: "Hi, I'm Erick Bárcena, a México-based engineer solving complex challenges through *technology*, *automation*, and *innovation*.",
    intro: "Hello! I'm Erick, a *Mechatronic Engineer* building software, automating workflows and shipping AI agents.\n*9+ years* across *22+ international projects*.",
    quote: 'Engineering is less about what you know and more about what you can figure out.',
    status: 'Currently Automation Engineer at Casa Médica',
    years: '9+ years',
  },
  nav: [
    { label: 'Projects', href: '#projects' },
    { label: 'Services', href: '#process' },
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ],
  ui: {
    projects: 'Explore my work',
    loading: 'Loading',
    resume: 'Resume',
    menu: { open: 'Open menu', close: 'Close menu' },
    readMore: 'Open',
    readArticle: 'Open link',
    prevArticle: 'Previous',
    nextArticle: 'Next',
    aboutLabel: '... /About me ...',
    aboutTitle: 'About me',
    workLabel: '... /Experience ...',
    workTitle: 'Experience',
    workTotal: 'Work experience',
    brandsLabel: 'Trusted by teams at',
    brandsCount: (n) => `${n} global brands`,
    projectsLabel: '... /Recent projects ...',
    projectsTitle: 'Recent projects',
    projectsIntro: 'Products I *designed and built*, plus client work I *contributed to*.',
    aboutIntro: 'Driven by innovation. Based in *Mexico*, working with teams abroad.',
    processIntro: 'From software development to automation and production *solutions*.',
    workIntro: '*9+ years* building, automating and scaling solutions across diverse industries.',
    testimonialsIntro: "Words from people I've *collaborated* with along the way.",
    contactIntro: 'Have a project, a role or a question? *Write me* and I will get back to you.',
    archiveLabel: '... /Archive ...',
    archiveTitle: 'More projects',
    viewAll: 'All projects on GitHub',
    showMore: 'View more',
    showLess: 'View less',
    viewCase: 'View',
    clientWork: 'Client work',
    processLabel: '... /Services ...',
    processTitle: 'What I do',
    processProof: 'Proven in',
    testimonialsLabel: '... /Testimonials ...',
    testimonialsTitle: 'What they said about me',
    labLabel: '... /Beyond ...',
    lab: {
      bento: {
        title: 'Beyond the code',
        lead: 'Where I work from, what I am on right now and what drives me. *Drag the globe and the cube.*',
        globeTitle: 'México → the world',
        globeText: 'Remote-first, working with teams across time zones.',
        cubeTitle: 'What drives me',
        cubeText: 'Transforming ideas into *real-world*, impactful technology solutions.',
        spin: 'Spin the cube',
        spinLabel: 'Spin',
        loading: 'Loading 3D',
        timeTitle: 'Local time',
        day: 'daytime',
        night: 'night time',
        ahead: 'ahead of you',
        behind: 'behind you',
        same: 'same time as you',
        nowTitle: 'Right now',
        ghTitle: 'GitHub',
        ghText: 'personal contributions since',
        ghNote: 'Personal account only. My work for employers and clients lives in their private corporate GitHub accounts, so it does not show here.',
        ghError: 'GitHub is not answering right now.',
        askTitle: 'Ask my portfolio',
        askText: 'An AI assistant that knows my work. Pick a question or ask your own.',
        askOpen: 'Open the chat',
      },
    },
    contactLabel: '... /Contact ...',
    contactTitle: ["Let's work", 'together'],
    contactText: "I'm open to collaborating on new projects or just chatting about software, automation and technology.",
    contactCta: 'Get in touch',
    copy: 'Copy email',
    copied: 'Copied!',
    backToTop: 'Back to top',
    rights: 'All rights reserved',
    switchTo: (mode) => `Switch to ${mode} mode`,
    proof: { manual: 'Manual', withAi: 'With AI', live: 'Live', checking: 'Checking…', latency: (ms) => `responded in ${ms} ms`, median: 'median of live pings', saved: 'time saved' },
    story: { open: 'View case', problem: 'Problem', solution: 'Solution', result: 'Result', visit: 'Visit project', close: 'Close' },
    build: 'build passing',
    chat: {
      open: 'Ask my portfolio',
      hint: 'Ask it anything about my work',
      title: 'Ask me anything',
      intro: "Hi! I'm Erick's AI assistant, built with an LLM grounded in this portfolio. Ask about my experience, projects or stack.",
      placeholder: 'Type your question…',
      send: 'Send',
      close: 'Close chat',
      thinking: 'Thinking…',
      suggestions: ['What kind of automation do you build?', "What's your tech stack?", 'What industries have you worked in?'],
      errors: {
        busy: 'Lots of traffic right now, please try again in a moment.',
        offline: "The assistant isn't available right now. You can reach me through the contact form below.",
        generic: 'Something went wrong. Please try again.',
      },
    },
    form: {
      title: 'Or send me a message',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      send: 'Send message',
      sending: 'Sending…',
      sent: "Message sent ✓ I'll get back to you soon.",
      error: "It couldn't be sent. Please try again or write to me directly.",
    },
    pauseCarousel: 'Pause carousel',
    skip: 'Skip to content',
    playCarousel: 'Play carousel',
    themes: { dark: 'dark', light: 'light' },
  },
  stats: [
    { value: 9, suffix: '+', label: 'Years of experience' },
    { value: 22, suffix: '+', label: 'Professional projects' },
    { value: 32, suffix: '+', label: 'Clients' },
    { value: 16, suffix: '', label: 'Engineers trained and led' },
  ],
  projects: [
    { ...projectsBase[0], summary: 'Gmail extension that generates contextual and stylized replies using AI.', metric: { value: '~80%', label: 'less time per reply' }, story: { problem: 'Writing thoughtful replies by hand took a big share of every working day.', solution: 'A Gmail extension that reads the thread and drafts a contextual reply in the chosen tone, backed by a Spring Boot API that calls the LLM.', result: 'About 80% less time per reply, published on the Chrome Web Store.' } },
    { ...projectsBase[1], summary: 'Vehicle incident management system for operational control.', metric: { value: '30', label: 'active users' }, story: { problem: 'Vehicle incidents were tracked across spreadsheets and messages, with no single source of truth.', solution: 'A web app on React, Node.js and MongoDB to log, assign and follow up every incident with its status and history.', result: '30 active users running operational control on it.' } },
    { ...projectsBase[2], client: { via: 'Yalo.ai', role: 'Senior Product Engineer', period: '2025 – 2026' }, summary: 'Conversational and voice AI agents on WhatsApp and Messenger, plus the internal tooling behind them.', metric: { value: '20+', label: 'Enterprise clients supported' }, story: { problem: 'AI agents for 20+ clients ran on distributed services (AWS Lambda, Cloud Functions, webhooks) integrated with Salesforce, SAP and custom ERPs, and escalated incidents were solved by hand.', solution: 'I designed and maintained conversational and voice agents, fixed production services in Lua, TypeScript, Python and Go, and built AI self-service tools with MCP and LLMs plus internal automation such as Heimdall, Yalo’s Swiss Army Knife.', result: 'Faster incident resolution, fewer support tickets and stable integrations across Meta platforms.' } },
    { ...projectsBase[3], client: { via: 'Apesa Software', role: 'Lead Quality Automation Engineer', period: '2025' }, summary: 'Led the test automation strategy for SPEI and CETES financial products, built into GitLab CI/CD.', metric: { value: '12', label: 'engineers trained and led' }, story: { problem: 'Financial systems processing thousands of daily transactions were tested manually, with no automation in the release cycle.', solution: 'I designed the automation framework and testing plan for Angular, .NET and Blazor apps, wired it into GitLab CI/CD with reports and notifications, and added API and performance testing with Postman, Newman and JMeter.', result: 'SPEI and CETES automated within one quarter, and a 12-engineer team moved from manual testing to automation standards that outlived my tenure.' } },
    { ...projectsBase[4], client: { via: 'Rules Cube', role: 'Pega System Architect · QA Lead', period: '2021 – 2025' }, summary: 'Architected Pega applications and led end-to-end QA for a global reinsurer and its US life business.', metric: { value: '1000+', label: 'daily cases processed' }, story: { problem: 'A multinational insurer needed its health and US life reinsurance products on Pega, with strict compliance and quality across dev, staging and production.', solution: 'I architected Pega case management with center-out business architecture, migrated data with ETL and led QA: test plans, automated and manual testing, Scrum and DevOps practices.', result: 'Health and US life products went live on Pega handling 1,000+ cases a day, with zero data issues after migration, fewer defects with every compliant release, and contract renewals for the consultancy.' } },
    { ...projectsBase[5], client: { via: 'Global Human Capital', role: 'Front-End Software Engineer', period: '2020' }, summary: 'Responsive, data-driven landing pages for a large product suite, hand-coded before AI was a thing.', metric: { value: '25', label: 'landing pages delivered' }, story: { problem: 'A large product suite needed many landing pages released fast, pixel-perfect and with live data, all written by hand, back when AI coding tools did not exist yet.', solution: 'I built responsive pages in JSP and JavaScript fed by APIs, integrated with Laravel, with code splitting, lazy loading and SEO best practices.', result: '25 pixel-perfect landing pages in production, faster load times from code splitting and lazy loading, turning the landing pages into the primary acquisition channel for the product suite.' } },
  ],
  archive: [
    { ...archiveBase[12], tagline: 'Tech blog', description: 'Platform to publish and share technical articles.', story: { problem: 'I wanted my own place to publish and share technical posts.', solution: 'A full-stack blog with a React front end and a GraphQL API for posts, authors and tags.', result: 'Live on Vercel, with articles such as the REST vs. GraphQL and Closures guides.' } },
    { ...archiveBase[13], tagline: 'Artist website', description: "Personal website that brings an artist's music and acting career together in one place.", story: { problem: "The artist's music and acting work was scattered across social networks and platforms, with no single link to share with producers, casting directors or fans.", solution: 'A fast React + Vite site styled with Tailwind, organized around the work itself: music, acting, media and a direct contact path.', result: "Live as the artist's professional showcase: one link that sums up the whole career." } },
    { ...archiveBase[14], tagline: 'Agency web app', description: 'Agency website built to win clients: clear services, showcased work and a direct path to contact.', story: { problem: 'A software agency was pitching to clients without a website to back it up: no clear view of what it offered or proof of what it had built.', solution: 'A Next.js + TypeScript app that answers what a prospect asks first: what the agency does, what it has shipped and how to reach it, wrapped in a distinctive visual identity.', result: "Live as the agency's main website and the first link it sends to prospects." } },
    { ...archiveBase[15], tagline: 'Banking · via NEORIS', description: 'Online banking web app for a large financial institution.', story: { problem: 'A large bank needed steady releases on its web platform plus fixes for complex server-side defects.', solution: 'I built reusable components in React and TypeScript, fixed C# server-side issues (email delivery, data processing, edge cases) and optimized SQL Server queries.', result: 'More reliable releases and fewer data inconsistencies on the platform.' } },
    { ...archiveBase[8], tagline: 'Free screen recorder', description: 'A screen recorder web app for anyone who does not want to pay for an online one.', story: { problem: 'Online screen recorders hide basic recording behind paywalls, watermarks or sign-ups.', solution: 'A screen recorder that runs entirely in the browser, built with plain JavaScript, HTML and CSS.', result: 'A free utility, live on Vercel, for anyone who needs to record their screen.' } },
    { ...archiveBase[9], tagline: 'Media converter', description: 'Converts images, audio and video in the browser, for free and without restrictions.', story: { problem: 'Converting media usually means uploading files to sites full of limits, ads or paywalls.', solution: 'An online converter for images, audio and video, built with Next.js and Shadcn/ui on top of ffmpeg.', result: 'Free media conversion without restrictions, live on Vercel.' } },
    { ...archiveBase[0], tagline: 'VS Code extension', description: 'A to-do extension for Visual Studio Code to manage coding tasks, available in the marketplace.', story: { problem: 'Small coding tasks lived in notes outside the editor and kept getting lost.', solution: 'A Visual Studio Code extension that keeps a to-do list right inside the editor, next to the code.', result: 'Published in the VS Code marketplace, with setup instructions on GitHub.' } },
    { ...archiveBase[1], tagline: "Yalo's Swiss Army", description: 'Internal tool used by the support team to automate processes and execute API requests.', story: { problem: 'Yalo\'s support team ran repetitive processes and API requests by hand, one ticket at a time.', solution: 'An internal tool in TypeScript, React and Ruby that automates those processes and runs the API requests from one place.', result: 'I created and maintained it as the support team\'s everyday "Swiss Army knife".' } },
    { ...archiveBase[2], tagline: 'Full-stack blog', description: 'MERN blog with CRUD operations and AWS S3 storage.', story: { problem: 'I wanted a blog with real file storage, not just uploads saved on the server.', solution: 'A MERN blog with full CRUD for posts and images stored in AWS S3.', result: 'Source code on GitHub; deployment is pending.' } },
    { ...archiveBase[10], tagline: 'Three.js canvas', description: 'An interactive Three.js plane animated with GSAP, built as a dynamic hero component.', story: { problem: 'A static hero section rarely makes a strong first impression.', solution: 'An interactive Three.js plane animated with GSAP that reacts as you use it.', result: 'A dynamic hero component, live on Vercel.' } },
    { ...archiveBase[11], tagline: 'AI email replier', description: 'Generates personalized email replies with AI, in different conversation tones.', story: { problem: 'Writing a good reply takes time, and getting the tone right takes even longer.', solution: 'A Spring Boot backend with a JavaScript client that generates personalized email replies with AI, in different tones.', result: 'The engine behind my AI email assistant, published on the Chrome Web Store.' } },
    { ...archiveBase[3], tagline: 'NPM package', description: 'Customizable web template generator that gives a clean starting point for web apps.', story: { problem: 'Every new web project started by rewriting the same boilerplate.', solution: 'An npm package that generates a clean, customizable web template to start from.', result: 'Published on npm, ready to install.' } },
    { ...archiveBase[16], tagline: 'Previous portfolio', description: 'The first version of this portfolio: a Next.js site with a 3D hero, an AI chat assistant and a project gallery.', story: { problem: 'I needed one place to show recruiters and clients my work, experience and services.', solution: 'A Next.js and Tailwind site with three.js scenes, Framer Motion animations and a Gemini-powered chat that answers questions about my profile.', result: 'It became the base this portfolio grew from, and it stays live as an archive.' } },
    { ...archiveBase[4], tagline: 'Full-stack MERN app', description: 'Notes app with CRUD operations and built-in authentication.', story: { problem: 'I wanted to build a full-stack app with real authentication, end to end.', solution: 'A MERN notes app with CRUD operations and authentication built on JWT and bcrypt.', result: 'Live on Vercel.' } },
    { ...archiveBase[5], tagline: 'Documentation library', description: 'Stores web resources such as technology documentation, assets and tools.', story: { problem: 'Documentation, assets and tools I use were scattered across bookmarks and tabs.', solution: 'A documentation library in React, Vite and Tailwind that keeps those resources organized in one place.', result: 'Live on Vercel as my day-to-day reference.' } },
    { ...archiveBase[6], tagline: 'Written in C', description: "School project that simulates a store's internal system.", story: { problem: 'A school programming project: simulate a store\'s internal system.', solution: 'A program written in C that models the store\'s internal operations.', result: 'Runnable online on OnlineGDB.' } },
    { ...archiveBase[7], tagline: 'Game in Java', description: 'An Arkanoid game built to explore the Java language.', story: { problem: 'I wanted to learn Java by building something real, not just following exercises.', solution: 'An Arkanoid game written in Java, with the classic paddle, ball and bricks.', result: 'Source code on GitHub.' } },
  ],
  articles: [
    {
      id: 1,
      title: 'REST vs. GraphQL: Which is Right for Your Project?',
      description: 'The differences between REST and GraphQL, to help you decide which one fits your project.',
      href: 'https://code-toast-blog.vercel.app/post/api',
      tag: 'Article',
      meta: 'Sep 13, 2024',
    },
    {
      id: 2,
      title: 'ScreenRec.io — Free screen recorder',
      description: 'A screen recorder web app for anyone who does not want to pay for an online recorder.',
      href: 'https://screen-recorder-apk.vercel.app/',
      tag: 'Product',
      meta: 'Live',
    },
    {
      id: 3,
      title: 'Convert.io — Free media conversion',
      description: 'Transform images, audio and video files effortlessly, without restrictions. Built with Next.js and ffmpeg.',
      href: 'https://convertio-file.vercel.app/',
      tag: 'Product',
      meta: 'Live',
    },
    {
      id: 4,
      title: 'Software Agency App',
      description: 'Agency website built to win clients: clear services, showcased work and a direct path to contact, in a fast Next.js and TypeScript app.',
      href: 'https://rodri-labs.vercel.app/',
      tag: 'Product',
      meta: 'Live',
    },
    {
      id: 5,
      title: 'JavaScript Closures: Explanation with Examples',
      description: 'What a closure is, how it keeps access to its lexical scope, and where it is useful in everyday code.',
      href: 'https://code-toast-blog.vercel.app/post/closure',
      tag: 'Article',
      meta: 'Sep 13, 2024',
    },
  ],
  skills: [
    { id: 'frontend', title: 'Software', items: skillItems.software },
    { id: 'styles', title: 'Quality', items: skillItems.quality },
    { id: 'backend', title: 'AI & Automation', items: skillItems.automation },
    { id: 'devops', title: 'Cloud & Data', items: skillItems.cloud },
  ],
  skillGroups,
  jobs: [
    { ...jobsBase[0], period: '2026 — Present', role: 'Automation Engineer', highlights: ['Built AI-powered agents for customer engagement and automation.', 'Automated business workflows using APIs, webhooks and system integrations.', 'Developed WhatsApp solutions using Meta Business API and e-commerce integrations.'] },
    { ...jobsBase[1], period: 'Jun 2025 — 2026', role: 'Senior Product Support Engineer', highlights: ['Supported AI-powered solutions for 20+ international clients.', 'Built automation tools to streamline support operations.', 'Resolved L2/L3 production issues across APIs, cloud services and code.'] },
    { ...jobsBase[2], period: 'Feb — May 2025', role: 'QA Automation Lead', highlights: ['Led a team of 12 QA engineers across financial applications.', 'Built Playwright frameworks integrated with GitLab CI/CD.', 'Automated critical testing for SPEI, CETES and IAM systems.'] },
    { ...jobsBase[3], period: 'Jan 2021 — Feb 2025', role: 'QA Lead / Pega System Architect', highlights: ['Delivered enterprise solutions across five Pega projects.', 'Worked on applications processing 1,000+ cases daily.', 'Led QA initiatives across banking, insurance and supply chain.'] },
    { ...jobsBase[4], period: '2020 — 2021', role: 'Front-End Developer', highlights: ['Developed 20+ responsive landing pages.', 'Built reusable frontend components and integrations.', 'Improved usability, performance and cross-browser compatibility.'] },
    { ...jobsBase[5], period: '2019 — 2020', role: 'Full-Stack Engineer', highlights: ['Built enterprise applications with React and TypeScript.', 'Developed backend functionality using C# and SQL Server.', 'Worked with Azure and SharePoint environments.'] },
    { ...jobsBase[6], period: '2018 — 2019', role: 'MIS Solutions Engineer', highlights: ['Developed solutions for financial data processing.', 'Automated reporting workflows using VBA, SQL and Power BI.', 'Supported internal systems and banking operations.'] },
  ],
  education: [
    "Master's in Business Management & Quality Engineering (in progress)",
    'Postgraduate Diploma in Manufacturing & Quality',
    "Bachelor's in Mechatronic Engineering",
  ],
  certifications: ['ISTQB Foundation', 'Pega System Architect', 'Pega Business Architect', 'Harvard CS50 (ongoing)', 'Certified JavaScript Developer', 'Certified React Developer'],
  process: [
    { title: 'Software Engineering', text: 'Building scalable applications, APIs and cloud-based solutions, from frontend experiences to backend systems.' },
    { title: 'AI & Automation', text: 'Developing AI agents, intelligent workflows and integrations that automate processes and connect systems.' },
    { title: 'Solutions Engineering', text: 'Bridging business needs and technical execution through solution design, integrations and architecture.' },
    { title: 'Quality Engineering', text: 'Building automated testing frameworks and strategies to improve software quality, reliability and delivery.' },
    { title: 'Product Engineering', text: 'Diagnosing complex production issues, tracing root causes and delivering fixes across applications, APIs and cloud services.' },
    { title: 'Business Architecture', text: 'Translating business requirements into technical solutions by defining processes, workflows and system capabilities.' },
  ],
  roles: [
    { slug: 'software-engineer', title: 'Software Engineer', stack: roleStacks.software, signal: '9 years building', description: 'I build and ship software across the full product lifecycle — from architecture and APIs to frontend, backend and production deployment.' },
    { slug: 'automation-engineer', title: 'Automation Engineer', stack: roleStacks.automation, signal: 'Repetitive workflows turned into production-ready automations', description: 'I automate workflows and engineering processes through scripts, integrations and pipelines that reduce manual work and improve efficiency.' },
    { slug: 'qa-engineer', title: 'Quality Assurance', stack: roleStacks.qa, signal: 'QA Lead owning quality and automation from planning through production', description: 'Quality strategy and test automation across UI, APIs and end-to-end flows.' },
    { slug: 'business-architect', title: 'Business Architect', stack: roleStacks.business, signal: 'Business needs translated into clear paths to execution', description: 'I turn business goals into actionable solutions by mapping processes, defining requirements and aligning stakeholders with technical teams.' },
    { slug: 'product-engineer', title: 'Senior Product Engineer', stack: roleStacks.product, signal: 'L2/L3 ownership from escalation to root cause and resolution', description: 'I troubleshoot complex production issues across code, APIs, integrations and cloud services, tracing failures to root cause and implementing fixes.' },
    { slug: 'mechatronics-engineer', title: 'Mechatronics Engineer', stack: roleStacks.mechatronics, signal: 'Engineering across software, electronics and physical systems', description: 'I connect software, electronics and mechanical systems to build automated solutions through control, sensing and intelligent hardware.' },
  ],
  testimonials: [
    { quote: "Erick joined Casa Médica to automate our processes and he's delivering: he connected our WhatsApp channels to conversational agents, which increased our conversion rate and reduced our response time to customers. He has been invaluable to our growth.", name: 'Manuel Centeno', role: 'CEO, Casa Médica', photo: photos.manuel },
    { quote: 'Erick performed QA activities for an upgrade project of the Pega platform with a smooth, successful result. He took initiative to quickly understand the client application, creating test cases and executing them.', name: 'Sam Gharnagh', role: 'Vice President', photo: photos.sam },
    { quote: 'His meticulous attention to detail, strong analytical skills and dedication to product quality were evident in every project. Erick is a valuable asset to any team.', name: 'Madhu Chalamaiah', role: 'Lead Developer', photo: photos.madhu },
    { quote: "One of Erick's standout strengths is his ability to leverage AI to solve problems and improve processes. He strengthened the support tools our team relies on every day.", name: 'Aldo Galleoti', role: 'Customer Service Lead', photo: photos.aldo },
    { quote: 'His dedication to product quality, keen eye for detail and proactive approach consistently elevated the team’s performance.', name: 'Carlos Ortíz Sánchez', role: 'Technology Director, Apesa Software', photo: photos.carlos },
    { quote: 'He got direct exposure to the client and was able to interact with them. The client liked his work and he helped them whenever they needed it.', name: 'Darwin Batres', role: 'Lead Developer', photo: photos.darwin },
    { quote: 'A tremendous professional who is always looking for solutions. We carried out projects that changed the way the organization operates.', name: 'Juan Orozco', role: 'GTM in Latam', photo: photos.juan },
    { quote: 'He proved to be a valuable asset for any project, taking part in every aspect of it, including frontend and backend development.', name: 'Luis Cuestas', role: 'Lead Developer', photo: photos.luis },
    { quote: 'Strong technical skills and a significant commitment to his responsibilities. His ability to tackle complex challenges contributed significantly to the success of our projects.', name: 'Rules Cube', role: 'Company', photo: photos.rulesCube },
  ],
  now: [
    { label: 'Building', text: 'Automation at Casa Médica.' },
    { label: 'Exploring', text: 'PhD opportunities in Engineering and Technology.' },
    { label: 'Learning', text: 'AWS Certified Solutions Architect – Associate.' },
  ],
}

const es: Content = {
  meta: {
    title: 'Erick Rodríguez Bárcena — Software & Automation Engineer',
    description: 'Ingeniero Mecatrónico con más de 9 años entregando soluciones de software, automatización e IA en más de 22 proyectos internacionales.',
  },
  profile: {
    ...profile,
    role: [['Software', 'Automation', 'Quality', 'Solutions'], 'Engineer'],
    goal: 'Hola, soy Erick Bárcena, ingeniero en México que resuelve retos complejos con *tecnología*, *automatización* e *innovación*.',
    intro: '¡Hola! Soy Erick, *Ingeniero Mecatrónico* que construye software, automatiza procesos y lleva agentes de IA a producción.\n*Más de 9 años* en *más de 22 proyectos internacionales*.',
    quote: 'La ingeniería trata menos de lo que sabes y más de lo que eres capaz de resolver.',
    status: 'Actualmente Automation Engineer en Casa Médica',
    years: 'Más de 9 años',
  },
  nav: [
    { label: 'Proyectos', href: '#projects' },
    { label: 'Servicios', href: '#process' },
    { label: 'Sobre mí', href: '#about' },
    { label: 'Experiencia', href: '#experience' },
    { label: 'Contacto', href: '#contact' },
  ],
  ui: {
    projects: 'Ver mi trabajo',
    loading: 'Cargando',
    resume: 'CV',
    menu: { open: 'Abrir menú', close: 'Cerrar menú' },
    readMore: 'Abrir',
    readArticle: 'Abrir enlace',
    prevArticle: 'Anterior',
    nextArticle: 'Siguiente',
    aboutLabel: '... /Sobre mí ...',
    aboutTitle: 'Sobre mí',
    workLabel: '... /Experiencia ...',
    workTitle: 'Experiencia',
    workTotal: 'Experiencia laboral',
    brandsLabel: 'Equipos con los que he trabajado',
    brandsCount: (n) => `${n} marcas globales`,
    projectsLabel: '... /Proyectos recientes ...',
    projectsTitle: 'Proyectos recientes',
    projectsIntro: 'Productos que *diseñé y construí*, y proyectos profesionales en los que *colaboré*.',
    aboutIntro: 'Impulsado por la innovación. Desde *México*, con equipos en el extranjero.',
    processIntro: 'Del desarrollo de software a la automatización y *soluciones* en producción.',
    workIntro: '*Más de 9 años* construyendo, automatizando y escalando soluciones en industrias diversas.',
    testimonialsIntro: 'Palabras de personas con las que he *colaborado* en el camino.',
    contactIntro: '¿Un proyecto, un puesto o una duda? *Escríbeme* y te respondo.',
    archiveLabel: '... /Archivo ...',
    archiveTitle: 'Más proyectos',
    viewAll: 'Todos los proyectos en GitHub',
    showMore: 'Ver más',
    showLess: 'Ver menos',
    viewCase: 'Ver',
    clientWork: 'Proyecto de cliente',
    processLabel: '... /Servicios ...',
    processTitle: 'Lo que hago',
    processProof: 'Aplicado en',
    testimonialsLabel: '... /Testimonios ...',
    testimonialsTitle: 'Lo que dicen de mí',
    labLabel: '... /Beyond ...',
    lab: {
      bento: {
        title: 'Más allá del código',
        lead: 'Desde dónde trabajo, en qué estoy ahora y qué me impulsa. *Arrastra el globo y el cubo.*',
        globeTitle: 'México → el mundo',
        globeText: 'Trabajo remoto, con equipos en distintas zonas horarias.',
        cubeTitle: 'Lo que me impulsa',
        cubeText: 'Transformar ideas en soluciones tecnológicas de impacto en el *mundo real*.',
        spin: 'Girar el cubo',
        spinLabel: 'Rotar',
        loading: 'Cargando 3D',
        timeTitle: 'Hora local',
        day: 'de día',
        night: 'de noche',
        ahead: 'adelante de ti',
        behind: 'detrás de ti',
        same: 'misma hora que tú',
        nowTitle: 'Ahora mismo',
        ghTitle: 'GitHub',
        ghText: 'contribuciones personales desde',
        ghNote: 'Solo mi cuenta personal. El trabajo para empresas y clientes vive en sus cuentas corporativas privadas de GitHub, por eso no aparece aquí.',
        ghError: 'GitHub no responde en este momento.',
        askTitle: 'Pregúntale a mi portafolio',
        askText: 'Un asistente de IA que conoce mi trabajo. Elige una pregunta o haz la tuya.',
        askOpen: 'Abrir el chat',
      },
    },
    contactLabel: '... /Contacto ...',
    contactTitle: ['Trabajemos', 'juntos'],
    contactText: 'Estoy abierto a colaborar en nuevos proyectos o simplemente a conversar sobre software, automatización y tecnología.',
    contactCta: 'Escríbeme',
    copy: 'Copiar email',
    copied: '¡Copiado!',
    backToTop: 'Volver arriba',
    rights: 'Todos los derechos reservados',
    switchTo: (mode) => `Cambiar a modo ${mode}`,
    proof: { manual: 'Manual', withAi: 'Con IA', live: 'En línea', checking: 'Verificando…', latency: (ms) => `respondió en ${ms} ms`, median: 'mediana de pings en vivo', saved: 'tiempo ahorrado' },
    story: { open: 'Ver caso', problem: 'Problema', solution: 'Solución', result: 'Resultado', visit: 'Visitar proyecto', close: 'Cerrar' },
    build: 'build exitoso',
    chat: {
      open: 'Pregúntale a mi portafolio',
      hint: 'Pregúntale lo que sea sobre mi trabajo',
      title: 'Pregúntame lo que quieras',
      intro: '¡Hola! Soy el asistente de IA de Erick, un LLM alimentado con este portafolio. Pregúntame por mi experiencia, proyectos o stack.',
      placeholder: 'Escribe tu pregunta…',
      send: 'Enviar',
      close: 'Cerrar chat',
      thinking: 'Pensando…',
      suggestions: ['¿Qué tipo de automatizaciones construyes?', '¿Cuál es tu stack tecnológico?', '¿En qué industrias has trabajado?'],
      errors: {
        busy: 'Hay mucho tráfico en este momento, intenta de nuevo en un rato.',
        offline: 'El asistente no está disponible ahora. Puedes escribirme con el formulario de contacto.',
        generic: 'Algo salió mal. Intenta de nuevo.',
      },
    },
    form: {
      title: 'O envíame un mensaje',
      name: 'Nombre',
      email: 'Correo',
      subject: 'Asunto',
      message: 'Mensaje',
      send: 'Enviar mensaje',
      sending: 'Enviando…',
      sent: 'Mensaje enviado ✓ Te respondo pronto.',
      error: 'No se pudo enviar. Intenta de nuevo o escríbeme directo.',
    },
    pauseCarousel: 'Pausar carrusel',
    skip: 'Saltar al contenido',
    playCarousel: 'Reanudar carrusel',
    themes: { dark: 'oscuro', light: 'claro' },
  },
  stats: [
    { value: 9, suffix: '+', label: 'Años de experiencia' },
    { value: 22, suffix: '+', label: 'Proyectos profesionales' },
    { value: 32, suffix: '+', label: 'Clientes' },
    { value: 16, suffix: '', label: 'Ingenieros formados y liderados' },
  ],
  projects: [
    { ...projectsBase[0], summary: 'Extensión de Gmail que genera respuestas contextuales y con estilo usando IA.', metric: { value: '~80%', label: 'menos tiempo por respuesta' }, story: { problem: 'Escribir respuestas cuidadas a mano se llevaba buena parte de cada jornada.', solution: 'Una extensión de Gmail que lee el hilo y redacta una respuesta contextual en el tono elegido, con una API en Spring Boot que llama al LLM.', result: 'Cerca de 80% menos tiempo por respuesta; publicada en la Chrome Web Store.' } },
    { ...projectsBase[1], summary: 'Sistema de gestión de incidentes vehiculares para control operativo.', metric: { value: '30', label: 'usuarios activos' }, story: { problem: 'Los incidentes vehiculares vivían en hojas de cálculo y mensajes, sin una fuente única de verdad.', solution: 'Una app web en React, Node.js y MongoDB para registrar, asignar y dar seguimiento a cada incidente con su estado e historial.', result: '30 usuarios activos llevan el control operativo en ella.' } },
    { ...projectsBase[2], client: { via: 'Yalo.ai', role: 'Senior Product Engineer', period: '2025 – 2026' }, summary: 'Agentes de IA conversacional y de voz en WhatsApp y Messenger, y las herramientas internas detrás de ellos.', metric: { value: '20+', label: 'clientes internacionales' }, story: { problem: 'Los agentes de IA de más de 20 clientes corrían sobre servicios distribuidos (AWS Lambda, Cloud Functions, webhooks) integrados con Salesforce, SAP y ERPs propios, y los incidentes escalados se resolvían a mano.', solution: 'Diseñé y mantuve agentes conversacionales y de voz, corregí servicios en producción en Lua, TypeScript, Python y Go, y construí herramientas de autoservicio con MCP y LLMs, además de automatización interna como Heimdall.', result: 'Incidentes resueltos más rápido, menos tickets de soporte e integraciones estables en las plataformas de Meta.' } },
    { ...projectsBase[3], client: { via: 'Apesa Software', role: 'Lead Quality Automation Engineer', period: '2025' }, summary: 'Lideré la estrategia de automatización de pruebas para SPEI y CETES, integrada en GitLab CI/CD.', metric: { value: '12', label: 'ingenieros formados y liderados' }, story: { problem: 'Sistemas financieros con miles de transacciones diarias se probaban a mano, sin automatización en el ciclo de releases.', solution: 'Diseñé el framework de automatización y el plan de pruebas para apps en Angular, .NET y Blazor, lo integré en GitLab CI/CD con reportes y notificaciones, y sumé pruebas de API y rendimiento con Postman, Newman y JMeter.', result: 'SPEI y CETES automatizados en un trimestre, y un equipo de 12 ingenieros que pasó de pruebas manuales a estándares de automatización que siguieron después de mi salida.' } },
    { ...projectsBase[4], client: { via: 'Rules Cube', role: 'Pega System Architect · QA Lead', period: '2021 – 2025' }, summary: 'Diseñé la arquitectura de aplicaciones en Pega y lideré el QA de punta a punta para una reaseguradora global y su negocio de vida en EE. UU.', metric: { value: '1000+', label: 'casos procesados al día' }, story: { problem: 'Una aseguradora multinacional necesitaba sus productos de salud y de reaseguro de vida en EE. UU. sobre Pega, con cumplimiento y calidad estrictos en desarrollo, staging y producción.', solution: 'Diseñé la gestión de casos en Pega con arquitectura de negocio center-out, migré datos con ETL y lideré QA: planes de prueba, pruebas automatizadas y manuales, Scrum y prácticas DevOps.', result: 'Los productos de salud y de vida en EE. UU. salieron a producción en Pega procesando más de 1,000 casos al día, sin incidencias de datos tras la migración, con menos defectos en cada release en cumplimiento y renovaciones de contrato para la consultora.' } },
    { ...projectsBase[5], client: { via: 'Global Human Capital', role: 'Front-End Software Engineer', period: '2020' }, summary: 'Landing pages responsivas y con datos en vivo para una suite de productos grande, programadas a mano antes de que existiera la IA.', metric: { value: '25', label: 'landing pages entregadas' }, story: { problem: 'Una suite de productos grande necesitaba muchas landing pages, rápido, pixel-perfect y con datos en vivo, todo escrito a mano, cuando las herramientas de IA para programar aún no existían.', solution: 'Construí páginas responsivas en JSP y JavaScript alimentadas por APIs, integradas con Laravel, con code splitting, lazy loading y buenas prácticas de SEO.', result: '25 landing pages pixel-perfect en producción, tiempos de carga más rápidos gracias a code splitting y lazy loading, convirtiendo las landing pages en el principal canal de adquisición de la suite.' } },
  ],
  archive: [
    { ...archiveBase[12], tagline: 'Blog técnico', description: 'Plataforma para publicar y compartir artículos técnicos.', story: { problem: 'Quería un lugar propio para publicar y compartir artículos técnicos.', solution: 'Un blog full-stack con front en React y una API GraphQL para artículos, autores y etiquetas.', result: 'En línea en Vercel, con artículos como las guías de REST vs. GraphQL y Closures.' } },
    { ...archiveBase[13], tagline: 'Sitio de artista', description: 'Sitio personal que reúne en un solo lugar la carrera musical y actoral de una artista.', story: { problem: 'La música y el trabajo actoral de la artista estaban dispersos entre redes sociales y plataformas, sin un solo enlace para compartir con productores, directores de casting o fans.', solution: 'Un sitio rápido en React + Vite con Tailwind, organizado alrededor de la obra: música, actuación, medios y un camino directo al contacto.', result: 'En línea como la vitrina profesional de la artista: un solo enlace que resume toda su carrera.' } },
    { ...archiveBase[14], tagline: 'App de agencia', description: 'Sitio de una agencia de software pensado para conseguir clientes: servicios claros, trabajo destacado y un camino directo al contacto.', story: { problem: 'Una agencia de software salía a buscar clientes sin un sitio que la respaldara: no se veía con claridad qué ofrecía ni qué había construido.', solution: 'Una app en Next.js + TypeScript que responde lo primero que pregunta un prospecto: qué hace la agencia, qué ha entregado y cómo contactarla, con una identidad visual propia.', result: 'En línea como el sitio principal de la agencia y el primer enlace que comparte con sus prospectos.' } },
    { ...archiveBase[15], tagline: 'Banca · vía NEORIS', description: 'Banca en línea para una gran institución financiera.', story: { problem: 'Un banco grande necesitaba releases constantes en su plataforma web y corregir defectos complejos del lado del servidor.', solution: 'Construí componentes reutilizables en React y TypeScript, corregí problemas en C# (envío de correos, procesamiento de datos, casos límite) y optimicé consultas en SQL Server.', result: 'Releases más confiables y menos inconsistencias de datos en la plataforma.' } },
    { ...archiveBase[8], tagline: 'Grabador de pantalla gratis', description: 'App web para grabar la pantalla, para quien no quiere pagar por una herramienta en línea.', story: { problem: 'Los grabadores de pantalla en línea esconden lo básico detrás de pagos, marcas de agua o registros.', solution: 'Un grabador de pantalla que corre por completo en el navegador, hecho con JavaScript, HTML y CSS.', result: 'Una utilidad gratuita, en línea en Vercel, para quien necesite grabar su pantalla.' } },
    { ...archiveBase[9], tagline: 'Convertidor multimedia', description: 'Convierte imágenes, audio y video en el navegador, gratis y sin restricciones.', story: { problem: 'Convertir archivos suele implicar subirlos a sitios llenos de límites, anuncios o pagos.', solution: 'Un convertidor en línea de imágenes, audio y video, hecho con Next.js y Shadcn/ui sobre ffmpeg.', result: 'Conversión multimedia gratis y sin restricciones, en línea en Vercel.' } },
    { ...archiveBase[0], tagline: 'Extensión de VS Code', description: 'Extensión de tareas para Visual Studio Code, disponible en el marketplace.', story: { problem: 'Las tareas pequeñas de código vivían en notas fuera del editor y se perdían.', solution: 'Una extensión para Visual Studio Code que mantiene la lista de pendientes dentro del editor, junto al código.', result: 'Publicada en el marketplace de VS Code, con instrucciones en GitHub.' } },
    { ...archiveBase[1], tagline: 'La navaja suiza de Yalo', description: 'Herramienta interna del equipo de soporte para automatizar procesos y ejecutar requests a APIs.', story: { problem: 'El equipo de soporte de Yalo ejecutaba procesos repetitivos y requests a APIs a mano, ticket por ticket.', solution: 'Una herramienta interna en TypeScript, React y Ruby que automatiza esos procesos y ejecuta los requests desde un solo lugar.', result: 'La creé y la mantuve como la "navaja suiza" diaria del equipo de soporte.' } },
    { ...archiveBase[2], tagline: 'Blog full-stack', description: 'Blog MERN con operaciones CRUD y almacenamiento en AWS S3.', story: { problem: 'Quería un blog con almacenamiento real de archivos, no solo subidas guardadas en el servidor.', solution: 'Un blog MERN con CRUD completo para artículos e imágenes almacenadas en AWS S3.', result: 'Código en GitHub; el despliegue está pendiente.' } },
    { ...archiveBase[10], tagline: 'Canvas con Three.js', description: 'Un plano interactivo en Three.js animado con GSAP, pensado como componente hero.', story: { problem: 'Un hero estático rara vez deja una buena primera impresión.', solution: 'Un plano interactivo en Three.js animado con GSAP que reacciona mientras lo usas.', result: 'Un componente hero dinámico, en línea en Vercel.' } },
    { ...archiveBase[11], tagline: 'Respuestas de correo con IA', description: 'Genera respuestas de correo personalizadas con IA, en distintos tonos de conversación.', story: { problem: 'Escribir una buena respuesta toma tiempo, y acertar con el tono, todavía más.', solution: 'Un backend en Spring Boot con un cliente en JavaScript que genera respuestas de correo personalizadas con IA, en distintos tonos.', result: 'El motor detrás de mi asistente de correo con IA, publicado en la Chrome Web Store.' } },
    { ...archiveBase[3], tagline: 'Paquete de NPM', description: 'Generador de plantillas web personalizable como punto de partida para aplicaciones.', story: { problem: 'Cada proyecto web nuevo empezaba reescribiendo el mismo código base.', solution: 'Un paquete de npm que genera una plantilla web limpia y personalizable como punto de partida.', result: 'Publicado en npm, listo para instalar.' } },
    { ...archiveBase[16], tagline: 'Portafolio anterior', description: 'La primera versión de este portafolio: un sitio en Next.js con hero 3D, asistente de chat con IA y galería de proyectos.', story: { problem: 'Necesitaba un solo lugar para mostrar a reclutadores y clientes mi trabajo, experiencia y servicios.', solution: 'Un sitio en Next.js y Tailwind con escenas en three.js, animaciones con Framer Motion y un chat con Gemini que responde preguntas sobre mi perfil.', result: 'Fue la base de la que creció este portafolio y sigue en línea como archivo.' } },
    { ...archiveBase[4], tagline: 'App MERN full-stack', description: 'App de notas con CRUD y autenticación integrada.', story: { problem: 'Quería construir una app full-stack con autenticación real, de punta a punta.', solution: 'Una app de notas MERN con operaciones CRUD y autenticación con JWT y bcrypt.', result: 'En línea en Vercel.' } },
    { ...archiveBase[5], tagline: 'Biblioteca de documentación', description: 'Guarda recursos web como documentación técnica, assets y herramientas.', story: { problem: 'La documentación, assets y herramientas que uso estaban dispersos entre marcadores y pestañas.', solution: 'Una biblioteca de documentación en React, Vite y Tailwind que organiza esos recursos en un solo lugar.', result: 'En línea en Vercel como mi referencia del día a día.' } },
    { ...archiveBase[6], tagline: 'Hecho en C', description: 'Proyecto escolar que simula el sistema interno de una tienda.', story: { problem: 'Un proyecto escolar de programación: simular el sistema interno de una tienda.', solution: 'Un programa escrito en C que modela las operaciones internas de la tienda.', result: 'Se puede ejecutar en línea en OnlineGDB.' } },
    { ...archiveBase[7], tagline: 'Juego en Java', description: 'Un Arkanoid construido para explorar el lenguaje Java.', story: { problem: 'Quería aprender Java construyendo algo real, no solo haciendo ejercicios.', solution: 'Un juego Arkanoid en Java, con la clásica paleta, pelota y ladrillos.', result: 'Código en GitHub.' } },
  ],
  articles: [
    {
      id: 1,
      title: 'REST vs. GraphQL: ¿cuál es el adecuado para tu proyecto?',
      description: 'Las diferencias entre REST y GraphQL, para ayudarte a decidir cuál conviene a tu proyecto.',
      href: 'https://code-toast-blog.vercel.app/post/api',
      tag: 'Artículo',
      meta: '13 sep 2024',
    },
    {
      id: 2,
      title: 'ScreenRec.io — Grabador de pantalla gratis',
      description: 'App web para grabar la pantalla sin pagar por un grabador en línea.',
      href: 'https://screen-recorder-apk.vercel.app/',
      tag: 'Producto',
      meta: 'Live',
    },
    {
      id: 3,
      title: 'Convert.io — Conversión de medios gratis',
      description: 'Convierte imágenes, audio y video sin restricciones. Hecho con Next.js y ffmpeg.',
      href: 'https://convertio-file.vercel.app/',
      tag: 'Producto',
      meta: 'Live',
    },
    {
      id: 4,
      title: 'App de agencia de software',
      description: 'Sitio de una agencia de software pensado para conseguir clientes: servicios claros, trabajo destacado y un camino directo al contacto, en una app rápida con Next.js y TypeScript.',
      href: 'https://rodri-labs.vercel.app/',
      tag: 'Producto',
      meta: 'Live',
    },
    {
      id: 5,
      title: 'Closures en JavaScript: explicación simple con ejemplos',
      description: 'Qué es un closure, cómo conserva el acceso a su scope léxico y dónde sirve en el código del día a día.',
      href: 'https://code-toast-blog.vercel.app/post/closure',
      tag: 'Artículo',
      meta: '13 sep 2024',
    },
  ],
  skills: [
    { id: 'frontend', title: 'Software', items: skillItems.software },
    { id: 'styles', title: 'Calidad', items: skillItems.quality },
    { id: 'backend', title: 'IA y automatización', items: skillItems.automation },
    { id: 'devops', title: 'Cloud y datos', items: skillItems.cloud },
  ],
  skillGroups,
  jobs: [
    { ...jobsBase[0], period: '2026 — Hoy', role: 'Automation Engineer', highlights: ['Construí agentes con IA para atención y automatización con clientes.', 'Automaticé flujos de negocio con APIs, webhooks e integraciones entre sistemas.', 'Desarrollé soluciones de WhatsApp con Meta Business API e integraciones de e-commerce.'] },
    { ...jobsBase[1], period: 'Jun 2025 — 2026', role: 'Senior Product Support Engineer', highlights: ['Soporte a soluciones con IA para más de 20 clientes internacionales.', 'Construí herramientas de automatización para agilizar la operación de soporte.', 'Resolví incidencias L2/L3 en producción entre APIs, servicios cloud y código.'] },
    { ...jobsBase[2], period: 'Feb — May 2025', role: 'QA Automation Lead', highlights: ['Lideré un equipo de 12 ingenieros de QA en aplicaciones financieras.', 'Construí frameworks en Playwright integrados con GitLab CI/CD.', 'Automaticé pruebas críticas para los sistemas SPEI, CETES e IAM.'] },
    { ...jobsBase[3], period: 'Ene 2021 — Feb 2025', role: 'QA Lead / Pega System Architect', highlights: ['Entregué soluciones empresariales en cinco proyectos de Pega.', 'Trabajé en aplicaciones que procesan más de 1,000 casos diarios.', 'Lideré iniciativas de QA en banca, seguros y cadena de suministro.'] },
    { ...jobsBase[4], period: '2020 — 2021', role: 'Front-End Developer', highlights: ['Desarrollé más de 20 landing pages responsivas.', 'Construí componentes frontend reutilizables e integraciones.', 'Mejoré usabilidad, rendimiento y compatibilidad entre navegadores.'] },
    { ...jobsBase[5], period: '2019 — 2020', role: 'Full-Stack Engineer', highlights: ['Construí aplicaciones empresariales con React y TypeScript.', 'Desarrollé funcionalidad backend con C# y SQL Server.', 'Trabajé con entornos de Azure y SharePoint.'] },
    { ...jobsBase[6], period: '2018 — 2019', role: 'MIS Solutions Engineer', highlights: ['Desarrollé soluciones para el procesamiento de datos financieros.', 'Automaticé flujos de reportes con VBA, SQL y Power BI.', 'Soporte a sistemas internos y operaciones bancarias.'] },
  ],
  education: [
    'Maestría en Administración de Negocios e Ingeniería de Calidad (en curso)',
    'Diplomado en Manufactura y Calidad',
    'Ingeniería Mecatrónica',
  ],
  certifications: ['ISTQB Foundation', 'Pega System Architect', 'Pega Business Architect', 'Harvard CS50 (en curso)', 'Certified JavaScript Developer', 'Certified React Developer'],
  process: [
    { title: 'Ingeniería de software', text: 'Construyo aplicaciones escalables, APIs y soluciones en la nube, desde la experiencia frontend hasta los sistemas backend.' },
    { title: 'IA y automatización', text: 'Desarrollo agentes de IA, flujos inteligentes e integraciones que automatizan procesos y conectan sistemas.' },
    { title: 'Ingeniería de soluciones', text: 'Conecto las necesidades del negocio con la ejecución técnica mediante diseño de soluciones, integraciones y arquitectura.' },
    { title: 'Ingeniería de calidad', text: 'Construyo frameworks y estrategias de pruebas automatizadas que mejoran la calidad, confiabilidad y entrega del software.' },
    { title: 'Ingeniería de producto', text: 'Diagnostico problemas complejos en producción, rastreo la causa raíz y entrego correcciones en aplicaciones, APIs y servicios cloud.' },
    { title: 'Arquitectura de negocio', text: 'Traduzco requerimientos de negocio en soluciones técnicas definiendo procesos, flujos y capacidades del sistema.' },
  ],
  roles: [
    { slug: 'software-engineer', title: 'Software Engineer', stack: roleStacks.software, signal: '9 años construyendo', description: 'Construyo y llevo a producción software en todo el ciclo de vida: arquitectura, APIs, frontend, backend y despliegue.' },
    { slug: 'automation-engineer', title: 'Automation Engineer', stack: roleStacks.automation, signal: 'Flujos repetitivos convertidos en automatizaciones listas para producción', description: 'Automatizo flujos y procesos de ingeniería con scripts, integraciones y pipelines que reducen trabajo manual.' },
    { slug: 'qa-engineer', title: 'Quality Assurance', stack: roleStacks.qa, signal: 'QA Lead dueño de la calidad desde la planeación hasta producción', description: 'Estrategia de calidad y automatización de pruebas en UI, APIs y flujos end-to-end.' },
    { slug: 'business-architect', title: 'Business Architect', stack: roleStacks.business, signal: 'Necesidades de negocio convertidas en rutas claras de ejecución', description: 'Convierto objetivos de negocio en soluciones accionables: mapeo procesos, defino requerimientos y alineo a negocio con tecnología.' },
    { slug: 'product-engineer', title: 'Senior Product Engineer', stack: roleStacks.product, signal: 'Dueño de L2/L3 desde la escalación hasta la causa raíz', description: 'Resuelvo incidentes complejos de producción en código, APIs, integraciones y cloud, hasta la causa raíz.' },
    { slug: 'mechatronics-engineer', title: 'Mechatronics Engineer', stack: roleStacks.mechatronics, signal: 'Ingeniería entre software, electrónica y sistemas físicos', description: 'Conecto software, electrónica y mecánica para crear soluciones automatizadas con control, sensores y hardware inteligente.' },
  ],
  testimonials: [
    { quote: 'Erick llegó a Casa Médica para automatizar procesos y lo está logrando: integró nuestros canales de WhatsApp con agentes conversacionales, lo que aumentó nuestra tasa de conversión y redujo el tiempo de respuesta a nuestros clientes. Ha sido muy valioso para nuestro crecimiento.', name: 'Manuel Centeno', role: 'CEO, Casa Médica', photo: photos.manuel },
    { quote: 'Erick realizó QA para un proyecto de actualización de la plataforma Pega con un resultado exitoso. Tomó la iniciativa para entender rápido la aplicación del cliente, creando y ejecutando casos de prueba.', name: 'Sam Gharnagh', role: 'Vice President', photo: photos.sam },
    { quote: 'Su atención al detalle, su capacidad analítica y su compromiso con la calidad se notaron en cada proyecto. Erick es un activo valioso para cualquier equipo.', name: 'Madhu Chalamaiah', role: 'Lead Developer', photo: photos.madhu },
    { quote: 'Una de sus mayores fortalezas es usar IA para resolver problemas y mejorar procesos. Fortaleció las herramientas de soporte que nuestro equipo usa todos los días.', name: 'Aldo Galleoti', role: 'Customer Service Lead', photo: photos.aldo },
    { quote: 'Su compromiso con la calidad, su ojo para el detalle y su proactividad elevaron consistentemente el desempeño del equipo.', name: 'Carlos Ortíz Sánchez', role: 'Technology Director, Apesa Software', photo: photos.carlos },
    { quote: 'Tuvo exposición directa con el cliente y supo interactuar con él. Al cliente le gustó su trabajo y lo ayudó cada vez que lo necesitó.', name: 'Darwin Batres', role: 'Lead Developer', photo: photos.darwin },
    { quote: 'Un profesional tremendo que siempre busca soluciones. Hicimos proyectos que cambiaron la forma en que opera la organización.', name: 'Juan Orozco', role: 'GTM in Latam', photo: photos.juan },
    { quote: 'Demostró ser un activo valioso para cualquier proyecto; participó en todos sus aspectos, incluido el desarrollo frontend y backend.', name: 'Luis Cuestas', role: 'Lead Developer', photo: photos.luis },
    { quote: 'Sólidas habilidades técnicas y un gran compromiso con sus responsabilidades. Su capacidad para resolver retos complejos contribuyó al éxito de nuestros proyectos.', name: 'Rules Cube', role: 'Empresa', photo: photos.rulesCube },
  ],
  now: [
    { label: 'Construyendo', text: 'Automatización en Casa Médica.' },
    { label: 'Explorando', text: 'Oportunidades de doctorado en Ingeniería y Tecnología.' },
    { label: 'Aprendiendo', text: 'AWS Certified Solutions Architect – Associate.' },
  ],
}

export const content: Record<Lang, Content> = { en, es }
