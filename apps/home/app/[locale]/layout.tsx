import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Providers from "../../components/providers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <main>
        <Providers>{children}</Providers>
      </main>
    </NextIntlClientProvider>
  );
}
