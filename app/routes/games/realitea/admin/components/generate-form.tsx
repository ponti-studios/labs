import {
  DatePicker,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@ponti-studios/ui/forms";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
} from "@ponti-studios/ui/primitives";
import { useState } from "react";

import type { GenerateSourceMode } from "~/lib/realitea/admin/generate";

import styles from "./generate-form.module.css";

export const CUSTOM_PROMPT = "custom";

export type GenerateFormValues = {
  gameSlug: string;
  dateKey: string;
  models: string[];
  promptFiles: readonly string[];
  topics: { id: number; slug: string; name: string }[];
  articles: { id: number; title: string }[];
  fixtures: string[];
};

export function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function keyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function GenerateForm({
  data,
  running,
  onSubmit,
}: {
  data: GenerateFormValues;
  running: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [sourceMode, setSourceMode] = useState<GenerateSourceMode>("inventory");
  const [dateKey, setDateKey] = useState(data.dateKey);
  const [feedId, setFeedId] = useState(String(data.topics[0]?.id ?? ""));
  const [articleId, setArticleId] = useState(String(data.articles[0]?.id ?? ""));
  const [fixtureId, setFixtureId] = useState("none");
  const [promptChoice, setPromptChoice] = useState(data.promptFiles[0] ?? CUSTOM_PROMPT);
  const [model, setModel] = useState(data.models[0] ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>What should we try?</CardTitle>
        <CardDescription>
          Pick the stories and the prompt. Then wait while the model invents answers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input type="hidden" name="game" value={data.gameSlug} />
          <input type="hidden" name="dateKey" value={dateKey} />
          <div className={styles.field}>
            <DatePicker
              id="dateKey"
              label="Puzzle date"
              placeholder="Pick a date"
              value={dateFromKey(dateKey)}
              onSelect={(date) => {
                if (date) setDateKey(keyFromDate(date));
              }}
            />
            <p className="text-muted-foreground text-xs">
              The calendar day this draft is aimed at. It does not replace that day’s live puzzle.
            </p>
          </div>
          <div className={styles.field}>
            <Label htmlFor="sourceMode">Where should the stories come from?</Label>
            <input type="hidden" name="sourceMode" value={sourceMode} />
            <Select
              value={sourceMode}
              onValueChange={(value) => {
                if (value) setSourceMode(value as GenerateSourceMode);
              }}
            >
              <SelectTrigger id="sourceMode" className={styles.trigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">This topic’s unused articles</SelectItem>
                <SelectItem value="feeds">Specific topic IDs</SelectItem>
                <SelectItem value="articles">Specific article IDs</SelectItem>
                <SelectItem value="rss">A live RSS feed (review only)</SelectItem>
                <SelectItem value="fixtures">A saved test fixture (review only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {sourceMode === "feeds" ? (
            data.topics.length === 0 ? (
              <p className="text-muted-foreground text-sm">No topics available.</p>
            ) : (
              <div className={styles.field}>
                <Label htmlFor="feedIds">Topic</Label>
                <input type="hidden" name="feedIds" value={feedId} />
                <Select value={feedId} onValueChange={(value) => value && setFeedId(value)}>
                  <SelectTrigger id="feedIds" className={styles.trigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.topics.map((topic) => (
                      <SelectItem key={topic.id} value={String(topic.id)}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          ) : null}
          {sourceMode === "articles" ? (
            data.articles.length === 0 ? (
              <p className="text-muted-foreground text-sm">No unused articles in inventory.</p>
            ) : (
              <div className={styles.articleField}>
                <Label htmlFor="articleIds">Article</Label>
                <input type="hidden" name="articleIds" value={articleId} />
                <Select value={articleId} onValueChange={(value) => value && setArticleId(value)}>
                  <SelectTrigger id="articleIds" className={styles.articleTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={styles.articleMenu}>
                    {data.articles.map((article) => (
                      <SelectItem
                        key={article.id}
                        value={String(article.id)}
                        title={article.title}
                        className={styles.articleItem}
                      >
                        {article.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          ) : null}
          {sourceMode === "rss" ? (
            <div className={styles.field}>
              <Label htmlFor="feedUrl">RSS URL</Label>
              <Input id="feedUrl" name="feedUrl" placeholder="https://" />
              <p className="text-muted-foreground text-xs">
                Review only. Ingest the story before it can become a published puzzle.
              </p>
            </div>
          ) : null}
          {sourceMode === "fixtures" ? (
            <div className={styles.field}>
              <Label htmlFor="fixtureId">Saved fixture</Label>
              <input type="hidden" name="fixtureId" value={fixtureId} />
              <Select value={fixtureId} onValueChange={(value) => value && setFixtureId(value)}>
                <SelectTrigger id="fixtureId" className={styles.trigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choose a fixture</SelectItem>
                  {data.fixtures.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className={styles.field}>
            <Label htmlFor="promptChoice">Prompt</Label>
            <input type="hidden" name="promptChoice" value={promptChoice} />
            <Select value={promptChoice} onValueChange={(value) => value && setPromptChoice(value)}>
              <SelectTrigger id="promptChoice" className={styles.trigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.promptFiles.map((path) => (
                  <SelectItem key={path} value={path}>
                    {path.replace("app/lib/prompts/", "")}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_PROMPT}>Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <input
            type="hidden"
            name="promptSource"
            value={promptChoice === CUSTOM_PROMPT ? "paste" : "file"}
          />
          {promptChoice !== CUSTOM_PROMPT ? (
            <input type="hidden" name="promptPath" value={promptChoice} />
          ) : (
            <div className={styles.field}>
              <Label htmlFor="promptText">Custom prompt</Label>
              <Textarea id="promptText" name="promptText" rows={5} className="font-mono" />
            </div>
          )}
          <div className={styles.field}>
            <Label htmlFor="model">Model</Label>
            <input type="hidden" name="model" value={model} />
            <Select value={model} onValueChange={(value) => value && setModel(value)}>
              <SelectTrigger id="model" className={styles.trigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.models.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-fit" isLoading={running} disabled={running}>
            {running ? "Generating" : "Generate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
