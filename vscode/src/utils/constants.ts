export const enum Schemes {
    DebugConsole = 'debug',
    File = 'file',
    Git = 'git',
    GitHub = 'github',
    GitLens = 'gitlens',
    Output = 'output',
    PRs = 'pr',
    Vsls = 'vsls',
    VslsScc = 'vsls-scc',
    Virtual = 'vscode-vfs',
}

export const enum CharCode {
    /**
     * The `/` character.
     */
    Slash = 47,
    /**
     * The `\` character.
     */
    Backslash = 92,
    A = 65,
    Z = 90,
    a = 97,
    z = 122,
}

export const enum GlyphChars {
    AngleBracketLeftHeavy = '\u2770',
    AngleBracketRightHeavy = '\u2771',
    ArrowBack = '\u21a9',
    ArrowDown = '\u2193',
    ArrowDownUp = '\u21F5',
    ArrowDropRight = '\u2937',
    ArrowHeadRight = '\u27A4',
    ArrowLeft = '\u2190',
    ArrowLeftDouble = '\u21d0',
    ArrowLeftRight = '\u2194',
    ArrowLeftRightDouble = '\u21d4',
    ArrowLeftRightDoubleStrike = '\u21ce',
    ArrowLeftRightLong = '\u27f7',
    ArrowRight = '\u2192',
    ArrowRightDouble = '\u21d2',
    ArrowRightHollow = '\u21e8',
    ArrowUp = '\u2191',
    ArrowUpDown = '\u21C5',
    ArrowUpRight = '\u2197',
    ArrowsHalfLeftRight = '\u21cb',
    ArrowsHalfRightLeft = '\u21cc',
    ArrowsLeftRight = '\u21c6',
    ArrowsRightLeft = '\u21c4',
    Asterisk = '\u2217',
    Check = '✔',
    Dash = '\u2014',
    Dot = '\u2022',
    Ellipsis = '\u2026',
    EnDash = '\u2013',
    Envelope = '\u2709',
    EqualsTriple = '\u2261',
    Flag = '\u2691',
    FlagHollow = '\u2690',
    MiddleEllipsis = '\u22EF',
    MuchLessThan = '\u226A',
    MuchGreaterThan = '\u226B',
    Pencil = '\u270E',
    Space = '\u00a0',
    SpaceThin = '\u2009',
    SpaceThinnest = '\u200A',
    SquareWithBottomShadow = '\u274F',
    SquareWithTopShadow = '\u2750',
    Warning = '\u26a0',
    ZeroWidthSpace = '\u200b',
}

// ToDO - change to mintlify
export const enum Colors {
    GutterBackgroundColor = 'gitlens.gutterBackgroundColor',
    GutterForegroundColor = 'gitlens.gutterForegroundColor',
    GutterUncommittedForegroundColor = 'gitlens.gutterUncommittedForegroundColor',
    TrailingLineBackgroundColor = 'gitlens.trailingLineBackgroundColor',
    TrailingLineForegroundColor = 'gitlens.trailingLineForegroundColor',
    LineHighlightBackgroundColor = 'gitlens.lineHighlightBackgroundColor',
    LineHighlightOverviewRulerColor = 'gitlens.lineHighlightOverviewRulerColor',
    ClosedAutolinkedIssueIconColor = 'gitlens.closedAutolinkedIssueIconColor',
    ClosedPullRequestIconColor = 'gitlens.closedPullRequestIconColor',
    OpenAutolinkedIssueIconColor = 'gitlens.openAutolinkedIssueIconColor',
    OpenPullRequestIconColor = 'gitlens.openPullRequestIconColor',
    MergedPullRequestIconColor = 'gitlens.mergedPullRequestIconColor',
    UnpublishedChangesIconColor = 'gitlens.unpublishedChangesIconColor',
    UnpublishedCommitIconColor = 'gitlens.unpublishedCommitIconColor',
    UnpulledChangesIconColor = 'gitlens.unpulledChangesIconColor',
}