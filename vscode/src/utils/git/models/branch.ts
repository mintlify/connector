import { GitBranchReference, GitRevision } from './reference';

const whitespaceRegex = /\s/;
const detachedHEADRegex = /^(?=.*\bHEAD\b)?(?=.*\bdetached\b).*$/;

export interface GitTrackingState {
    ahead: number;
    behind: number;
}

export class GitBranch implements GitBranchReference {
    static is(branch: any): branch is GitBranch {
        return branch instanceof GitBranch;
    }

    getNameWithoutRemote(): string {
        return this.remote ? this.name.substring(this.name.indexOf('/') + 1) : this.name;
    }

    readonly refType = 'branch';
    readonly detached: boolean;
    readonly id: string;
    readonly upstream?: { name: string; missing: boolean };
    readonly state: GitTrackingState;

    constructor(
        public readonly repoPath: string,
        public readonly name: string,
        public readonly remote: boolean,
        public readonly current: boolean,
        public readonly date: Date | undefined,
        public readonly sha?: string,
        upstream?: { name: string; missing: boolean },
        ahead: number = 0,
        behind: number = 0,
        detached: boolean = false,
        public readonly rebasing: boolean = false,
    ) {
        this.id = `${repoPath}|${remote ? 'remotes/' : 'heads/'}${name}`;

        this.detached = detached || (this.current ? GitBranch.isDetached(name) : false);
        if (this.detached) {
            this.name = GitBranch.formatDetached(this.sha!);
        }

        this.upstream = upstream?.name == null || upstream.name.length === 0 ? undefined : upstream;
        this.state = {
            ahead: ahead,
            behind: behind,
        };
    }

    get ref() {
        return this.detached ? this.sha! : this.name;
    }

    static getNameWithoutRemote(name: string): string {
        return name.substring(name.indexOf('/') + 1);
    }

    static formatDetached(sha: string): string {
        return `(${GitRevision.shorten(sha)}...)`;
    }

    static isDetached(name: string): boolean {
        // If there is whitespace in the name assume this is not a valid branch name
        // Deals with detached HEAD states
        return whitespaceRegex.test(name) || detachedHEADRegex.test(name);
    }
}