/* eslint-disable no-restricted-imports */
'use strict';
import * as path from 'path';
import * as querystring from 'querystring';
import * as gitUrlParse from 'git-url-parse';

const useCommitSHAInURL = false;

/*
GitUrl The GitUrl object containing:
protocols (Array): An array with the url protocols (usually it has one element).
port (null|Number): The domain port.
resource (String): The url domain (including subdomains).
user (String): The authentication user (usually for ssh urls).
pathname (String): The url pathname.
hash (String): The url hash.
search (String): The url querystring value.
href (String): The input url.
protocol (String): The git url protocol.
token (String): The oauth token (could appear in the https urls).
source (String): The Git provider (e.g. "github.com").
owner (String): The repository owner.
name (String): The repository name.
ref (String): The repository ref (e.g., "master" or "dev").
filepath (String): A filepath relative to the repository root.
filepathtype (String): The type of filepath in the url ("blob" or "tree").
full_name (String): The owner and name values in the owner/name format.
toString (Function): A function to stringify the parsed url into another url type.
organization (String): The organization the owner belongs to. This is CloudForge specific.
git_suffix (Boolean): Whether to add the .git suffix or not.
*/
type GitUrl = {
	protocols: Array<any>;
	port: null | number;
	resource: string;
	user: string;
	pathname: string;
	hash: string;
	search: string;
	href: string;
	protocol: string;
	token: string;
	source: string;
	owner: string;
	name: string;
	ref: string;
	filepath: string;
	filepathtype: string;
	full_name: string;
	toString: any;
	organization: string;
	git_suffix: boolean;
};

export class BaseProvider {
	name: string;
	gitUrl: GitUrl;
	sha: any;
	constructor(gitUrl: GitUrl, sha: any) {
		this.gitUrl = gitUrl;
		this.sha = sha;
		this.name = '';
	}

	get baseUrl() {
		return this.gitUrl.toString(providerProtocol).replace(/(\.git)$/, '');
	}

	/**
	 * Get the Web URL.
	 *
	 * @param {string} branch
	 * @param {string} filePath The file path relative to repository root, beginning with '/'.
	 * @param {number} line
	 * @param {number} endLine The last line in a multi-line selection
	 * @return {string} The URL to be opened with the browser.
	 */
	webUrl(branch: string, filePath: string, line?: number, endLine?: number): string {
		return '';
	}
}

class GitHub extends BaseProvider {
	constructor(gitUrl: GitUrl, sha: any) {
		super(gitUrl, sha);
		this.name = 'github';
	}
	override webUrl(branch: string, filePath: string, line: number, endLine: number): string {
		let blob = branch;
		if (useCommitSHAInURL) {
			blob = this.sha;
		}
		if (filePath) {
			return `${this.baseUrl}/blob/${blob}${filePath}${line ? `#L${line}` : ''}${endLine ? `-L${endLine}` : ''}`;
		}
		return `${this.baseUrl}/tree/${blob}`;
	}
}

class GitLab extends BaseProvider {
	constructor(gitUrl: GitUrl, sha: any) {
		super(gitUrl, sha);
		this.name = 'gitlab';
	}
	override webUrl(branch: string, filePath: string, line: number, endLine: number): string {
		if (filePath) {
			return `${this.baseUrl}/blob/${branch}${filePath ? `${filePath}` : ''}${line ? `#L${line}` : ''}`;
		}
		return `${this.baseUrl}/tree/${branch}`;
	}
}

class Gitea extends BaseProvider {
	constructor(gitUrl: GitUrl, sha: any) {
		super(gitUrl, sha);
		this.name = 'gitea';
	}
	override webUrl(branch: string, filePath: string, line: number, endLine: number): string {
		let blobPath = `branch/${branch}`;
		if (useCommitSHAInURL) {
			blobPath = `commit/${this.sha}`;
		}
		if (filePath) {
			return `${this.baseUrl}/src/${blobPath}${filePath ? `${filePath}` : ''}${line ? `#L${line}` : ''}`;
		}
		return `${this.baseUrl}/src/${blobPath}`;
	}
}

class Bitbucket extends BaseProvider {
	constructor(gitUrl: GitUrl, sha: any) {
		super(gitUrl, sha);
		this.name = 'bitbucket';
	}
	override webUrl(branch: string, filePath: string, line: number, endLine: number): string {
		const fileName = path.basename(filePath);
		return `${this.baseUrl}/src/${this.sha}${filePath ? `${filePath}` : ''}${line ? `#${fileName}-${line}` : ''}`;
	}
}

class VisualStudio extends BaseProvider {
	constructor(gitUrl: GitUrl, sha: any) {
		super(gitUrl, sha);
		this.name = 'visualstudio';
	}
	override get baseUrl() {
		return `https://${this.gitUrl.resource}${this.gitUrl.pathname}`.replace(/\.git/, '');
	}

	override webUrl(branch: string, filePath: string, line: number, endLine: number): string {
		const query: any = {
			version: `GB${branch}`,
		};
		if (filePath) {
			query['path'] = filePath;
		}
		if (line) {
			query['line'] = line;
		}
		return `${this.baseUrl}?${querystring.stringify(query)}`;
	}
}

const gitHubDomain = 'github.com';
const giteaDomain = 'gitea.io';
const providerProtocol = 'https';

const providers = {
	[gitHubDomain]: GitHub,
	'gitlab.com': GitLab,
	[giteaDomain]: Gitea,
	'bitbucket.org': Bitbucket,
	'visualstudio.com': VisualStudio,
};

/**
 * Get the Git provider of the remote URL.
 *
 * @param {string} remoteUrl
 * @return {BaseProvider|null}
 */
export const gitProvider = (remoteUrl: string, sha: any): BaseProvider | null => {
	const gitUrl: GitUrl = gitUrlParse(remoteUrl);
	for (const domain of Object.keys(providers)) {
		if (domain === gitUrl.resource || domain === gitUrl.source) {
			return new (providers as any)[domain](gitUrl, sha);
		}
	}
	throw new Error('unknown Provider');
};
