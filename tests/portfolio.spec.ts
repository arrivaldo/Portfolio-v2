import { expect, test, type Page } from '@playwright/test'

/** Opens the site in a fixed language and waits for the intro to unlock the page. */
async function open(page: Page, lang: 'en' | 'es' = 'en', path = '/') {
  await page.addInitScript((l) => localStorage.setItem('lang', l), lang)
  await page.goto(path)
  await expect(page.locator('html')).not.toHaveClass(/is-loading/, { timeout: 15_000 })
}

test.describe('portfolio', () => {
  test('loads without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && !/vercel|_vercel|analytics/i.test(m.text()) && errors.push(m.text()))
    await open(page)
    await expect(page).toHaveTitle(/Erick Rodríguez Bárcena/)
    await expect(page.locator('.hero__title').first()).toBeVisible()
    expect(errors).toEqual([])
  })

  test('switches language and keeps <html lang> in sync', async ({ page, isMobile }) => {
    await open(page, 'en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    // On mobile the language switch lives in the menu.
    if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('button', { name: 'Es', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    if (isMobile) await expect(page.locator('#mobile-menu nav')).toContainText('Proyectos')
    else await expect(page.locator('.nav')).toContainText('Proyectos')
  })

  test('toggles the theme', async ({ page }) => {
    await open(page)
    const html = page.locator('html')
    const before = await html.getAttribute('data-theme')
    await page.locator('.theme-toggle').click()
    await expect(html).not.toHaveAttribute('data-theme', before!)
  })

  test('opens and closes a case study', async ({ page }) => {
    await open(page)
    // The project cards stack as you scroll, so a pointer click on the first card's button could land on the card
    // stacked over it (the old flakiness). Open it from the keyboard instead: no hit-testing, and it covers keyboard users.
    await page.locator('.project__open').first().focus()
    await page.keyboard.press('Enter')
    // Projects and Archive each own a case-study dialog; target the open one.
    const dialog = page.locator('dialog.case[open]')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.case__steps li')).toHaveCount(3)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('archive rows open the case study too', async ({ page }) => {
    await open(page)
    const row = page.locator('.archive__row', { hasText: 'Heimdall' })
    await row.scrollIntoViewIfNeeded()
    await row.click()
    const dialog = page.locator('dialog.case[open]')
    await expect(dialog.locator('.case__title')).toHaveText('Heimdall')
    await expect(dialog.locator('.case__steps li')).toHaveCount(3)
    await expect(dialog.locator('.case__visit')).toHaveAttribute('href', 'https://heimdall.yalochat.com/')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('carousel autoplay can be paused', async ({ page, isMobile }) => {
    test.skip(isMobile, 'nav controls are desktop only')
    await open(page)
    const toggle = page.locator('.articles__toggle')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    const title = await page.locator('.card--main .card__title').textContent()
    await page.mouse.move(0, 0)
    await page.waitForTimeout(5_800)
    await expect(page.locator('.card--main .card__title')).toHaveText(title!)
  })

  test('lab bento shows the GitHub graph and opens the chat', async ({ page }) => {
    // The contributions proxy is stubbed so the test never depends on the network.
    await page.route('https://github-contributions-api.jogruber.de/**', (route) =>
      route.fulfill({ json: { total: {}, contributions: Array.from({ length: 7 }, (_, i) => ({ date: `2026-01-0${i + 4}`, count: i, level: i % 5 })) } }),
    )
    await page.route('**/api/chat', (route) => route.fulfill({ json: { answer: 'Mostly workflow automation.' } }))
    await open(page)
    const bento = page.locator('.lab-bento')
    await bento.scrollIntoViewIfNeeded()
    // One calendar per year (three years), seven stubbed days each.
    await expect(bento.locator('.lab-bento__cal i[data-lvl]')).toHaveCount(21)
    await expect(bento.locator('.lab-bento__clock strong')).toHaveText(/^\d{2}:\d{2}$/)
    await bento.locator('.lab-bento__chips button').first().click()
    await expect(page.locator('#chat-panel')).toHaveClass(/is-open/)
    await expect(page.locator('#chat-panel')).toContainText('Mostly workflow automation.')
  })

  test('chat answers through /api/chat', async ({ page }) => {
    await page.route('**/api/chat', (route) => route.fulfill({ json: { answer: 'I build automations and AI agents.' } }))
    await open(page)
    await page.locator('.chat-fab').click()
    await page.locator('.chat__form input').fill('What do you do?')
    await page.locator('.chat__form button[type=submit]').click()
    await expect(page.locator('.chat__msg--model').last()).toHaveText('I build automations and AI agents.')
  })

  test('contact form sends through EmailJS', async ({ page }) => {
    let payload: Record<string, unknown> | null = null
    await page.route('https://api.emailjs.com/**', async (route) => {
      payload = route.request().postDataJSON()
      await route.fulfill({ status: 200, body: 'OK' })
    })
    await open(page)
    const form = page.locator('.contact-form')
    await form.scrollIntoViewIfNeeded()
    await form.locator('input[name=name]').fill('QA Bot')
    await form.locator('input[name=email]').fill('qa@example.com')
    await form.locator('input[name=subject]').fill('Hello')
    await form.locator('textarea[name=message]').fill('Testing the form.')
    await form.locator('button[type=submit]').click()
    await expect(form.locator('.contact-form__status')).toHaveClass(/is-sent/)
    expect(payload).toMatchObject({ template_params: { name: 'QA Bot', email: 'qa@example.com' } })
  })

  test('has no horizontal overflow', async ({ page }) => {
    await open(page)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
