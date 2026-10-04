import { CONTACT_EMAIL } from "~/data/studio";

const LAST_UPDATED = "October 5, 2026";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Thames privacy policy" },
    {
      name: "description",
      content:
        "How Thames, the voice companion for iPhone and Apple Watch, handles your audio, conversations, and data.",
    },
  ];
}

const sections: ReadonlyArray<{ title: string; body: ReadonlyArray<string> }> = [
  {
    title: "What Thames does",
    body: [
      "Thames is a voice companion for iPhone and Apple Watch. You tap to speak, Thames listens, thinks, and answers out loud. It has no accounts, no ads, and no analytics or tracking.",
    ],
  },
  {
    title: "What leaves your device",
    body: [
      "Thames records audio only while you are speaking a turn, using the iPhone microphone or the Apple Watch microphone. A Watch recording is sent to your iPhone over Apple's WatchConnectivity.",
      "When you send a turn, the app sends three things to OpenRouter (openrouter.ai), a service that routes requests to AI models: the audio of your turn, so it can be turned into text; the text of your conversation so far, so a reply can be written; and the reply text, so it can be spoken aloud.",
      "OpenRouter passes these requests to the model providers behind the models Thames uses. At the time of writing these are OpenAI for transcription and replies and Microsoft for speech. Those services handle your data under their own terms and privacy policies. Requests are made with an API key owned by Ponti Studios, and Thames does not add your name or contact details to them.",
      "Temporary audio files are deleted from your device after they have been processed.",
    ],
  },
  {
    title: "What stays on your device",
    body: [
      "Your conversation history, the audio of each reply (so you can play it again), and your choice of voice are stored on your iPhone only. Thames does not sync them through a Thames account, and Ponti Studios operates no server that receives them. Normal iPhone backups, such as iCloud, may include this data.",
    ],
  },
  {
    title: "Permissions",
    body: [
      "Thames asks for microphone access the first time you start speaking. You can turn it off in iPhone Settings, and Thames will keep working for everything except recording.",
    ],
  },
  {
    title: "Deleting your data",
    body: [
      "Hold a conversation in History to delete it, or use Settings, then Advanced, then Delete all saved conversations. Deleting the app removes everything Thames stored on your device. Data already sent to OpenRouter and its providers is governed by their policies.",
    ],
  },
  {
    title: "TestFlight",
    body: [
      "If you install Thames through Apple's TestFlight, Apple may collect crash reports, usage data, and any feedback you choose to send, under Apple's own privacy terms.",
    ],
  },
  {
    title: "Children",
    body: [
      "Thames is not directed to children under 13, and we do not knowingly collect their data.",
    ],
  },
  {
    title: "Changes",
    body: [
      "If this policy changes, the new version will be posted here with a new date. Material changes will also be noted in the app's release notes.",
    ],
  },
];

export default function ThamesPrivacy() {
  return (
    <div className="page-shell">
      <section className="layout-stack">
        <h1 className="heading-hero text-foreground max-w-4xl">Thames privacy policy</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          Last updated {LAST_UPDATED}. Thames is made by Ponti &amp; Co, LLC (Ponti Studios).
        </p>
      </section>

      <section className="section">
        <div className="flex max-w-3xl flex-col">
          {sections.map((section) => (
            <div
              key={section.title}
              className="border-border flex flex-col gap-3 border-t py-8 first:pt-0"
            >
              <h2 className="text-foreground sm:text-2xl">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
          <div className="border-border flex flex-col gap-3 border-t py-8">
            <h2 className="text-foreground sm:text-2xl">Contact</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Questions or requests about this policy:{" "}
              <a
                className="text-foreground underline underline-offset-4"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
