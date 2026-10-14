// Content migrated from v1 (D:\Proyects\Portfolio_versions\v1\my_portfolio).

export type Lang = 'en' | 'es'
export type Social = { id: 'github' | 'linkedin' | 'whatsapp' | 'email'; label: string; href: string }
export type Brand = { name: string; logo: string; height: number; badge?: { logo: string; height: number } }
export type Article = { id: number; title: string; description: string; href: string; tag: string; meta: string }
export type Skill = { id: 'frontend' | 'styles' | 'backend' | 'devops'; title: string; items: string[] }
export type Job = { period: string; company: string; role: string; logo: string; highlights: string[] }
/** How a project's headline metric is demonstrated on screen. */
export type Proof = { kind: 'race'; before: number; after: number } | { kind: 'count'; to: number } | { kind: 'live' }
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
}
/** Smaller projects. `story` feeds the same case-study modal as the featured projects (drafted by Claude from the v1 descriptions — user to review). */
export type ArchiveProject = { name: string; tagline: string; description: string; stack: string[]; href: string; image: string; glow: string; story: { problem: string; solution: string; result: string } }
export type Stat = { value: number; prefix?: string; suffix?: string; decimals?: number; label: string }
export type Step = { title: string; text: string; tags: string[] }
export type Testimonial = { quote: string; name: string; role: string; photo?: string }
export type Role = { slug: string; title: string; description: string; stack: string[]; signal: string }
export type NowItem = { label: string; text: string }


/** One manual task raced against its automation in the Lab. Minutes/seconds/runs are illustrative. */
export type LabTask = { id: string; name: string; manual: string[]; auto: [string, string][]; manualMin: number; autoSec: number; runsPerMonth: number }
export type LabNeed = { id: string; label: string; role: string; stack: string[]; phases: [string, number][] }
export type LabStep = { tool: string; text: string; log: string }
export type LabCopy = {
  bento: { title: string; lead: string; globeTitle: string; globeText: string; cubeTitle: string; cubeText: string; timeTitle: string; day: string; night: string; ahead: string; behind: string; same: string; nowTitle: string; ghTitle: string; ghText: string; ghNote: string; ghError: string; askTitle: string; askText: string; askOpen: string }
  automate: { title: string; lead: string; manual: string; auto: string; run: string; again: string; saved: string; perMonth: string; note: string; tasks: LabTask[] }
  mission: { title: string; lead: string; live: string; activity: string; feed: string; languages: string; repos: string; lastPush: string; pushed: string; loading: string; error: string; open: string; ago: [string, string, string, string] }
  plan: { title: string; lead: string; ask: string; empty: string; plan: string; weeks: string; week: string; ongoing: string; stack: string; roles: string; cta: string; note: string; kickoff: string; handover: string; needs: LabNeed[] }
  incident: { title: string; lead: string; alert: string; resolved: string; replay: string; mttr: string; postmortem: string; post: [string, string][]; steps: LabStep[] }
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
    viewCase: string
    processLabel: string
    processTitle: string
    testimonialsLabel: string
    testimonialsTitle: string
    labLabel: string
    /** Lab demos (?lab=automate|mission|plan|incident). Copy and figures drafted by Claude — user to review. */
    lab: LabCopy
    contactLabel: string
    contactTitle: [string, string]
    contactText: string
    contactCta: string
    copy: string
    copied: string
    localTime: string
    backToTop: string
    rights: string
    switchTo: (mode: string) => string
    proof: { manual: string; withAi: string; live: string; checking: string; latency: (ms: number) => string }
    story: { open: string; problem: string; solution: string; result: string; visit: string; close: string }
    workflow: { title: string; caption: string; nodes: [string, string][] }
    services: {
      live: string
      gate: { suites: [string, string][]; passed: string }
      hub: { core: string; caption: string }
      /** Pipeline stage verbs, in the order Solutions → Software → QA → AI. */
      stages: string[]
      phases: string[]
      lead: string
      support: string
      spin: string
    }
    build: string
    chat: { open: string; title: string; intro: string; placeholder: string; send: string; close: string; thinking: string; suggestions: string[]; errors: { busy: string; offline: string; generic: string } }
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

export const socials: Social[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/arrivaldo' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/erickbarcena7/' },
  { id: 'whatsapp', label: 'WhatsApp', href: 'https://api.whatsapp.com/send?phone=525540779049' },
  { id: 'email', label: 'Email', href: 'mailto:erickbarcena00@gmail.com' },
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
  { id: 'ai-email', title: 'AI Email Reply Extension', stack: ['JavaScript', 'Spring Boot'], image: '/projects/ai-email.webp', glow: '#8b7cff', href: 'https://chromewebstore.google.com/detail/email-writer-assistant/bkpahmihgmehmppafbnmonmagfohckno', proof: { kind: 'race', before: 100, after: 60 } as Proof },
  { id: 'blog', title: 'Full Stack Blog App', stack: ['React', 'GraphQL'], image: '/projects/blog.webp', glow: '#4d7cff', href: 'https://code-toast-blog.vercel.app/', proof: { kind: 'count', to: 30 } as Proof },
  { id: 'incidents', title: 'Incidence Management App', stack: ['React', 'Node.js', 'MongoDB'], image: '/projects/incidents.webp', glow: '#22c3e6', href: 'https://cds-estafeta.vercel.app/', proof: { kind: 'count', to: 25 } as Proof },
  { id: 'artist', title: 'Real Artist Personal Website', stack: ['React', 'Vite', 'Tailwind'], image: '/projects/artist.webp', glow: '#ff7ac8', href: 'https://nedelka.vercel.app/', proof: { kind: 'live' } as Proof },
  { id: 'agency', title: 'Software Agency App', stack: ['React', 'TypeScript', 'Next.js'], image: '/projects/agency.webp', glow: '#ff8a3d', href: 'https://rodri-labs.vercel.app/', proof: { kind: 'live' } as Proof },
]

