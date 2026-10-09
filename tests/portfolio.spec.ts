import { expect, test, type Page } from '@playwright/test'

/** Opens the site in a fixed language and waits for the preloader to finish. */
async function open(page: Page, lang: 'en' | 'es' = 'en') {
  await page.addInitScript((l) => localStorage.setItem('lang', l), lang)
  await page.goto('/')
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
    await page.getByRole('button', { name: 'Es', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    if (!isMobile) await expect(page.locator('.nav')).toContainText('Proyectos')
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
    await page.locator('.project__open').first().click()
    const dialog = page.locator('dialog.case')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.case__steps li')).toHaveCount(3)
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

  test('lab constellation shows a tech and its connections', async ({ page }) => {
    await open(page)
    const star = page.locator('.lab-cosmos__map .lab-cosmos__star').first()
    await star.scrollIntoViewIfNeeded()
    await expect(page.locator('.lab-cosmos__hint')).toBeVisible()
    // Park the pointer off the map so hovering another star can't steal the focus.
    await page.mouse.move(0, 0)
    await star.focus()
    await expect(star).toHaveClass(/is-focus/)
    await expect(page.locator('.lab-cosmos__info strong')).toHaveText((await star.locator('text').textContent())!)
    await expect(page.locator('.lab-cosmos__info li').first()).toBeVisible()
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
