import algoliasearch, { SearchClient } from 'algoliasearch';

let client: SearchClient;

const loadSearchClient = () => {
    if (!client) {
        client = algoliasearch(
            'ZYAFPP03KM',
            process.env.ALGOLIA_SECRET ?? ''
        );
    }

    return client;
};

export default loadSearchClient;
