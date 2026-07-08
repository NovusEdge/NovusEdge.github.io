// TLink / TNavLink used to drive a custom overlay transition; that proved fragile across
// browsers, so the page transition now lives in App (a CSS fade-up keyed per route). These
// stay as plain aliases so call sites don't need to change.
export { Link as TLink, NavLink as TNavLink } from 'react-router'
