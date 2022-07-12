import { env, Memento } from 'vscode';
import { Link } from './links';

export class GlobalState {
	constructor(private storage: Memento) {}

	public async clearState() {
		await this.storage.update('userId', undefined);
		await this.storage.update('subdomain', undefined);
	}

	public getUserId(): string | undefined {
		return this.storage.get('userId', undefined);
	}

	public async setUserId(userId: string) {
		await this.storage.update('userId', userId);
	}

	public async deleteUserId() {
		await this.storage.update('userId', undefined);
	}

	public getSubdomain(): string | undefined {
		return this.storage.get('subdomain', undefined);
	}

	public async setSubdomain(subdomain: string) {
		await this.storage.update('subdomain', subdomain);
	}

	public async deleteSubdomain() {
		await this.storage.update('subdomain', undefined);
	}

	public getLinks(): Link[] | undefined {
		return this.storage.get('links', undefined);
	}

	public async setLinks(links: Link[]) {
		await this.storage.update('links', links);
	}

	public async deleteLinks() {
		await this.storage.update('links', undefined);
	}

	public getRepo(): string | undefined {
		return this.storage.get('repo', undefined);
	}

	public async setRepo(repo: string) {
		await this.storage.update('repo', repo);
	}

	public async deleteRepo() {
		await this.storage.update('repo', undefined);
	}

	public getGitOrg(): string | undefined {
		return this.storage.get('gitOrg', undefined);
	}

	public async setGitOrg(gitOrg: string) {
		await this.storage.update('gitOrg', gitOrg);
	}

	public async deleteGitOrg() {
		await this.storage.update('gitOrg', undefined);
	}

	public getAuthParams() {
		return {
			userId: this.getUserId(),
			subdomain: this.getSubdomain(),
			anonymousId: env.machineId,
		};
	}
}
