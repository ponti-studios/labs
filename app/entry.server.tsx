import "../instrument.server.mjs";
import * as Sentry from "@sentry/react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, type EntryContext, type HandleErrorFunction } from "react-router";

export const instrumentations = [Sentry.createSentryServerInstrumentation()];

export const handleError: HandleErrorFunction = Sentry.createSentryHandleError({
  logErrors: true,
});

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise<Response>((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellReady() {
          shellRendered = true;
          responseHeaders.set("Content-Type", "text/html");
          const body = new PassThrough();
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
          pipe(body);
        },
        onShellError(error) {
          if (!shellRendered) reject(error);
        },
        onError(error) {
          if (shellRendered) Sentry.captureException(error);
        },
      },
    );

    setTimeout(abort, 10_000);
  });
}
