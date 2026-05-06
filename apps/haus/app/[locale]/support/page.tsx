import type { Metadata } from "next";
import Link from "next/link";

const SUPPORT_ITEMS = [
  {
    title: "Account access",
    copy: "Email code sign-in and passkeys are supported. If you cannot access your account, include the email address you used to sign in.",
  },
  {
    title: "Notes, chats, and uploads",
    copy: "For issues with notes, chat history, files, photos, or voice notes, include the approximate time of the issue and what you were trying to do.",
  },
  {
    title: "Privacy and deletion",
    copy: "You can request account deletion, content deletion, or a privacy review by email.",
  },
];

export const metadata: Metadata = {
  title: "Support | Hakumi",
  description: "Support and contact information for Hakumi by Ponti Studios.",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-6">
          <Link href="/" className="text-sm font-bold uppercase tracking-tight">
            Ponti Studios
          </Link>
          <Link href="/privacy" className="text-sm uppercase tracking-widest text-muted-foreground">
            Privacy
          </Link>
        </div>
      </header>

      <section className="container max-w-4xl py-16 md:py-24">
        <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
          Hakumi Support
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          We can help with Hakumi.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          For app support, privacy requests, account questions, or review inquiries, contact Ponti
          Studios by email. We aim to respond within two business days.
        </p>

        <div className="mt-10 flex flex-col gap-4 border border-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Support email</p>
            <a className="mt-2 block text-2xl font-bold" href="mailto:code@hominem.io">
              code@hominem.io
            </a>
          </div>
          <a
            className="inline-flex items-center justify-center border border-foreground px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
            href="mailto:code@hominem.io?subject=Hakumi%20Support"
          >
            Email support
          </a>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {SUPPORT_ITEMS.map((item) => (
            <div key={item.title} className="border border-border p-5">
              <h2 className="font-bold">{item.title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-8">
          <h2 className="text-2xl font-bold tracking-tight">Helpful Details</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            When reporting a problem, include your device model, iOS version, Hakumi app version,
            the email address on your account, screenshots if relevant, and a short description of
            what happened.
          </p>
        </div>
      </section>
    </main>
  );
}
