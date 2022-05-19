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

export const searchDocsAndAutomations = async (query: string): Promise<SearchResults> => {
    const queries = [{
        indexName: 'docs',
        query,
      }, {
        indexName: 'automations',
        query,
      }]
    const { results } = await client.multipleQueries(queries);

    return {
        docs: results[0].hits,
        automations: results[1].hits
    }
}

export const indexDocForSearch = async (doc: DocType) => {
    const index = client.initIndex('docs');
    const record = {
        objectID: doc._id,
        name: doc.title,
        content: doc.content,
        url: doc.url,
        org: doc.org
    };
    await index.saveObject(record);
}

export const updateDocContentForSearch = async (doc: DocType, newContent: string) => {
    const index = client.initIndex('docs');
    const record = {
        objectID: doc._id,
        name: doc.title,
        content: newContent,
        url: doc.url,
        org: doc.org
    };
    await index.saveObject(record);
}
