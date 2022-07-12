import * as vscode from 'vscode';
import * as findParentDir from 'find-parent-dir';
import * as fs from 'fs';
import * as path from 'path';
import * as ini from 'ini';
import * as gitRev from 'git-rev-2';

import gitProvider, { BaseProvider } from './gitProvider';
import { ViewProvider } from '../../viewProvider';

const window = vscode.window;

const locateGitConfig = (repoDir: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		fs.lstat(path.join(repoDir, '.git'), (err, stat) => {
			if (err) {
				reject(err);
			}
			if (stat.isFile()) {
				// .git may be a file, similar to symbolic link, containing "gitdir: <relative path to git dir>""
				// this happens in gitsubmodules
				fs.readFile(path.join(repoDir, '.git'), 'utf-8', (err, data) => {
					if (err) {
						reject(err);
					}

					const matchArray: RegExpMatchArray | null = data.match(/gitdir: (.*)/);
					let match = '';
					if (matchArray) {
						match = matchArray[1];
					}
					if (!match) {
						reject('Unable to find gitdir in .git file');
					}
					let configPath = path.join(repoDir, match, 'config');

					// for worktrees traverse up to the main .git folder
					const workTreeMatch = match.match(/\.git\/worktrees*/);
					if (workTreeMatch) {
						const mainGitFolder = match.slice(0, workTreeMatch.index);
						configPath = path.join(mainGitFolder, '.git', 'config');
					}
					resolve(configPath);
				});
			} else {
				resolve(path.join(repoDir, '.git', 'config'));
			}
		});
	});
};

const readConfigFile = (path: string): { [key: string]: any } => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf-8', (err, data) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			// ini is the filetype the .git config file is in
			const configFileContents = ini.parse(data);
			resolve(configFileContents);
		});
	});
};

export type Code = {
	_id?: string;
	url: string;
	sha: string;
	provider: string;
	file: string;
	gitOrg: string;
	repo: string;
	type: string;
	branch: string;
	line?: number;
	endLine?: number;
};

export const getGitData = async (
	fileFsPath: string,
	viewProvider: ViewProvider,
	type: string,
	command: string,
	lines?: number[],
): Promise<Code> => {
	const repoDir: string | null = findParentDir.sync(fileFsPath, '.git');

	let code: Code = {
		url: '',
		sha: '',
		provider: '',
		file: '',
		gitOrg: '',
		repo: '',
		branch: '',
		type,
	};

	if (!repoDir) {
		return code;
	}

	const gitConfigPath: string = await locateGitConfig(repoDir);
	const config: { [key: string]: any } = await readConfigFile(gitConfigPath);

	await gitRev.long(repoDir, async function (_: any, sha: any) {
		code.sha = sha;
		let rawUri: any,
			configuredBranch: any,
			provider: BaseProvider | null = null,
			remoteName: any;

		await gitRev.branch(repoDir, async function (_: any, branch: any) {
			// Check to see if the branch has a configured remote
			configuredBranch = config[`remote "${branch}"`];
			code.branch = branch;
			if (configuredBranch) {
				// Use the current branch's configured remote
				remoteName = configuredBranch.remote;
				rawUri = config[`remote "${remoteName}"`].url;
			} else {
				const remotes = Object.keys(config).filter(k => k.startsWith('remote '));
				if (remotes.length > 0) {
					rawUri = config[remotes[0]].url;
				}
			}
			if (!rawUri) {
				vscode.window.showWarningMessage(`No remote found on branch.`);
				return;
			}

			try {
				provider = gitProvider(rawUri, sha);
			} catch (e: any) {
				let errmsg = e.toString();
				window.showWarningMessage(`Unknown Git provider. ${errmsg}`);
				return;
			}

			let formattedFilePath = path.relative(repoDir, fileFsPath).replace(/\\/g, '/');
			formattedFilePath = formattedFilePath.replace(/\s{1}/g, '%20');
			code.file = formattedFilePath;
			let subdir = repoDir !== fileFsPath ? '/' + formattedFilePath : '';
			if (provider != null) {
				code.provider = provider.name;
				code.gitOrg = provider.gitUrl.organization;
				code.repo = provider.gitUrl.name;
				if (lines) {
					if (lines[0] === lines[1]) {
						code.url = provider.webUrl(sha, subdir, lines[0] + 1);
						code.line = lines[0];
					} else {
						code.url = provider.webUrl(sha, subdir, lines[0] + 1, lines[1] + 1);
						code.line = lines[0];
						code.endLine = lines[1];
					}
				} else {
					code.url = provider.webUrl(sha, subdir);
				}
				if (command !== 'code') {
					await viewProvider.show();
					const delay = (time: number) => {
						return new Promise(resolve => setTimeout(resolve, time));
					};
					await delay(200);
				}
			}
			return viewProvider.postCode(code);
		});
	});

	return code;
};

export const getFilePath = (fileFsPath: string) => {
	const repoDir: string | null = findParentDir.sync(fileFsPath, '.git');
	if (!repoDir) {
		return ''; // TODO - proper error handling
	}
	let formattedFilePath = path.relative(repoDir, fileFsPath).replace(/\\/g, '/');
	formattedFilePath = formattedFilePath.replace(/\s{1}/g, '%20');
	return formattedFilePath;
};

export const getRepoInfo = async (fileFsPath: string): Promise<{ repo: string; gitOrg: string; file: string }> => {
	return new Promise(async (resolve, reject) => {
		const repoDir: string | null = findParentDir.sync(fileFsPath, '.git');
		let gitOrg: string, repo: string;
		if (!repoDir) {
			return resolve({ repo: '', gitOrg: '', file: '' }); // TODO - proper error handling
		}

		const gitConfigPath: string = await locateGitConfig(repoDir);
		const config: { [key: string]: any } = await readConfigFile(gitConfigPath);

		const file: string = getFilePath(fileFsPath);

		await gitRev.long(repoDir, async function (_: any, sha: any) {
			let rawUri: any,
				configuredBranch: any,
				provider: BaseProvider | null = null,
				remoteName: any;

			await gitRev.branch(repoDir, async function (_: any, branch: any) {
				// Check to see if the branch has a configured remote
				configuredBranch = config[`remote "${branch}"`];
				if (configuredBranch) {
					// Use the current branch's configured remote
					remoteName = configuredBranch.remote;
					rawUri = config[`remote "${remoteName}"`].url;
				} else {
					const remotes = Object.keys(config).filter(k => k.startsWith('remote '));
					if (remotes.length > 0) {
						rawUri = config[remotes[0]].url;
					}
				}
				if (!rawUri) {
					vscode.window.showWarningMessage(`No remote found on branch.`);
					return reject();
				}

				try {
					provider = gitProvider(rawUri, sha);
				} catch (e: any) {
					let errmsg = e.toString();
					window.showWarningMessage(`Unknown Git provider. ${errmsg}`);
					return reject();
				}

				let formattedFilePath = path.relative(repoDir, fileFsPath).replace(/\\/g, '/');
				formattedFilePath = formattedFilePath.replace(/\s{1}/g, '%20');
				if (provider != null) {
					gitOrg = provider.gitUrl.organization;
					repo = provider.gitUrl.name;
					return resolve({ repo, gitOrg, file });
				}
			});
		});
	});
};
