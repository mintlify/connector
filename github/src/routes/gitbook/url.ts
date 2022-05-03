import { AuthConnectorType } from '../../models/AuthConnector';
import { Skeleton } from '../../parsing/types';

export const addUrlsToSkeletons = (skeletons: Skeleton[], repo: string, branch: string, filename: string, authConnector: AuthConnectorType): Skeleton[] => {
    if (authConnector.source !== 'github') {
        return skeletons;
    }
    return skeletons.map((skeleton) => {
        let lines = ''
        if (skeleton.lineRange != null) {
            lines = `#L${skeleton.lineRange?.start}:L${skeleton.lineRange?.end}`;
        }
        const url = `https://github.com/${authConnector.sourceId}/${repo}/blob/${branch}/${filename}${lines}`;
        return {
            ...skeleton,
            url
        };
    });
}