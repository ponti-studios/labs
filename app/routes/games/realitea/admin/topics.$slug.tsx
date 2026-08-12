import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ponti-studios/ui/data-display";
import { EmptyState } from "@ponti-studios/ui/feedback";
import { SectionIntro } from "@ponti-studios/ui/layout";
import { Button, StatusBadge, type StatusBadgeConfig } from "@ponti-studios/ui/primitives";
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { loadAdminTopicArticles, refreshTopicArticlesBySlug } from "~/lib/realitea/admin/articles.server";
import { getRealiteaAdminActor } from "~/lib/realitea/admin/auth";
import { articleStatusValues, isArticleStatus, type ArticleStatus } from "~/lib/realitea/article-status";
import { assertSameOrigin } from "~/lib/server/origin";

import "../realitea.css";

const ARTICLE_STATUS: Record<ArticleStatus, StatusBadgeConfig> = {
  pending: { label: "Pending", variant: "outline" },
  used: { label: "Used", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  expired: { label: "Expired", variant: "secondary" },
};

export function meta() {
  return [{ title: "RealiTea articles" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const slug = params.slug;
  if (!slug) throw Response.json({ error: "Missing topic" }, { status: 400 });

  const statusParam = new URL(request.url).searchParams.get("status");
  const status = statusParam && isArticleStatus(statusParam) ? statusParam : undefined;
  const detail = await loadAdminTopicArticles(slug, status);
  if (!detail) throw Response.json({ error: "Topic not found" }, { status: 404 });
  return { ...detail, status: status ?? "all" };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const originDenied = assertSameOrigin(request);
  if (originDenied) return originDenied;

  const auth = getRealiteaAdminActor(context);
  const slug = params.slug ?? "";
  const result = await refreshTopicArticlesBySlug(slug, auth.userId);
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }
  return {
    ok: true as const,
    inserted: result.inserted,
    scanned: result.scanned,
    expired: result.expired,
  };
}

function formatPublishedAt(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function RealiTeaAdminTopicArticles() {
  const { topic, articles, status } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const data = fetcher.data;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/games/realitea/admin/topics">← Topics</Link>
      </Button>

      <SectionIntro
        eyebrow="Articles"
        title={topic.name}
        description={`${topic.feedLabel} · ${topic.counts.pending} pending · ${topic.counts.used} used`}
        actions={
          <fetcher.Form method="post">
            <Button type="submit" disabled={busy} isLoading={busy}>
              Refresh feed
            </Button>
          </fetcher.Form>
        }
      />

      {data && "ok" in data && data.ok ? (
        <p className="text-muted-foreground text-sm">
          Pulled {data.scanned} feed items · {data.inserted} new · {data.expired} expired pending.
        </p>
      ) : null}
      {data && "ok" in data && !data.ok ? (
        <p className="text-destructive text-sm">{data.error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(["all", ...articleStatusValues] as const).map((value) => {
          const href =
            value === "all"
              ? `/games/realitea/admin/topics/${topic.slug}`
              : `/games/realitea/admin/topics/${topic.slug}?status=${value}`;
          const current = searchParams.get("status") ?? "all";
          const active = current === value || (value === "all" && status === "all");
          return (
            <Button key={value} asChild size="sm" variant={active ? "default" : "outline"}>
              <Link to={href}>{value}</Link>
            </Button>
          );
        })}
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="No articles"
          description="Refresh the feed to pull stories into this topic."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Text</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <a
                    href={article.url}
                    className="text-primary font-medium underline-offset-4 hover:underline"
                  >
                    {article.title}
                  </a>
                </TableCell>
                <TableCell>
                  <StatusBadge status={article.status} config={ARTICLE_STATUS} />
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatPublishedAt(article.publishedAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">{article.articleTextLength}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
