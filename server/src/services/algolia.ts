import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';
import { DocType } from '../models/Doc';

dotenv.config();

export const indexDocForSearch = async (doc: DocType) => {
    const algoliaSecret = process.env.ALGOLIA_SECRET;
    if (algoliaSecret) {
        const client = algoliasearch('ZYAFPP03KM', algoliaSecret);
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
}

export const updateDocContentForSearch = async (doc: DocType, newContent: string) => {
    const algoliaSecret = process.env.ALGOLIA_SECRET;
    if (algoliaSecret) {
        const client = algoliasearch('ZYAFPP03KM', algoliaSecret);
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
}
