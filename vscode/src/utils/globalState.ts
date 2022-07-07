import { Memento, env } from "vscode";
import { Link } from './links';

export default class GlobalState {
    constructor(private storage: Memento) {}

    public clearState() {
      this.storage.update('userId', undefined);
      this.storage.update('subdomain', undefined);
    }

    public getUserId(): string | undefined {
      return this.storage.get('userId', undefined);
    }

    public setUserId(userId: string) {
      this.storage.update('userId', userId);
    }

    public deleteUserId() {
      this.storage.update('userId', undefined);
    }

    public getSubdomain(): string | undefined {
      return this.storage.get('subdomain', undefined);
    }

    public setSubdomain(subdomain: string) {
      this.storage.update('subdomain', subdomain);
    }

    public deleteSubdomain() {
      this.storage.update('subdomain', undefined);
    }

    public getLinks(): Link[] | undefined {
      return this.storage.get('links', undefined);
    }

    public setLinks(links: Link[]) {
      this.storage.update('links', links);
    }

    public deleteLinks() {
      this.storage.update('links', undefined);
    }

    public getRepo(): string | undefined {
      return this.storage.get('repo', undefined);
    }

    public setRepo(repo: string) {
      this.storage.update('repo', repo);
    }

    public deleteRepo() {
      this.storage.update('repo', undefined);
    }

    public getGitOrg(): string | undefined {
      return this.storage.get('gitOrg', undefined);
    }

    public setGitOrg(gitOrg: string) {
      this.storage.update('gitOrg', gitOrg);
    }

    public deleteGitOrg() {
      this.storage.update('gitOrg', undefined);
    }

    public getAuthParams() {
      return {
        userId: this.getUserId(),
        subdomain: this.getSubdomain(),
        anonymousId: env.machineId
      };
    }
  }