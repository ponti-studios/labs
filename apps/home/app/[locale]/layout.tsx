import cn from "classnames";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { AsciiGlobe } from "../../components/ascii-globe";
import { NavigationProgress } from "../../components/navigation-progress";
import Providers from "../../components/providers";
import "../globals.css";

const defaultMeta = {
	title: "Ponti Studios",
	siteName: "Ponti Studios",
	description:
		"A studio that builds, integrates, and designs AI for small, medium, and large businesses.",
	url: "https://ponti.io",
	type: "website",
	robots: "follow, index",
	image: "https://ponti.io/favicon/large-og.jpg",
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Ponti Studios",
	description:
		"A studio that builds, integrates, and designs AI for small, medium, and large businesses.",
};

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const messages = await getMessages();
	const t = await getTranslations("Navigation");

	return (
		<html lang={locale} className={`${geist.variable} ${geistMono.variable}`}>
			<body
				className={cn(
					geist.variable,
					geistMono.variable,
					"antialiased bg-bg-app text-primary min-w-full font-sans selection:bg-primary selection:text-bg-panel-0",
				)}
			>
				<NextIntlClientProvider messages={messages}>
					<AsciiGlobe />
					<NavigationProgress />
					<nav className="w-full fixed flex justify-between items-center top-0 z-50 px-6 py-6 text-primary">
						<a
							className="text-lg font-bold tracking-tight hover:opacity-70 transition-opacity"
							href="/"
						>
							{t("home")}
						</a>
						<a
							href="mailto:hello@ponti.io"
							className="text-sm font-medium hover:underline underline-offset-4"
						>
							{t("contact")}
						</a>
					</nav>

					<main className="w-full max-w-screen-xl mx-auto z-10 relative flex flex-col items-center min-h-screen">
						<Providers>{children}</Providers>
					</main>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

const favicons = [
	{
		rel: "apple-touch-icon",
		sizes: "57x57",
		href: "/favicon/apple-icon-57x57.png",
	},
	{
		rel: "apple-touch-icon",
		sizes: "60x60",
		href: "/favicon/apple-icon-60x60.png",
	},
	{
		rel: "apple-touch-icon",
		sizes: "72x72",
		href: "/favicon/apple-icon-72x72.png",
	},
	{
		rel: "apple-touch-icon",
		sizes: "76x76",
		href: "/favicon/apple-icon-76x76.png",
	},
	{
		rel: "apple-touch-icon",
		sizes: "114x114",
		href: "/favicon/apple-icon-114x114.png",
	},
	{
		rel: "apple-touch-icon",
		sizes: "120x120",
		href: "/favicon/apple-icon-120x120.png",
	},
	{
		rel: "apple-touch-icon",
		sizes: "144x144",
		href: "/favicon/apple-icon-144x144.png",
	},
	{
		rel: "apple-touch-icon",
		sizes: "152x152",
		href: "/favicon/apple-icon-152x152.png",
	},
	{
		rel: "apple-touch-icon",
		sizes: "180x180",
		href: "/favicon/apple-icon-180x180.png",
	},
	{
		rel: "icon",
		type: "image/png",
		sizes: "192x192",
		href: "/favicon/android-icon-192x192.png",
	},
	{
		rel: "icon",
		type: "image/png",
		sizes: "32x32",
		href: "/favicon/favicon-32x32.png",
	},
	{
		rel: "icon",
		type: "image/png",
		sizes: "96x96",
		href: "/favicon/favicon-96x96.png",
	},
	{
		rel: "icon",
		type: "image/png",
		sizes: "16x16",
		href: "/favicon/favicon-16x16.png",
	},
	{
		rel: "manifest",
		href: "/favicon/manifest.json",
	},
];
