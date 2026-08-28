# show help by default
default:
    @just --list

# dev server
dev:
    pnpm dev

# build for production
build:
    pnpm build

# preview production build
preview:
    pnpm preview

# run tests
test:
    pnpm test

# typecheck
check:
    pnpm exec tsc --noEmit

# fill non-English UI catalogs from en.json, needs GEMINI_API_KEY
i18n-translate:
    pnpm i18n:translate

# fail if any UI catalog is stale or missing keys
i18n-check:
    pnpm i18n:check

# install deps
install:
    pnpm install

# clean build artifacts
clean:
    rm -rf dist .vite

mod cli 'tools/cli'
