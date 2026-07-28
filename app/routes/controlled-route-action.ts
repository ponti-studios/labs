export interface ControlledRouteAction<TRequest, TResponse> {
  action(args: { request: Request }): Promise<TResponse>;
  getRequests(): TRequest[];
  reset(): void;
  resolveNext(data: TResponse): void;
}

export function createControlledRouteAction<TRequest, TResponse>(options: {
  parseRequest(request: Request): Promise<TRequest>;
}): ControlledRouteAction<TRequest, TResponse> {
  const pendingResolvers: Array<(value: TResponse) => void> = [];
  const requests: TRequest[] = [];

  return {
    async action({ request }) {
      const parsedRequest = await options.parseRequest(request);
      requests.push(parsedRequest);

      return await new Promise<TResponse>((resolve) => {
        pendingResolvers.push(resolve);
      });
    },
    getRequests() {
      return [...requests];
    },
    reset() {
      requests.length = 0;
      pendingResolvers.length = 0;
    },
    resolveNext(data) {
      const nextResolver = pendingResolvers.shift();

      if (!nextResolver) {
        throw new Error("No pending route action request to resolve");
      }

      nextResolver(data);
    },
  };
}
