package tui

import "charm.land/bubbles/v2/key"

// keyMap implements help.KeyMap. Navigation and filter bindings are display
// only: the list handles those keys itself.
type keyMap struct {
	Nav     key.Binding
	Filter  key.Binding
	Detail  key.Binding
	Back    key.Binding
	Edit    key.Binding
	Tags    key.Binding
	Thumb   key.Binding
	Publish key.Binding
	Trans   key.Binding
	NewPost key.Binding
	NewBlip key.Binding
	NewCard key.Binding
	Help    key.Binding
	Quit    key.Binding
}

func newKeyMap() keyMap {
	b := func(keys, k, desc string) key.Binding {
		return key.NewBinding(key.WithKeys(keys), key.WithHelp(k, desc))
	}
	return keyMap{
		Nav:     key.NewBinding(key.WithKeys("up", "down"), key.WithHelp("↑/↓", "move")),
		Filter:  b("/", "/", "filter"),
		Detail:  b("enter", "enter", "details"),
		Back:    b("esc", "esc", "back"),
		Edit:    b("e", "e", "edit"),
		Tags:    b("t", "t", "tags"),
		Thumb:   b("i", "i", "thumb"),
		Publish: b("p", "p", "publish"),
		Trans:   b("T", "T", "translate"),
		NewPost: b("n", "n", "post"),
		NewBlip: b("b", "b", "blip"),
		NewCard: b("r", "r", "research"),
		Help:    b("?", "?", "help"),
		Quit:    key.NewBinding(key.WithKeys("q", "ctrl+c"), key.WithHelp("q", "quit")),
	}
}

func (k keyMap) ShortHelp() []key.Binding {
	// Help and Quit lead: help.View truncates from the right on narrow terminals.
	return []key.Binding{k.Help, k.Quit, k.Edit, k.Tags, k.Thumb, k.Publish, k.Trans, k.NewPost, k.NewBlip, k.NewCard}
}

func (k keyMap) FullHelp() [][]key.Binding {
	return [][]key.Binding{
		{k.Nav, k.Filter, k.Detail, k.Back},
		{k.Edit, k.Tags, k.Thumb, k.Publish},
		{k.Trans, k.NewPost, k.NewBlip, k.NewCard},
		{k.Help, k.Quit},
	}
}
