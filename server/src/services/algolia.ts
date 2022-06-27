import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';
import { DocType } from '../models/Doc';

dotenv.config();

const algoliaSecret = process.env.ALGOLIA_SECRET as string;
const algoliaClientId = process.env.ALGOLIA_APP_ID as string;
const client = algoliasearch(algoliaClientId, algoliaSecret);
const docsIndex = client.initIndex('docs');

type SearchResults = {
    docs: any[]
}

export const searchDocs = async (query: string, orgId: string): Promise<SearchResults> => {    
    const results = await docsIndex.search(query, {
        filters: `org:${orgId}`
    })
    return {
        docs: results.hits
    }
}

export const clearIndexWithMethod = async (orgId: string, method: string) => {
    try {
        await docsIndex.deleteBy({
            filters: `org:${orgId} AND method:${method}`
        })
    } catch (error) {
        console.log(error)
    }
}

export const indexDocsForSearch = async (docs: DocType[]) => {
    try {
        const records = docs.map((doc) => {
            return {
                objectID: doc._id,
                name: doc.title,
                content: doc.content,
                url: doc.url,
                org: doc.org,
                favicon: doc.favicon,
                method: doc.method,
            };
        })
        await docsIndex.partialUpdateObjects(records, { createIfNotExists: true });
    }
    catch (error) {
        // Todo: manage oversize
        console.log(error);
    }
}

export const deleteDocForSearch = async (objectID: string): Promise<any> => {
    return docsIndex.deleteObject(objectID);
}