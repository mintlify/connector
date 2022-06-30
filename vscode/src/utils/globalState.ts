import { Memento } from "vscode";
import { Link } from '../components/links';

export default class GlobalState {
    constructor(private storage: Memento) {}
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
  }