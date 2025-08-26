const puppeteer = require("puppeteer");

async function scrapeInstagramCarousel(url: string) {
	console.log(`Starting to scrape: ${url}`);
	const browser = await puppeteer.launch({
		headless: false,
		executablePath:
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		userDataDir: "./user_data",
		defaultViewport: null,
	});
	console.log("Browser launched");

	const page = await browser.newPage();
	console.log("New page created");
	await page.goto(url, { waitUntil: "networkidle2" });
	console.log(`Navigated to ${url}`);

	// Wait for Instagram carousel container to load
	await page.waitForSelector("article");
	console.log("Article container loaded");

	// Click through the carousel to ensure all images load
	const imageUrls = new Set<string>();
	console.log("Initialized imageUrls Set");

	try {
		console.log("Starting carousel navigation");
		while (true) {
			const images = await page.$$eval(
				"article img",
				(imgs: HTMLImageElement[]) => imgs.map((img) => img.src),
			);
			for (const src of images) {
				imageUrls.add(src);
			}
			console.log(
				`Found ${images.length} images in current view, total unique: ${imageUrls.size}`,
			);

			// Try clicking the next arrow if available
			const nextBtn = await page.$('button[aria-label="Next"]');
			if (nextBtn) {
				console.log("Next button found, clicking...");
				await nextBtn.click();
				await page.waitForTimeout(1000); // wait for next image to load
				console.log("Waited for next image to load");
			} else {
				console.log("Next button not found, ending carousel navigation.");
				break;
			}
		}
	} catch (err) {
		console.error("Error during carousel navigation:", err);
	}

	console.log("Image URLs collected:");
	console.log([...imageUrls]);

	await browser.close();
	console.log("Browser closed");
}

// Replace with the Instagram post URL you want to scrape
const instagramUrl = process.argv[2];

if (!instagramUrl) {
	console.error(
		"Please provide an Instagram post URL as a command-line argument.",
	);
	process.exit(1);
}

scrapeInstagramCarousel(instagramUrl);
