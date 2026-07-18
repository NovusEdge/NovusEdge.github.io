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

# install deps
install:
    pnpm install

# clean build artifacts
clean:
    rm -rf dist .vite
