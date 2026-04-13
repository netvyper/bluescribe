from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/bluescribe")
    page.wait_for_timeout(3000)

    # Start login/register
    page.get_by_role("button", name="Login / Register").click()
    page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/verification_login.png")

    # Register
    page.get_by_role("button", name="Need an account? Register").click()
    page.wait_for_timeout(1000)

    page.locator('input[type="text"]').last.fill("testuser10")
    page.locator('input[type="password"]').last.fill("password123")
    page.wait_for_timeout(500)
    page.locator('button[type="submit"]').last.click()
    page.wait_for_timeout(2000)

    # Try logging in
    page.locator('input[type="text"]').last.fill("testuser10")
    page.locator('input[type="password"]').last.fill("password123")
    page.wait_for_timeout(500)
    page.locator('button[type="submit"]').last.click()
    page.wait_for_timeout(2000)

    # Close auth dialog
    try:
        page.locator('a.close').click()
    except Exception:
        pass
    page.wait_for_timeout(1000)

    page.get_by_role("button", name="Load").click()
    page.wait_for_timeout(5000)

    page.screenshot(path="/home/jules/verification/screenshots/verification_main.png")

    # Now we are at Select Roster screen
    # Use index 1 or value 'New' for select
    # Try getting select and option New by pure text since select_option may be buggy if option is not found
    try:
        page.locator('select').first.select_option(value='New')
        page.wait_for_timeout(1000)
    except:
        pass

    # Enter a name
    # Ensure it's not the password input
    try:
        page.locator('label').filter(has_text="Filename").locator('input').fill("Test Roster")
        page.wait_for_timeout(500)
    except:
        pass

    # Click the create button
    # Because there are two "Create" buttons and we want to create the roster
    # let's just click the button with text "Create Roster.rosz" or similar
    try:
        page.locator('button').filter(has_text="Create").click()
        page.wait_for_timeout(3000)
    except:
        pass

    page.screenshot(path="/home/jules/verification/screenshots/verification_create_roster.png")

    # Add force
    try:
        page.get_by_role("button", name="Add").click()
        page.wait_for_timeout(2000)
    except:
        pass

    # Click on a category
    try:
        page.locator('th').nth(1).click()
        page.wait_for_timeout(1000)
    except:
        pass

    # Click first 3 units
    try:
        page.locator('.add-unit').nth(0).click()
        page.wait_for_timeout(500)
        page.locator('.add-unit').nth(1).click()
        page.wait_for_timeout(500)
        page.locator('.add-unit').nth(2).click()
        page.wait_for_timeout(1000)
    except:
        pass

    page.screenshot(path="/home/jules/verification/screenshots/verification_units.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()