import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';
import { DocType } from '../models/Doc';

dotenv.config();

const algoliaSecret = process.env.ALGOLIA_SECRET as string;
const algoliaClientId = process.env.ALGOLIA_APP_ID as string;
const client = algoliasearch(algoliaClientId, algoliaSecret);

type SearchResults = {
    docs: any[]
}

export const searchDocs = async (query: string, orgId: string): Promise<SearchResults> => {
    const queries = [{
        indexName: 'docs',
        query,
        params: {
            filters: `org:${orgId}`
        }
      }];
    
    const { results } = await client.multipleQueries(queries);
    return {
        docs: results[0].hits
    }
}

const docsIndex = client.initIndex('docs');

export const indexDocForSearch = async (doc: DocType) => {
    try {
        const record = {
            objectID: doc._id,
            name: doc.title,
            content: doc.content,
            url: doc.url,
            org: doc.org,
            favicon: doc.favicon,
            method: doc.method,
        };
        await docsIndex.saveObject(record);
    }
    catch (error) {
        // Todo: manage oversize
        console.log(error);
    }
}

export const updateDocContentForSearch = async (doc: DocType, newContent: string) => {
    try {
        const record = {
            objectID: doc._id,
            name: doc.title,
            content: newContent,
            url: doc.url,
            org: doc.org,
            favicon: doc.favicon,
            method: doc.method,
        };
        await docsIndex.saveObject(record);
    }
    catch (error) {
        // Todo: manage oversize
        console.log(error);
    }
}

export const deleteDocForSearch = async (objectID: string): Promise<any> => {
    return docsIndex.deleteObject(objectID);
}