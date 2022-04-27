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
            lineRange: { start: 9, end: 11 }
        }];
        expect(fileSkeleton).toEqual({
            topComment: `TOP COMMENT
 WOOT WOOT`,
            skeletons
        })
    })
})