# run the TUI
default:
    go run .

alias run := default

# show available recipes
help:
    @just --list cli

# build binary
build:
    go build -o site-cli .

# install to GOPATH/bin
install:
    go install .

# tidy deps
tidy:
    go mod tidy
