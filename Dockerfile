# Stage 1: Base - Setup Node.js with pnpm
# Using Alpine Linux for a smaller footprint. Volta specifies node 22.
FROM node:22-alpine AS base
WORKDIR /app
# Enable pnpm via corepack (recommended method).
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
# By copying only package manifests here, we ensure that the following
# dependency installation steps are independent of the source code.
# This means these steps will be cached and skipped if only source code changes.
COPY package.json pnpm-lock.yaml ./

# Stage 2: Production dependencies - Install only runtime dependencies
# This stage installs only the dependencies needed to run the application.
FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

# Stage 3: Build dependencies - Install all dependencies including devDependencies
# This stage installs everything needed to build the application.
FROM base AS build-deps
RUN pnpm install --frozen-lockfile

# Stage 4: Build - Compile the application
# This stage uses all dependencies to build the production bundle.
FROM build-deps AS build
COPY . .
# Pass build-time arguments only for PUBLIC_ variables (embedded in client code).
# Server-side variables (SUPABASE_*, OPENROUTER_*) are now loaded at runtime via process.env
ARG PUBLIC_ENV_NAME=production
ARG PUBLIC_SITE_URL=http://localhost:3000
ENV PUBLIC_ENV_NAME=${PUBLIC_ENV_NAME}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
RUN rm -rf .astro || true
RUN pnpm build

# Stage 5: Runtime - Create the final production image
# This stage contains only what's needed to run the application.
FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/src/server/modules/training/prompts ./dist/server/modules/training/prompts
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
# Use Astro's built-in standalone server (same as `astro preview` but directly via node)
# Environment variables are passed via Docker's --env-file flag
CMD ["node", "./dist/server/entry.mjs"]
