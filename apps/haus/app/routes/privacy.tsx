import type { Route } from "./+types/privacy";
import { Link } from "react-router";

const DATA_ROWS = [
  {
    label: "Account information",
    detail:
      "Email address, user ID, and optional profile details used to create and secure your account.",
  },
  {
    label: "User content",
    detail:
      "Notes, chats, uploaded files, photos, audio recordings, and related context you choose to add to Hakumi.",
  },
  {
    label: "Device permissions",
    detail:
      "Camera, microphone, photo library, notifications, Face ID, and media metadata are used only when you choose features that need them.",
  },
  {
    label: "Diagnostics and analytics",
    detail:
      "Crash reports, performance data, and product interaction events may be used to keep the app reliable and improve the experience.",
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "Privacy Policy | Hakumi" },
  {
    name: "description",
    content: "Privacy policy for Hakumi, a notes-first personal workspace by Ponti Studios.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-6">
          <Link to="/" className="text-sm font-bold uppercase tracking-tight">
            Ponti Studios
          </Link>
          <Link to="/support" className="text-sm uppercase tracking-widest text-muted-foreground">
            Support
          </Link>
        </div>
      </header>

      <article className="container max-w-4xl py-16 md:py-24">
        <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
          Hakumi Privacy Policy
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Privacy for your notes, chats, and personal workspace.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          Effective date: April 22, 2026. Hakumi is operated by Ponti Studios. This policy explains
          what we collect, why we collect it, and how to contact us.
        </p>

        <section className="mt-14 space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Information We Collect</h2>
            <div className="mt-6 grid gap-4">
              {DATA_ROWS.map((row) => (
                <div key={row.label} className="border border-border p-5">
                  <h3 className="font-bold">{row.label}</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{row.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">How We Use Information</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              We use information to provide Hakumi, authenticate users, save and retrieve user
              content, process uploads, transcribe voice notes, generate AI-assisted responses,
              secure the service, debug problems, and improve product quality.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">AI Features</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Hakumi includes AI-assisted chat and voice features. When you use those features, your
              prompts, selected notes, files, audio, and conversation context may be processed by
              service providers that help deliver transcription, generation, storage, analytics, and
              infrastructure.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sharing and Tracking</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              We do not sell personal information. We do not use Hakumi data for third-party
              advertising or data broker tracking. We may share information with vendors who operate
              the app, host data, send authentication emails, monitor reliability, provide
              analytics, or deliver AI features.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Retention and Deletion</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              We retain account data and user content for as long as needed to provide the service,
              comply with legal obligations, resolve disputes, and maintain security. You can
              request account or data deletion by contacting support.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Security</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              We use reasonable technical and organizational safeguards to protect user data. No
              internet service can be guaranteed perfectly secure, but we work to protect Hakumi
              data against unauthorized access, misuse, loss, and alteration.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contact</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              For privacy questions or deletion requests, email{" "}
              <a className="underline underline-offset-4" href="mailto:code@hominem.io">
                code@hominem.io
              </a>
              .
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