const archiveBase = [
  { name: 'QueueStack', stack: ['TypeScript', 'HTML', 'JavaScript'], href: 'https://github.com/arrivaldo/To-Do-Extension', image: '/projects/todoExtension.webp', glow: '#22c3e6' },
  { name: 'Heimdall', stack: ['TypeScript', 'React', 'Ruby'], href: 'https://heimdall.yalochat.com/', image: '/projects/heimdall.webp', glow: '#8b7cff' },
  { name: 'MERN Blog + AWS S3', stack: ['MongoDB', 'Express', 'Node.js', 'React'], href: 'https://github.com/arrivaldo/Blog-app', image: '/projects/MERNblog.webp', glow: '#4d7cff' },
  { name: 'webtemplate-js', stack: ['JavaScript', 'HTML', 'CSS'], href: 'https://www.npmjs.com/package/webtemplate-js', image: '/projects/webtemplate.webp', glow: '#ff8a3d' },
  { name: 'notes.io', stack: ['MongoDB', 'Express', 'React', 'Node.js', 'JWT', 'bcrypt'], href: 'https://quicknotes-io.vercel.app/', image: '/projects/notes.webp', glow: '#3ddc84' },
  { name: 'Docs-pi-app', stack: ['React', 'Tailwind CSS', 'Vite'], href: 'https://docs-pi-app.vercel.app/', image: '/projects/docs.webp', glow: '#ff7ac8' },
  { name: 'Store management system', stack: ['C'], href: 'https://onlinegdb.com/OXOlVWJFj', image: '/projects/StoreManagementSystem.webp', glow: '#22c3e6' },
  { name: 'Arkanoid', stack: ['Java'], href: 'https://github.com/arrivaldo/Java-Arkanoid', image: '/projects/arkanoid.webp', glow: '#ffb020' },
  { name: 'ScreenRec.io', stack: ['JavaScript', 'HTML', 'CSS'], href: 'https://screen-recorder-apk.vercel.app/', image: '/projects/screenRecorder.webp', glow: '#8b7cff' },
  { name: 'Convert.io', stack: ['React', 'Next.js', 'Shadcn/ui', 'ffmpeg'], href: 'https://convertio-file.vercel.app/', image: '/projects/convertio.webp', glow: '#7ef0ff' },
  { name: 'Threefolio', stack: ['JavaScript', 'Three.js', 'GSAP'], href: 'https://threefolio.vercel.app/', image: '/projects/threefolio.webp', glow: '#c86cff' },
  // v1 linked Reply.io to docs-pi-app by mistake; this is its Spring Boot repo on GitHub.
  { name: 'Reply.io', stack: ['Java', 'Spring Boot', 'JavaScript'], href: 'https://github.com/arrivaldo/email-writer-spring-boot', image: '/projects/emailWriter.webp', glow: '#4d7cff' },
]

