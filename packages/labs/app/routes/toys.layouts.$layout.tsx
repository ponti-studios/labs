import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { HorizontalCarousel } from "~/components/toys/layouts/HorizontalCarousel";
import { LayoutShell } from "~/components/toys/layouts/LayoutShell";
import { VerticalMarquee } from "~/components/toys/layouts/VerticalMarquee";
import { isLayoutId, LAYOUTS } from "~/components/toys/layouts/layouts-data";

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const layoutId = params.layout;
  if (isLayoutId(layoutId)) {
    return [
      { title: LAYOUTS[layoutId].metaTitle },
      { name: "description", content: LAYOUTS[layoutId].metaDescription },
    ];
  }
  return [
    { title: "Layouts | Toys" },
    { name: "description", content: "Infinite motion layouts for a streaming slate." },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const layoutId = params.layout;
  if (!isLayoutId(layoutId)) {
    throw new Response("Unknown layout", { status: 404 });
  }
  return { layoutId };
}

export default function ToysLayoutsRoute() {
  const { layoutId } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <LayoutShell layoutId={layoutId}>
      {layoutId === "vertical" ? <VerticalMarquee /> : <HorizontalCarousel />}
    </LayoutShell>
  );
}
