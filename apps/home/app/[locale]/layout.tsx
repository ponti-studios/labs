import cn from "classnames";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { AsciiGlobe } from "../../components/ascii-globe";
import { NavigationProgress } from "../../components/navigation-progress";
import Providers from "../../components/providers";
import "../../styles/globals.css";

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist",
	display: "swap",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
	display: "swap",
});

const fraunces = Fraunces({
	subsets: ["latin"],
	variable: "--font-serif",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Ponti Studios",
	description:
		"A studio that builds, integrates, and designs AI for small, medium, and large businesses.",
	icons: {
		icon: [
			{ url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
			{ url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{
				url: "/favicon/android-icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
		],
		apple: [
			{
				url: "/favicon/apple-icon-57x57.png",
				sizes: "57x57",
				type: "image/png",
			},
			{
				url: "/favicon/apple-icon-60x60.png",
				sizes: "60x60",
				type: "image/png",
			},
			{
				url: "/favicon/apple-icon-72x72.png",
				sizes: "72x72",
				type: "image/png",
			},
			{
				url: "/favicon/apple-icon-76x76.png",
				sizes: "76x76",
				type: "image/png",
			},
			{
				url: "/favicon/apple-icon-114x114.png",
				sizes: "114x114",
				type: "image/png",
			},
			{
				url: "/favicon/apple-icon-120x120.png",
				sizes: "120x120",
				type: "image/png",
			},
			{
				url: "/favicon/apple-icon-144x144.png",
				sizes: "144x144",
				type: "image/png",
			},
			{
				url: "/favicon/apple-icon-152x152.png",
				sizes: "152x152",
				type: "image/png",
			},
			{
				url: "/favicon/apple-icon-180x180.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	},
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
		<html
			lang={locale}
			className={`${geist.variable} ${geistMono.variable} ${fraunces.variable}`}
		>
			<body
				className={cn(
					geist.variable,
					geistMono.variable,
					fraunces.variable,
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