const jobsBase = [
  { company: 'Casa Médica', logo: '/companies/casa-medica.webp' },
  { company: 'Yalo.ai', logo: '/companies/yalo.webp' },
  { company: 'Apesa Software', logo: '/companies/apesa.webp' },
  { company: 'Rules Cube', logo: '/companies/rules-cube.webp' },
  { company: 'Global Human Capital', logo: '/companies/global-hc.webp' },
  { company: 'Neoris', logo: '/companies/neoris.webp' },
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

const photos = { sam: '/people/sam.webp', madhu: '/people/madhu.webp', darwin: '/people/darwin.webp' }

const en: Content = {
  meta: {
    title: 'Erick Rodríguez Bárcena — Software & Automation Engineer',
    description: 'Mechatronic Engineer with 9+ years delivering software, automation and AI solutions across 22+ international projects.',
  },
  profile: {
    ...profile,
    role: [['Software', 'Automation', 'Quality', 'Solutions'], 'Engineer'],
    goal: 'Mechatronic Engineer with experience in *Software Development*, *QA Engineering* and *Automation*.',
    intro: "Hello! I'm Erick, a *Mechatronic Engineer* building software, automation and AI.\n*9+ years* across *22+ international projects*.",
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
    projectsIntro: 'Products I designed and built, from *AI tooling* to full-stack platforms.',
    aboutIntro: 'Engineer by training, builder by habit. Based in *México*, working with teams abroad.',
    processIntro: 'From *architecture* to *tested, automated* software running in production.',
    workIntro: '*9+ years* across product, QA and automation, from banking apps to *AI agents*.',
    testimonialsIntro: "Words from people I've *built, tested and shipped* with.",
    contactIntro: 'Have a project, a role or a question? *Write me* and I will get back to you.',
    archiveLabel: '... /Archive ...',
    archiveTitle: 'More projects',
    viewAll: 'All projects on GitHub',
    viewCase: 'View',
    processLabel: '... /Services ...',
    processTitle: 'What I do',
    testimonialsLabel: '... /Testimonials ...',
    testimonialsTitle: 'What they said about me',
    labLabel: '... /Beyond ...',
    lab: {
      bento: {
        title: 'Beyond the code',
        lead: 'Where I work from, what I am on right now and what I build with. *Drag the globe and the cube.*',
        globeTitle: 'México → the world',
        globeText: 'Remote-first, working with teams across time zones.',
        cubeTitle: 'Tech stack',
        cubeText: 'tools across six roles',
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
      automate: {
        title: 'Automate this',
        lead: 'Pick a task people still do by hand and watch it *race its automation*.',
        manual: 'By hand',
        auto: 'Automated',
        run: 'Run race',
        again: 'Run again',
        saved: 'saved per month',
        perMonth: 'runs a month',
        note: 'Typical figures from my client work; every team is different.',
        tasks: [
          { id: 'report', name: 'Weekly sales report', manualMin: 95, autoSec: 42, runsPerMonth: 4, manual: ['Export CSVs from 3 systems', 'Merge them in Excel', 'Fix formats and duplicates', 'Build the charts', 'Write the summary email', 'Send it to 12 people'], auto: [['Cron trigger', 'n8n'], ['Query SQL + CRM API', 'Python'], ['Clean and merge', 'pandas'], ['Render the PDF report', 'Lambda'], ['Post to Slack + email', 'Webhooks']] },
          { id: 'qa', name: 'Checkout regression test', manualMin: 180, autoSec: 210, runsPerMonth: 8, manual: ['Open the browser and log in', 'Add products to the cart', 'Try 6 payment methods', 'Check totals and emails', 'Repeat it all on mobile', 'Write the bug report'], auto: [['Pull request opened', 'GitHub Actions'], ['48 end-to-end tests', 'Playwright'], ['API contract tests', 'Postman'], ['Mobile viewport run', 'Playwright'], ['Report + screenshots on the PR', 'CI']] },
          { id: 'triage', name: 'Support ticket triage', manualMin: 120, autoSec: 25, runsPerMonth: 22, manual: ['Read every new ticket', 'Search the logs for the user', 'Guess the priority', 'Assign it to a team', 'Reply to the customer'], auto: [['New ticket webhook', 'Zendesk'], ['Classify + set priority', 'LLM + RAG'], ['Pull the user\'s logs', 'Datadog API'], ['Route to the right team', 'Jira'], ['Draft a reply for review', 'MCP']] },
        ],
      },
      mission: {
        title: 'Mission control',
        lead: 'My real GitHub activity, *live*. No mockups.',
        live: 'Live',
        activity: 'Activity · last 12 months',
        feed: 'Latest pushes',
        languages: 'Languages',
        repos: 'public repos',
        lastPush: 'last push',
        pushed: 'pushed to',
        loading: 'Connecting to GitHub…',
        error: 'GitHub is not answering right now.',
        open: 'Open my GitHub',
        ago: ['just now', 'min ago', 'h ago', 'd ago'],
      },
      plan: {
        title: 'Build your project',
        lead: 'Tick what you need and get a *first plan* in seconds: phases, stack and who does what.',
        ask: 'What do you need?',
        empty: 'Pick at least one option to see the plan.',
        plan: 'Your plan',
        weeks: 'weeks',
        week: 'Wk',
        ongoing: 'ongoing',
        stack: 'Stack',
        roles: 'Roles',
        cta: "Let's talk about it",
        note: 'A starting point for a conversation, not a quote.',
        kickoff: 'Discovery and architecture',
        handover: 'Launch and handover',
        needs: [
          { id: 'web', label: 'A web or mobile app', role: 'Software Engineer', stack: ['React', 'Node.js', 'TypeScript', 'AWS'], phases: [['Design and API contracts', 1], ['Build front end and back end', 3]] },
          { id: 'qa', label: 'Automated testing', role: 'Quality Assurance', stack: ['Playwright', 'Postman', 'GitHub Actions'], phases: [['Test strategy and critical paths', 1], ['E2E and API suites in CI', 2]] },
          { id: 'auto', label: 'Automations and AI agents', role: 'Automation Engineer', stack: ['n8n', 'Python', 'AWS Lambda', 'RAG'], phases: [['Map the manual workflows', 1], ['Build the flows and agents', 2]] },
          { id: 'support', label: 'Production support', role: 'Senior Product Engineer', stack: ['Datadog', 'CloudWatch', 'SQL'], phases: [['Observability and runbooks', 1], ['L2/L3 support and root-cause fixes', 0]] },
        ],
      },
      incident: {
        title: 'Live incident',
        lead: 'Production breaks at 2 a.m. This is *how I take it from alert to postmortem*.',
        alert: 'ALERT · checkout returning 500s',
        resolved: 'Resolved',
        replay: 'Replay incident',
        mttr: 'time to resolve',
        postmortem: 'Postmortem',
        post: [['Root cause', 'Yesterday\'s migration dropped an index on orders; checkout queries waited on row locks.'], ['Fix', 'Index rebuilt concurrently, plus retries with backoff on the payment call.'], ['Prevention', 'A CI check that blocks migrations without index review, and an alert on lock wait time.']],
        steps: [
          { tool: 'Datadog', text: 'Checkout 5xx up 340%, p95 at 4.8 s', log: 'monitor: checkout.errors > threshold (02:14)' },
          { tool: 'CloudWatch', text: 'The payment service is timing out', log: 'TimeoutError: POST /pay exceeded 30000ms' },
          { tool: 'Tracing', text: 'Every slow request waits on the database', log: 'span db.orders.select_for_update 28.2s' },
          { tool: 'SQL', text: 'Root cause: missing index after a migration', log: 'EXPLAIN → Seq Scan on orders (rows=4.1M)' },
          { tool: 'Hotfix', text: 'Rebuild the index, add retry with backoff', log: 'CREATE INDEX CONCURRENTLY idx_orders_status…' },
          { tool: 'Playwright', text: 'Checkout suite green on staging', log: '48 passed (1.9m)' },
          { tool: 'Deploy', text: 'Canary 10% → 100%, errors back to normal', log: 'rollout complete · 5xx 0.02%' },
        ],
      },
    },
    contactLabel: '... /Contact ...',
    contactTitle: ["Let's work", 'together'],
    contactText: "I'm open to collaborating on new projects or just chatting about software, automation and technology.",
    contactCta: 'Get in touch',
    copy: 'Copy email',
    copied: 'Copied!',
    localTime: 'Local time',
    backToTop: 'Back to top',
    rights: 'All rights reserved',
    switchTo: (mode) => `Switch to ${mode} mode`,
    proof: { manual: 'Manual', withAi: 'With AI', live: 'Live', checking: 'Checking…', latency: (ms) => `responded in ${ms} ms` },
    story: { open: 'View case', problem: 'Problem', solution: 'Solution', result: 'Result', visit: 'Visit project', close: 'Close' },
    workflow: {
      title: 'A workflow I automate',
      caption: 'A new lead arrives, an AI agent qualifies it, the CRM is updated and the team gets notified. No one copies anything by hand.',
      nodes: [['Webhook', 'new lead'], ['AI agent', 'qualifies'], ['CRM API', 'upsert'], ['Slack', 'notify team']],
    },
    services: {
      live: 'v2.4.1 live in production',
      gate: {
        suites: [['UI · Playwright', '142 passed'], ['API · Postman', '86 passed'], ['E2E · Cypress', '38 passed'], ['Load · JMeter', 'p95 240 ms']],
        passed: 'Quality gate passed — ready to release',
      },
      hub: { core: 'Business core', caption: 'One process, four systems, a single source of truth.' },
      stages: ['Design', 'Build', 'Verify', 'Automate'],
      phases: ['Discover', 'Design', 'Build', 'Test', 'Automate', 'Operate'],
      lead: 'Lead',
      support: 'Support',
      spin: 'Spin',
    },
    build: 'build passing',
    chat: {
      open: 'Ask my portfolio',
      title: 'Ask me anything',
      intro: "Hi! I'm Erick's AI assistant, built with an LLM grounded in this portfolio. Ask about my experience, projects or stack.",
      placeholder: 'Type your question…',
      send: 'Send',
      close: 'Close chat',
      thinking: 'Thinking…',
      suggestions: ['What kind of automation do you build?', 'Which QA tools do you use?', 'Tell me about your AI projects'],
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
    { value: 25, suffix: '+', label: 'Clients' },
    { value: 60, suffix: '%', label: 'Less manual work with AI' },
  ],
  projects: [
    { ...projectsBase[0], summary: 'Gmail extension that generates contextual and stylized replies using AI.', metric: { value: '~40%', label: 'less time per reply' }, story: { problem: 'Writing thoughtful replies by hand took a big share of every working day.', solution: 'A Gmail extension that reads the thread and drafts a contextual reply in the chosen tone, backed by a Spring Boot API that calls the LLM.', result: 'About 40% less time per reply, published on the Chrome Web Store.' } },
    { ...projectsBase[1], summary: 'Platform to publish and share technical articles.', metric: { value: '30+', label: 'articles published' }, story: { problem: 'Developers needed a simple place to publish and share technical posts.', solution: 'A full-stack blog with a React front end and a GraphQL API for posts, authors and tags.', result: '30+ articles published, including the REST vs. GraphQL and Closures guides.' } },
    { ...projectsBase[2], summary: 'Vehicle incident management system for operational control.', metric: { value: '25', label: 'active users' }, story: { problem: 'Vehicle incidents were tracked across spreadsheets and messages, with no single source of truth.', solution: 'A web app on React, Node.js and MongoDB to log, assign and follow up every incident with its status and history.', result: '25 active users running operational control on it.' } },
    { ...projectsBase[3], summary: 'Artist website showcasing a musical and acting career.', metric: { value: 'Live', label: 'artist showcase' }, story: { problem: 'An artist needed one place to present her music and acting career.', solution: 'A fast React + Vite site styled with Tailwind, built around her work, media and contact.', result: 'Live as her professional showcase.' } },
    { ...projectsBase[4], summary: 'Agency landing page showcasing a professional profile.', metric: { value: 'Live', label: 'agency landing page' }, story: { problem: 'A software agency needed a landing page that presented its profile with credibility.', solution: 'A Next.js + TypeScript landing with clear service sections and a strong visual identity.', result: 'Live as the agency\'s landing page.' } },
  ],
  archive: [
    { ...archiveBase[8], tagline: 'Free screen recorder', description: 'A screen recorder web app for anyone who does not want to pay for an online one.', story: { problem: 'Online screen recorders hide basic recording behind paywalls, watermarks or sign-ups.', solution: 'A screen recorder that runs entirely in the browser, built with plain JavaScript, HTML and CSS.', result: 'A free utility, live on Vercel, for anyone who needs to record their screen.' } },
    { ...archiveBase[9], tagline: 'Media converter', description: 'Converts images, audio and video in the browser, for free and without restrictions.', story: { problem: 'Converting media usually means uploading files to sites full of limits, ads or paywalls.', solution: 'An online converter for images, audio and video, built with Next.js and Shadcn/ui on top of ffmpeg.', result: 'Free media conversion without restrictions, live on Vercel.' } },
    { ...archiveBase[0], tagline: 'VS Code extension', description: 'A to-do extension for Visual Studio Code to manage coding tasks, available in the marketplace.', story: { problem: 'Small coding tasks lived in notes outside the editor and kept getting lost.', solution: 'A Visual Studio Code extension that keeps a to-do list right inside the editor, next to the code.', result: 'Published in the VS Code marketplace, with setup instructions on GitHub.' } },
    { ...archiveBase[1], tagline: "Yalo's Swiss Army", description: 'Internal tool used by the support team to automate processes and execute API requests.', story: { problem: 'Yalo\'s support team ran repetitive processes and API requests by hand, one ticket at a time.', solution: 'An internal tool in TypeScript, React and Ruby that automates those processes and runs the API requests from one place.', result: 'I created and maintained it as the support team\'s everyday "Swiss Army knife".' } },
    { ...archiveBase[2], tagline: 'Full-stack blog', description: 'MERN blog with CRUD operations and AWS S3 storage.', story: { problem: 'I wanted a blog with real file storage, not just uploads saved on the server.', solution: 'A MERN blog with full CRUD for posts and images stored in AWS S3.', result: 'Source code on GitHub; deployment is pending.' } },
    { ...archiveBase[10], tagline: 'Three.js canvas', description: 'An interactive Three.js plane animated with GSAP, built as a dynamic hero component.', story: { problem: 'A static hero section rarely makes a strong first impression.', solution: 'An interactive Three.js plane animated with GSAP that reacts as you use it.', result: 'A dynamic hero component, live on Vercel.' } },
    { ...archiveBase[11], tagline: 'AI email replier', description: 'Generates personalized email replies with AI, in different conversation tones.', story: { problem: 'Writing a good reply takes time, and getting the tone right takes even longer.', solution: 'A Spring Boot backend with a JavaScript client that generates personalized email replies with AI, in different tones.', result: 'The engine behind my AI email assistant; source code on GitHub.' } },
    { ...archiveBase[3], tagline: 'NPM package', description: 'Customizable web template generator that gives a clean starting point for web apps.', story: { problem: 'Every new web project started by rewriting the same boilerplate.', solution: 'An npm package that generates a clean, customizable web template to start from.', result: 'Published on npm, ready to install.' } },
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
      title: 'Threefolio — Three.js canvas',
      description: 'An interactive Three.js plane animated with GSAP to create a dynamic hero component.',
      href: 'https://threefolio.vercel.app/',
      tag: 'Experiment',
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
    { ...jobsBase[0], period: '2026 — Present', role: 'Automation Engineer', highlights: [] },
    { ...jobsBase[1], period: 'Jun 2025 — 2026', role: 'Senior Product Engineer', highlights: ['AI agents for 20+ international clients.', 'AI automation tools that cut manual work by 60%.'] },
    { ...jobsBase[2], period: 'Feb — May 2025', role: 'QA Lead Engineer', highlights: ['Led the QA automation transformation.', 'Playwright framework and GitLab CI/CD; mentored 12 engineers.'] },
    { ...jobsBase[3], period: 'Jan 2021 — Feb 2025', role: 'QA / Pega System Architect', highlights: ['Enterprise Pega apps processing 1000+ daily cases.', 'Led QA teams; certified Pega System & Business Architect.'] },
    { ...jobsBase[4], period: '2020 — 2021', role: 'Front-End Developer', highlights: ['20+ responsive landing pages.', 'Performance with lazy loading and code splitting.'] },
    { ...jobsBase[5], period: '2019 — 2020', role: 'Full-Stack Engineer', highlights: ['Banking apps with React, TypeScript and .NET.'] },
    { ...jobsBase[6], period: '2018 — 2019', role: 'MIS Engineer', highlights: ['Reporting automation with VBA, SQL and Power BI.'] },
  ],
  education: [
    "Master's in Business Management & Quality Engineering (in progress)",
    'Postgraduate Diploma in Manufacturing & Quality',
    "Bachelor's in Mechatronic Engineering",
  ],
  certifications: ['ISTQB Foundation', 'Pega System Architect', 'Pega Business Architect', 'Harvard CS50 (ongoing)', 'Certified JavaScript Developer', 'Certified React Developer'],
  process: [
    { title: 'Software Engineering', text: 'Building modern software products across frontend, backend services, APIs and cloud environments.', tags: ['TypeScript', 'React', 'Node.js', '.NET', 'AWS'] },
    { title: 'Quality Assurance', text: 'Designing strategies and automation frameworks across UI, APIs and end-to-end workflows.', tags: ['Playwright', 'Cypress', 'JMeter', 'CI/CD'] },
    { title: 'AI & Automation', text: 'Creating AI agents, intelligent workflows and integrations that connect tools, data and processes.', tags: ['LLMs', 'MCP', 'RAG', 'n8n'] },
    { title: 'Solutions Engineering', text: 'Designing scalable solutions that connect business architecture, integrations and code.', tags: ['Pega', 'Salesforce', 'SAP', 'Power BI'] },
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
    { quote: 'Erick performed QA activities for an upgrade project of the Pega platform with a smooth, successful result. He took initiative to quickly understand the client application, creating test cases and executing them.', name: 'Sam Gharnagh', role: 'Vice President', photo: photos.sam },
    { quote: 'His meticulous attention to detail, strong analytical skills and dedication to product quality were evident in every project. Erick is a valuable asset to any team.', name: 'Madhu Chalamaiah', role: 'Lead Developer', photo: photos.madhu },
    { quote: "One of Erick's standout strengths is his ability to leverage AI to solve problems and improve processes. He strengthened the support tools our team relies on every day.", name: 'Aldo Galleoti', role: 'Customer Service Lead' },
    { quote: 'His dedication to product quality, keen eye for detail and proactive approach consistently elevated the team’s performance.', name: 'Carlos Ortíz Sánchez', role: 'Technology Director, Apesa Software' },
    { quote: 'He got direct exposure to the client and was able to interact with them. The client liked his work and he helped them whenever they needed it.', name: 'Darwin Batres', role: 'Lead Developer', photo: photos.darwin },
    { quote: 'A tremendous professional who is always looking for solutions. We carried out projects that changed the way the organization operates.', name: 'Juan Orozco', role: 'GTM in Latam' },
    { quote: 'He proved to be a valuable asset for any project, taking part in every aspect of it, including frontend and backend development.', name: 'Luis Cuestas', role: 'Lead Developer' },
    { quote: 'Strong technical skills and a significant commitment to his responsibilities. His ability to tackle complex challenges contributed significantly to the success of our projects.', name: 'Rules Cube', role: 'Company' },
  ],
  now: [
    { label: 'Building', text: 'Automation at Casa Médica.' },
    { label: 'Studying', text: "Master's in Business Management & Quality Engineering." },
    { label: 'Learning', text: 'Harvard CS50.' },
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
    goal: 'Ingeniero Mecatrónico con experiencia en *Desarrollo de Software*, *QA Engineering* y *Automatización*.',
    intro: '¡Hola! Soy Erick, *Ingeniero Mecatrónico* que construye software, automatización e IA.\n*Más de 9 años* en *más de 22 proyectos internacionales*.',
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
    projectsIntro: 'Productos que diseñé y construí, desde *herramientas de IA* hasta plataformas full-stack.',
    aboutIntro: 'Ingeniero de formación, constructor por costumbre. Desde *México*, con equipos en el extranjero.',
    processIntro: 'De la *arquitectura* al software *probado y automatizado* corriendo en producción.',
    workIntro: '*Más de 9 años* entre producto, QA y automatización, de apps bancarias a *agentes de IA*.',
    testimonialsIntro: 'Palabras de personas con las que he *construido, probado y lanzado*.',
    contactIntro: '¿Un proyecto, un puesto o una duda? *Escríbeme* y te respondo.',
    archiveLabel: '... /Archivo ...',
    archiveTitle: 'Más proyectos',
    viewAll: 'Todos los proyectos en GitHub',
    viewCase: 'Ver',
    processLabel: '... /Servicios ...',
    processTitle: 'Lo que hago',
    testimonialsLabel: '... /Testimonios ...',
    testimonialsTitle: 'Lo que dicen de mí',
    labLabel: '... /Beyond ...',
    lab: {
      bento: {
        title: 'Más allá del código',
        lead: 'Desde dónde trabajo, en qué estoy ahora y con qué construyo. *Arrastra el globo y el cubo.*',
        globeTitle: 'México → el mundo',
        globeText: 'Trabajo remoto, con equipos en distintas zonas horarias.',
        cubeTitle: 'Stack técnico',
        cubeText: 'herramientas en seis roles',
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
      automate: {
        title: 'Automatiza esto',
        lead: 'Elige una tarea que todavía se hace a mano y mírala *competir contra su automatización*.',
        manual: 'A mano',
        auto: 'Automatizado',
        run: 'Correr carrera',
        again: 'Correr otra vez',
        saved: 'ahorradas al mes',
        perMonth: 'veces al mes',
        note: 'Cifras típicas de mi trabajo con clientes; cada equipo es distinto.',
        tasks: [
          { id: 'report', name: 'Reporte semanal de ventas', manualMin: 95, autoSec: 42, runsPerMonth: 4, manual: ['Exportar CSV de 3 sistemas', 'Unirlos en Excel', 'Corregir formatos y duplicados', 'Armar las gráficas', 'Redactar el correo resumen', 'Enviarlo a 12 personas'], auto: [['Disparo programado', 'n8n'], ['Consulta SQL + API del CRM', 'Python'], ['Limpiar y unir', 'pandas'], ['Generar el PDF', 'Lambda'], ['Publicar en Slack + correo', 'Webhooks']] },
          { id: 'qa', name: 'Prueba de regresión del checkout', manualMin: 180, autoSec: 210, runsPerMonth: 8, manual: ['Abrir el navegador e iniciar sesión', 'Agregar productos al carrito', 'Probar 6 métodos de pago', 'Revisar totales y correos', 'Repetir todo en móvil', 'Escribir el reporte de bugs'], auto: [['Se abre el pull request', 'GitHub Actions'], ['48 pruebas end-to-end', 'Playwright'], ['Pruebas de contrato de API', 'Postman'], ['Corrida en viewport móvil', 'Playwright'], ['Reporte + capturas en el PR', 'CI']] },
          { id: 'triage', name: 'Clasificación de tickets de soporte', manualMin: 120, autoSec: 25, runsPerMonth: 22, manual: ['Leer cada ticket nuevo', 'Buscar al usuario en los logs', 'Adivinar la prioridad', 'Asignarlo a un equipo', 'Responder al cliente'], auto: [['Webhook de ticket nuevo', 'Zendesk'], ['Clasificar + prioridad', 'LLM + RAG'], ['Traer los logs del usuario', 'API de Datadog'], ['Enviar al equipo correcto', 'Jira'], ['Borrador de respuesta para revisar', 'MCP']] },
        ],
      },
      mission: {
        title: 'Centro de control',
        lead: 'Mi actividad real en GitHub, *en vivo*. Nada de maquetas.',
        live: 'En vivo',
        activity: 'Actividad · últimos 12 meses',
        feed: 'Últimos pushes',
        languages: 'Lenguajes',
        repos: 'repos públicos',
        lastPush: 'último push',
        pushed: 'push a',
        loading: 'Conectando con GitHub…',
        error: 'GitHub no responde en este momento.',
        open: 'Abrir mi GitHub',
        ago: ['ahora', 'min', 'h', 'd'],
      },
      plan: {
        title: 'Arma tu proyecto',
        lead: 'Marca lo que necesitas y obtén un *primer plan* en segundos: fases, stack y quién hace qué.',
        ask: '¿Qué necesitas?',
        empty: 'Elige al menos una opción para ver el plan.',
        plan: 'Tu plan',
        weeks: 'semanas',
        week: 'Sem',
        ongoing: 'continuo',
        stack: 'Stack',
        roles: 'Roles',
        cta: 'Hablemos de esto',
        note: 'Un punto de partida para conversar, no una cotización.',
        kickoff: 'Descubrimiento y arquitectura',
        handover: 'Lanzamiento y entrega',
        needs: [
          { id: 'web', label: 'Una app web o móvil', role: 'Software Engineer', stack: ['React', 'Node.js', 'TypeScript', 'AWS'], phases: [['Diseño y contratos de API', 1], ['Construir front end y back end', 3]] },
          { id: 'qa', label: 'Pruebas automatizadas', role: 'Quality Assurance', stack: ['Playwright', 'Postman', 'GitHub Actions'], phases: [['Estrategia de pruebas y rutas críticas', 1], ['Suites E2E y de API en CI', 2]] },
          { id: 'auto', label: 'Automatizaciones y agentes de IA', role: 'Automation Engineer', stack: ['n8n', 'Python', 'AWS Lambda', 'RAG'], phases: [['Mapear los flujos manuales', 1], ['Construir flujos y agentes', 2]] },
          { id: 'support', label: 'Soporte de producción', role: 'Senior Product Engineer', stack: ['Datadog', 'CloudWatch', 'SQL'], phases: [['Observabilidad y runbooks', 1], ['Soporte L2/L3 y fixes de causa raíz', 0]] },
        ],
      },
      incident: {
        title: 'Incidente en vivo',
        lead: 'Producción se cae a las 2 a.m. Así *lo llevo de la alerta al postmortem*.',
        alert: 'ALERTA · el checkout devuelve 500',
        resolved: 'Resuelto',
        replay: 'Repetir incidente',
        mttr: 'tiempo de resolución',
        postmortem: 'Postmortem',
        post: [['Causa raíz', 'La migración de ayer eliminó un índice en orders; las consultas del checkout esperaban bloqueos de fila.'], ['Fix', 'Índice reconstruido en concurrente, más reintentos con backoff en la llamada de pago.'], ['Prevención', 'Un check en CI que bloquea migraciones sin revisión de índices y una alerta sobre el tiempo de espera de bloqueos.']],
        steps: [
          { tool: 'Datadog', text: 'Errores 5xx del checkout suben 340%, p95 en 4.8 s', log: 'monitor: checkout.errors > threshold (02:14)' },
          { tool: 'CloudWatch', text: 'El servicio de pagos está agotando el tiempo', log: 'TimeoutError: POST /pay exceeded 30000ms' },
          { tool: 'Tracing', text: 'Cada request lenta espera a la base de datos', log: 'span db.orders.select_for_update 28.2s' },
          { tool: 'SQL', text: 'Causa raíz: falta un índice tras una migración', log: 'EXPLAIN → Seq Scan on orders (rows=4.1M)' },
          { tool: 'Hotfix', text: 'Reconstruir el índice, agregar reintento con backoff', log: 'CREATE INDEX CONCURRENTLY idx_orders_status…' },
          { tool: 'Playwright', text: 'Suite del checkout en verde en staging', log: '48 passed (1.9m)' },
          { tool: 'Deploy', text: 'Canary 10% → 100%, errores de vuelta a lo normal', log: 'rollout complete · 5xx 0.02%' },
        ],
      },
    },
    contactLabel: '... /Contacto ...',
    contactTitle: ['Trabajemos', 'juntos'],
    contactText: 'Estoy abierto a colaborar en nuevos proyectos o simplemente a conversar sobre software, automatización y tecnología.',
    contactCta: 'Escríbeme',
    copy: 'Copiar email',
    copied: '¡Copiado!',
    localTime: 'Hora local',
    backToTop: 'Volver arriba',
    rights: 'Todos los derechos reservados',
    switchTo: (mode) => `Cambiar a modo ${mode}`,
    proof: { manual: 'Manual', withAi: 'Con IA', live: 'En línea', checking: 'Verificando…', latency: (ms) => `respondió en ${ms} ms` },
    story: { open: 'Ver caso', problem: 'Problema', solution: 'Solución', result: 'Resultado', visit: 'Visitar proyecto', close: 'Cerrar' },
    workflow: {
      title: 'Un flujo que automatizo',
      caption: 'Llega un lead nuevo, un agente de IA lo califica, se actualiza el CRM y el equipo recibe el aviso. Nadie copia nada a mano.',
      nodes: [['Webhook', 'lead nuevo'], ['Agente IA', 'califica'], ['API CRM', 'upsert'], ['Slack', 'avisa al equipo']],
    },
    services: {
      live: 'v2.4.1 en producción',
      gate: {
        suites: [['UI · Playwright', '142 aprobados'], ['API · Postman', '86 aprobados'], ['E2E · Cypress', '38 aprobados'], ['Carga · JMeter', 'p95 240 ms']],
        passed: 'Quality gate aprobado — listo para liberar',
      },
      hub: { core: 'Núcleo de negocio', caption: 'Un proceso, cuatro sistemas, una sola fuente de verdad.' },
      stages: ['Diseño', 'Construcción', 'Verificación', 'Automatización'],
      phases: ['Descubrir', 'Diseñar', 'Construir', 'Probar', 'Automatizar', 'Operar'],
      lead: 'Lidero',
      support: 'Apoyo',
      spin: 'Girar',
    },
    build: 'build exitoso',
    chat: {
      open: 'Pregúntale a mi portafolio',
      title: 'Pregúntame lo que quieras',
      intro: '¡Hola! Soy el asistente de IA de Erick, un LLM alimentado con este portafolio. Pregúntame por mi experiencia, proyectos o stack.',
      placeholder: 'Escribe tu pregunta…',
      send: 'Enviar',
      close: 'Cerrar chat',
      thinking: 'Pensando…',
      suggestions: ['¿Qué tipo de automatizaciones construyes?', '¿Qué herramientas de QA usas?', 'Cuéntame de tus proyectos con IA'],
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
    { value: 25, suffix: '+', label: 'Clientes' },
    { value: 60, suffix: '%', label: 'Menos trabajo manual con IA' },
  ],
  projects: [
    { ...projectsBase[0], summary: 'Extensión de Gmail que genera respuestas contextuales y con estilo usando IA.', metric: { value: '~40%', label: 'menos tiempo por respuesta' }, story: { problem: 'Escribir respuestas cuidadas a mano se llevaba buena parte de cada jornada.', solution: 'Una extensión de Gmail que lee el hilo y redacta una respuesta contextual en el tono elegido, con una API en Spring Boot que llama al LLM.', result: 'Cerca de 40% menos tiempo por respuesta; publicada en la Chrome Web Store.' } },
    { ...projectsBase[1], summary: 'Plataforma para publicar y compartir artículos técnicos.', metric: { value: '30+', label: 'artículos publicados' }, story: { problem: 'Los desarrolladores necesitaban un lugar simple para publicar y compartir artículos técnicos.', solution: 'Un blog full-stack con front en React y una API GraphQL para artículos, autores y etiquetas.', result: 'Más de 30 artículos publicados, incluidas las guías de REST vs. GraphQL y Closures.' } },
    { ...projectsBase[2], summary: 'Sistema de gestión de incidentes vehiculares para control operativo.', metric: { value: '25', label: 'usuarios activos' }, story: { problem: 'Los incidentes vehiculares vivían en hojas de cálculo y mensajes, sin una fuente única de verdad.', solution: 'Una app web en React, Node.js y MongoDB para registrar, asignar y dar seguimiento a cada incidente con su estado e historial.', result: '25 usuarios activos llevan el control operativo en ella.' } },
    { ...projectsBase[3], summary: 'Sitio de una artista que muestra su trayectoria musical y actoral.', metric: { value: 'Live', label: 'sitio de artista' }, story: { problem: 'Una artista necesitaba un solo lugar para presentar su carrera musical y actoral.', solution: 'Un sitio rápido en React + Vite con Tailwind, construido alrededor de su obra, medios y contacto.', result: 'En línea como su vitrina profesional.' } },
    { ...projectsBase[4], summary: 'Landing page de agencia que presenta un perfil profesional.', metric: { value: 'Live', label: 'landing de agencia' }, story: { problem: 'Una agencia de software necesitaba una landing que presentara su perfil con credibilidad.', solution: 'Una landing en Next.js + TypeScript con secciones de servicios claras y una identidad visual fuerte.', result: 'En línea como la landing de la agencia.' } },
  ],
  archive: [
    { ...archiveBase[8], tagline: 'Grabador de pantalla gratis', description: 'App web para grabar la pantalla, para quien no quiere pagar por una herramienta en línea.', story: { problem: 'Los grabadores de pantalla en línea esconden lo básico detrás de pagos, marcas de agua o registros.', solution: 'Un grabador de pantalla que corre por completo en el navegador, hecho con JavaScript, HTML y CSS.', result: 'Una utilidad gratuita, en línea en Vercel, para quien necesite grabar su pantalla.' } },
    { ...archiveBase[9], tagline: 'Convertidor multimedia', description: 'Convierte imágenes, audio y video en el navegador, gratis y sin restricciones.', story: { problem: 'Convertir archivos suele implicar subirlos a sitios llenos de límites, anuncios o pagos.', solution: 'Un convertidor en línea de imágenes, audio y video, hecho con Next.js y Shadcn/ui sobre ffmpeg.', result: 'Conversión multimedia gratis y sin restricciones, en línea en Vercel.' } },
    { ...archiveBase[0], tagline: 'Extensión de VS Code', description: 'Extensión de tareas para Visual Studio Code, disponible en el marketplace.', story: { problem: 'Las tareas pequeñas de código vivían en notas fuera del editor y se perdían.', solution: 'Una extensión para Visual Studio Code que mantiene la lista de pendientes dentro del editor, junto al código.', result: 'Publicada en el marketplace de VS Code, con instrucciones en GitHub.' } },
    { ...archiveBase[1], tagline: 'La navaja suiza de Yalo', description: 'Herramienta interna del equipo de soporte para automatizar procesos y ejecutar requests a APIs.', story: { problem: 'El equipo de soporte de Yalo ejecutaba procesos repetitivos y requests a APIs a mano, ticket por ticket.', solution: 'Una herramienta interna en TypeScript, React y Ruby que automatiza esos procesos y ejecuta los requests desde un solo lugar.', result: 'La creé y la mantuve como la "navaja suiza" diaria del equipo de soporte.' } },
    { ...archiveBase[2], tagline: 'Blog full-stack', description: 'Blog MERN con operaciones CRUD y almacenamiento en AWS S3.', story: { problem: 'Quería un blog con almacenamiento real de archivos, no solo subidas guardadas en el servidor.', solution: 'Un blog MERN con CRUD completo para artículos e imágenes almacenadas en AWS S3.', result: 'Código en GitHub; el despliegue está pendiente.' } },
    { ...archiveBase[10], tagline: 'Canvas con Three.js', description: 'Un plano interactivo en Three.js animado con GSAP, pensado como componente hero.', story: { problem: 'Un hero estático rara vez deja una buena primera impresión.', solution: 'Un plano interactivo en Three.js animado con GSAP que reacciona mientras lo usas.', result: 'Un componente hero dinámico, en línea en Vercel.' } },
    { ...archiveBase[11], tagline: 'Respuestas de correo con IA', description: 'Genera respuestas de correo personalizadas con IA, en distintos tonos de conversación.', story: { problem: 'Escribir una buena respuesta toma tiempo, y acertar con el tono, todavía más.', solution: 'Un backend en Spring Boot con un cliente en JavaScript que genera respuestas de correo personalizadas con IA, en distintos tonos.', result: 'El motor detrás de mi asistente de correo con IA; código en GitHub.' } },
    { ...archiveBase[3], tagline: 'Paquete de NPM', description: 'Generador de plantillas web personalizable como punto de partida para aplicaciones.', story: { problem: 'Cada proyecto web nuevo empezaba reescribiendo el mismo código base.', solution: 'Un paquete de npm que genera una plantilla web limpia y personalizable como punto de partida.', result: 'Publicado en npm, listo para instalar.' } },
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
      title: 'Threefolio — Canvas en Three.js',
      description: 'Un plano interactivo en Three.js animado con GSAP para crear un hero dinámico.',
      href: 'https://threefolio.vercel.app/',
      tag: 'Experimento',
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
    { ...jobsBase[0], period: '2026 — Hoy', role: 'Automation Engineer', highlights: [] },
    { ...jobsBase[1], period: 'Jun 2025 — 2026', role: 'Senior Product Engineer', highlights: ['Agentes de IA para más de 20 clientes internacionales.', 'Herramientas de automatización con IA: 60% menos trabajo manual.'] },
    { ...jobsBase[2], period: 'Feb — May 2025', role: 'QA Lead Engineer', highlights: ['Lideré la transformación de QA automation.', 'Framework en Playwright y CI/CD en GitLab; mentoría a 12 ingenieros.'] },
    { ...jobsBase[3], period: 'Ene 2021 — Feb 2025', role: 'QA / Pega System Architect', highlights: ['Apps Pega empresariales con más de 1000 casos diarios.', 'Liderazgo de equipos de QA; certificado Pega System y Business Architect.'] },
    { ...jobsBase[4], period: '2020 — 2021', role: 'Front-End Developer', highlights: ['Más de 20 landing pages responsivas.', 'Rendimiento con lazy loading y code splitting.'] },
    { ...jobsBase[5], period: '2019 — 2020', role: 'Full-Stack Engineer', highlights: ['Apps bancarias con React, TypeScript y .NET.'] },
    { ...jobsBase[6], period: '2018 — 2019', role: 'MIS Engineer', highlights: ['Automatización de reportes con VBA, SQL y Power BI.'] },
  ],
  education: [
    'Maestría en Administración de Negocios e Ingeniería de Calidad (en curso)',
    'Diplomado en Manufactura y Calidad',
    'Ingeniería Mecatrónica',
  ],
  certifications: ['ISTQB Foundation', 'Pega System Architect', 'Pega Business Architect', 'Harvard CS50 (en curso)', 'Certified JavaScript Developer', 'Certified React Developer'],
  process: [
    { title: 'Ingeniería de software', text: 'Construyo productos de software modernos: frontend, servicios backend, APIs y entornos cloud.', tags: ['TypeScript', 'React', 'Node.js', '.NET', 'AWS'] },
    { title: 'Aseguramiento de calidad', text: 'Diseño estrategias y frameworks de automatización para UI, APIs y flujos end-to-end.', tags: ['Playwright', 'Cypress', 'JMeter', 'CI/CD'] },
    { title: 'IA y automatización', text: 'Creo agentes de IA, flujos inteligentes e integraciones que conectan herramientas, datos y procesos.', tags: ['LLMs', 'MCP', 'RAG', 'n8n'] },
    { title: 'Ingeniería de soluciones', text: 'Diseño soluciones escalables que conectan arquitectura de negocio, integraciones y código.', tags: ['Pega', 'Salesforce', 'SAP', 'Power BI'] },
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
    { quote: 'Erick realizó QA para un proyecto de actualización de la plataforma Pega con un resultado exitoso. Tomó la iniciativa para entender rápido la aplicación del cliente, creando y ejecutando casos de prueba.', name: 'Sam Gharnagh', role: 'Vice President', photo: photos.sam },
    { quote: 'Su atención al detalle, su capacidad analítica y su compromiso con la calidad se notaron en cada proyecto. Erick es un activo valioso para cualquier equipo.', name: 'Madhu Chalamaiah', role: 'Lead Developer', photo: photos.madhu },
    { quote: 'Una de sus mayores fortalezas es usar IA para resolver problemas y mejorar procesos. Fortaleció las herramientas de soporte que nuestro equipo usa todos los días.', name: 'Aldo Galleoti', role: 'Customer Service Lead' },
    { quote: 'Su compromiso con la calidad, su ojo para el detalle y su proactividad elevaron consistentemente el desempeño del equipo.', name: 'Carlos Ortíz Sánchez', role: 'Technology Director, Apesa Software' },
    { quote: 'Tuvo exposición directa con el cliente y supo interactuar con él. Al cliente le gustó su trabajo y lo ayudó cada vez que lo necesitó.', name: 'Darwin Batres', role: 'Lead Developer', photo: photos.darwin },
    { quote: 'Un profesional tremendo que siempre busca soluciones. Hicimos proyectos que cambiaron la forma en que opera la organización.', name: 'Juan Orozco', role: 'GTM in Latam' },
    { quote: 'Demostró ser un activo valioso para cualquier proyecto; participó en todos sus aspectos, incluido el desarrollo frontend y backend.', name: 'Luis Cuestas', role: 'Lead Developer' },
    { quote: 'Sólidas habilidades técnicas y un gran compromiso con sus responsabilidades. Su capacidad para resolver retos complejos contribuyó al éxito de nuestros proyectos.', name: 'Rules Cube', role: 'Empresa' },
  ],
  now: [
    { label: 'Construyendo', text: 'Automatización en Casa Médica.' },
    { label: 'Estudiando', text: 'Maestría en Administración de Negocios e Ingeniería de Calidad.' },
    { label: 'Aprendiendo', text: 'Harvard CS50.' },
  ],
}

export const content: Record<Lang, Content> = { en, es }
