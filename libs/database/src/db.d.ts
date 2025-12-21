declare const prisma: import("libs/database/generated/prisma/runtime/library").DynamicClientExtensionThis<import("../generated/prisma").Prisma.TypeMap<import("libs/database/generated/prisma/runtime/library").InternalArgs & {
    result: {};
    model: {
        $allModels: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        guild: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        panel: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        panelTemplate: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        ticketPanel: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        ticket: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        formData: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        question: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        buttonData: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
    };
    query: {};
    client: {
        $accelerate: () => {
            invalidate: (input: import("@prisma/extension-accelerate").AccelerateInvalidateInput) => Promise<{
                requestId: string;
            }>;
            invalidateAll: () => Promise<{
                requestId: string;
            }>;
        };
    };
}, {}>, import("../generated/prisma").Prisma.TypeMapCb<{
    log: ("warn" | "error")[];
}>, {
    result: {};
    model: {
        $allModels: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        guild: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        panel: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        panelTemplate: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        ticketPanel: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        ticket: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        formData: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        question: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
        buttonData: {
            aggregate: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "aggregate"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "aggregate">>;
            count: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "count"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "count">>;
            findFirst: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirst"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirst"> | null>;
            findFirstOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findFirstOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findFirstOrThrow">>;
            findMany: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findMany"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args?: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findMany">>;
            findUnique: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUnique"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUnique"> | null>;
            findUniqueOrThrow: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "findUniqueOrThrow"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; } & (ActualArgs extends {
                select: unknown;
                include: unknown;
            } ? "Please either choose `select` or `include`." : ActualArgs extends {
                select: unknown;
                omit: unknown;
            } ? "Please either choose `select` or `omit`." : unknown)) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "findUniqueOrThrow">>;
            groupBy: () => <This, FormalArgs extends import("@prisma/client/runtime/library").Args<This, "groupBy"> & import("@prisma/extension-accelerate").PrismaCacheStrategy, const ActualArgs extends FormalArgs>(this: This, args: { [key in keyof ActualArgs]: key extends keyof FormalArgs ? ActualArgs[key] : never; }) => import("@prisma/extension-accelerate").AcceleratePromise<import("@prisma/client/runtime/library").Result<This, ActualArgs, "groupBy">>;
        };
    };
    query: {};
    client: {
        $accelerate: () => {
            invalidate: (input: import("@prisma/extension-accelerate").AccelerateInvalidateInput) => Promise<{
                requestId: string;
            }>;
            invalidateAll: () => Promise<{
                requestId: string;
            }>;
        };
    };
}>;
import { GuildService } from "./services/guild.service";
import { TicketService } from "./services/ticket.service";
import { PanelService } from "./services/panel.service";
import { FormService } from "./services/form.service";
import { Guild, TicketPanel, Ticket, Panel, FormData } from "../generated/prisma";
export { GuildService, TicketService, PanelService, FormService, type Guild, type TicketPanel, type Ticket, type Panel, type FormData, prisma };
