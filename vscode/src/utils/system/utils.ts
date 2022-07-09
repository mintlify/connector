import { Uri } from 'vscode';
import { Schemes } from '../constants';

export function isVirtualUri(uri: Uri): boolean {
    return uri.scheme === Schemes.Virtual || uri.scheme === Schemes.GitHub;
}