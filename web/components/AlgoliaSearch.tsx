import React from 'react';
import AlgoliaAutocomplete from './AlgoliaAutocomplete';
import { getAlgoliaResults } from '@algolia/autocomplete-js';
import loadSearchClient from '../lib/loadAlgolia';

const AlgoliaSearch = () => {
    const searchClient = loadSearchClient();
    return (
        <div>
            <AlgoliaAutocomplete
                openOnFocus={true}
                getSources={({ query }: { query: any }) => [
                    {
                        sourceId: 'docs',
                        getItems() {
                            return getAlgoliaResults({
                                searchClient,
                                queries: [
                                    {
                                        indexName: 'docs',
                                        query,
                                        params: {
                                            hitsPerPage: 7,
                                            attributesToSnippet: ['content']
                                        }
                                    }
                                ]
                            })
                        },
                        templates: {
                            item({item, components, html}: any) {
                                return html`
                                    <div className='flex flex-row'>
                                        <h1>
                                            <a href='${item.url}'>
                                                ${components.Highlight({
                                                    hit: item,
                                                    attribute: 'name'
                                                })}
                                            </a>
                                        </h1>
                                        <div>
                                                ${components.Snippet({
                                                    hit: item,
                                                    attribute: 'content'
                                                })}
                                        </div>
                                    </div>
                                `
                            }
                        }
                    }
                ]}
            />
        </div>
    );
};

export default AlgoliaSearch;
