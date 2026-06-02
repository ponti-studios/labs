import { Link } from "react-router";
import { ArrowRight, Calculator, Clock3, Target } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pontistudios/ui";

const businessTools = [
  {
    name: "Marketing Spend Calculator",
    path: "/business-tools/marketing",
    description: "Model the clicks and spend required to hit a concrete attendee target.",
    status: "Available now",
    cta: "Open calculator",
    icon: Calculator,
    highlights: ["Attendee goal planning", "Conversion sensitivity", "Budget-ready output"],
    available: true,
  },
  {
    name: "Runway Planner",
    path: "/business-tools/runway",
    description: "Forecast cash runway, pressure-test burn, and plan your next operating window.",
    status: "Coming soon",
    cta: "In design",
    icon: Clock3,
    highlights: ["Cash runway", "Burn tracking", "Scenario planning"],
    available: false,
  },
] as const;

const workflow = [
  {
    title: "Start with the target",
    body: "Pick the business outcome first so the numbers answer a real operating question.",
  },
  {
    title: "Adjust one lever at a time",
    body: "Use conversion and CPC changes to see which assumption actually moves the budget.",
  },
  {
    title: "Turn output into a decision",
    body: "Use the result as a planning input for spend, pacing, and channel expectations.",
  },
] as const;

export default function BusinessToolsHub() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 md:px-6 md:py-12">
        <section className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="max-w-3xl">
            <div className="ui-eyebrow">Business tools</div>
            <h1 className="mt-3">Operator-grade planning tools for fast decisions.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              The business tools workspace turns rough assumptions into structured answers you can
              use in planning conversations, budget reviews, and growth experiments.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link to="/business-tools/marketing">
                  Open marketing calculator
                  <ArrowRight />
                </Link>
              </Button>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Responsive layouts</Badge>
                <Badge variant="secondary">Clear assumptions</Badge>
                <Badge variant="secondary">Actionable output</Badge>
              </div>
            </div>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <div className="ui-eyebrow">What this area is for</div>
              <CardTitle className="text-xl">
                Built for crisp planning, not dashboard theater.
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground">
                Each tool is designed to answer one practical question with enough context to act on
                the result immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="ui-eyebrow">Current focus</div>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Early-stage marketing and finance planning for small teams making fast tradeoffs.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                <Target className="mt-0.5 size-4 text-muted-foreground" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Start with a goal, pressure-test assumptions, and leave with a number you can use.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <div>
            <div className="ui-eyebrow">Available tools</div>
            <h2 className="mt-2">A tighter, more usable tools library.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {businessTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Card key={tool.name} className="flex h-full flex-col">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-border bg-muted/50 p-2">
                          <Icon className="size-4 text-foreground" />
                        </div>
                        <div>
                          <div className="ui-eyebrow">{tool.status}</div>
                          <CardTitle className="mt-2 text-2xl">{tool.name}</CardTitle>
                        </div>
                      </div>
                      <Badge variant={tool.available ? "default" : "outline"}>{tool.status}</Badge>
                    </div>
                    <CardDescription className="max-w-[60ch] text-base leading-7 text-muted-foreground">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-0">
                    <div className="grid gap-3">
                      {tool.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3"
                        >
                          <div className="size-1.5 rounded-full bg-foreground/70" />
                          <span className="text-sm text-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {tool.available ? (
                      <Button asChild className="w-full sm:w-auto">
                        <Link to={tool.path}>
                          {tool.cta}
                          <ArrowRight />
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled variant="outline" className="w-full sm:w-auto">
                        {tool.cta}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-5 border-t border-border pt-10">
          <div>
            <div className="ui-eyebrow">Working style</div>
            <h2 className="mt-2">How these tools are meant to be used.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((item, index) => (
              <Card key={item.title}>
                <CardHeader>
                  <div className="ui-eyebrow">Step {index + 1}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="max-w-[56ch] text-sm leading-6 text-muted-foreground">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
