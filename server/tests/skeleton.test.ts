import { getFileSkeleton } from 'parsing';

describe('file skeleton', () => {
    test('test', () => {
        const file = `/**
 * TOP COMMENT
 *  WOOT WOOT
 */

/**
 * DOCSTRING
 */
const arrowFunction = (ayo: string, param: string): string => {
    return 'yo';
}`;
        const fileSkeleton = getFileSkeleton(file, 'typescript');
        const skeletons = [{
            signature: 'arrowFunction(ayo: string, param: string): string',
            doc: 'DOCSTRING',
            lineRange: { start: 9, end: 11 },
            rawDoc: `/**
 * DOCSTRING
 */`
        }];
        expect(fileSkeleton).toEqual({
            topComment: `TOP COMMENT
 WOOT WOOT`,
            skeletons
        })
    });

    test('top comment w/ line space in between', () => {
        const file = `/**
 * TOP COMMENT
 *  WOOT WOOT
 */

const arrowFunction = (ayo: string, param: string): string => {
    return 'yo';
}`;
        const fileSkeleton = getFileSkeleton(file, 'typescript');
        const skeletons = [{
            signature: 'arrowFunction(ayo: string, param: string): string',
            lineRange: { start: 6, end: 8 }
        }];
        expect(fileSkeleton).toEqual({
            topComment: `TOP COMMENT
 WOOT WOOT`,
            skeletons
        })
    });
})