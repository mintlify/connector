import { DateTimeFormat } from "./utils/system/date";

export interface Config {
    defaultDateFormat: DateTimeFormat | string | null;
    defaultDateSource: DateSource;
    defaultDateStyle: DateStyle;
    advanced: AdvancedConfig
}

export interface AdvancedConfig {
    abbreviatedShaLength: number;
    abbreviateShaOnCopy: boolean;
    blame: {
        customArguments: string[] | null;
        delayAfterEdit: number;
        sizeThresholdAfterEdit: number;
    };
    caching: {
        enabled: boolean;
    };
    commitOrdering: 'date' | 'author-date' | 'topo' | null;
    externalDiffTool: string | null;
    externalDirectoryDiffTool: string | null;
    fileHistoryFollowsRenames: boolean;
    fileHistoryShowAllBranches: boolean;
    maxListItems: number;
    maxSearchItems: number;
    messages: {
        suppressCommitHasNoPreviousCommitWarning: boolean;
        suppressCommitNotFoundWarning: boolean;
        suppressCreatePullRequestPrompt: boolean;
        suppressDebugLoggingWarning: boolean;
        suppressFileNotUnderSourceControlWarning: boolean;
        suppressGitDisabledWarning: boolean;
        suppressGitMissingWarning: boolean;
        suppressGitVersionWarning: boolean;
        suppressLineUncommittedWarning: boolean;
        suppressNoRepositoryWarning: boolean;
        suppressRebaseSwitchToTextWarning: boolean;
    };
    quickPick: {
        closeOnFocusOut: boolean;
    };
    repositorySearchDepth: number | null;
    similarityThreshold: number | null;
}

export const enum ViewShowBranchComparison {
    Branch = 'branch',
    Working = 'working',
}

export const enum OutputLevel {
    Silent = 'silent',
    Errors = 'errors',
    Verbose = 'verbose',
    Debug = 'debug',
}

export const enum DateSource {
    Authored = 'authored',
    Committed = 'committed',
}

export const enum DateStyle {
    Absolute = 'absolute',
    Relative = 'relative',
}

export const enum GravatarDefaultStyle {
    Faces = 'wavatar',
    Geometric = 'identicon',
    Monster = 'monsterid',
    MysteryPerson = 'mp',
    Retro = 'retro',
    Robot = 'robohash',
}