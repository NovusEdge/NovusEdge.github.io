package tui

// backMsg is emitted by any screen that wants to return to the main menu,
// optionally carrying a status line (and whether it represents an error) to
// show on the menu afterwards.
type backMsg struct {
	status string
	isErr  bool
}

func toMenu(status string, isErr bool) backMsg {
	return backMsg{status: status, isErr: isErr}
}
