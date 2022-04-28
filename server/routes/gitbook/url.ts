import { AuthConnectorType } from 'models/AuthConnector';
import { Skeleton } from 'parsing/types';

export const addUrlsToSkeletons = (skeletons: Skeleton[], filename: string, authConnector: AuthConnectorType): Skeleton[] => {
    if(authConnector.source !== 'github') {
        return skeletons;
    }
    return skeletons.map((skeleton) => {
        const lines = `#L${skeleton.lineRange.start}:L${skeleton.lineRange.end}`;
        const url = `https://github.com/${authConnector.sourceId}/${filename}${lines}`;
        return {
            ...skeleton,
            url
        };
    });
}