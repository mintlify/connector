import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';
import { DocType } from '../models/Doc';

dotenv.config();

const algoliaSecret = process.env.ALGOLIA_SECRET as string;
const client = algoliasearch('ZYAFPP03KM', algoliaSecret);

type SearchResults = {
    docs: any[],
    automations: any[]
}

export const searchDocsAndAutomations = async (query: string, orgId: string): Promise<SearchResults> => {
    const queries = [{
        indexName: 'docs',
        query,
        params: {
            filters: `org:${orgId}`
        }
      }, {
        indexName: 'automations',
        query,
        params: {
            filters: `org:${orgId}`
        }
      }];
    const { results } = await client.multipleQueries(queries);

    console.log({results})
    return {
        docs: results[0].hits,
        automations: results[1].hits
    }
}

const docsIndex = client.initIndex('docs');

export const indexDocForSearch = async (doc: DocType) => {
    const record = {
        objectID: doc._id,
        name: doc.title,
        content: doc.content,
        url: doc.url,
        org: doc.org
    };
    await docsIndex.saveObject(record);
}

export const updateDocContentForSearch = async (doc: DocType, newContent: string) => {
    const record = {
        objectID: doc._id,
        name: doc.title,
        content: newContent,
        url: doc.url,
        org: doc.org
    };
    await docsIndex.saveObject(record);
}
