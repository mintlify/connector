import React, {
    createElement,
    Fragment,
    useEffect,
    useRef
} from 'react';
// import { SearchIcon } from '@heroicons/react/solid'
import '@algolia/autocomplete-theme-classic';
import { autocomplete } from '@algolia/autocomplete-js';
import { createRoot, Root } from 'react-dom/client';


const AlgoliaAutocomplete = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRootRef = useRef<Root|null>(null);
    const rootRef = useRef<HTMLElement|null>(null);
    useEffect(() => {
        if (!containerRef.current) {
            return undefined;
        }

        const search = autocomplete({
            container: containerRef.current,
            placeholder: 'Search your docs',
            renderer: { createElement, Fragment, render: () => {} },
            render({ children }, root) {
                if (!panelRootRef.current || rootRef.current !== root) {
                    rootRef.current = root;
                    panelRootRef.current?.unmount();
                    panelRootRef.current = createRoot(root);
                }
                panelRootRef.current.render(children);
            },
            ...props
        })

        return () => {
            search.destroy();
        };
    }, [props]);
    
    return (
        <div ref={containerRef}></div>
        // <div className="elative cursor-pointer">
        //     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        //         <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        //     </div>
        //     <input
        //         id="search"
        //         name="search"
        //         className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none hover:bg-gray-600 sm:text-sm cursor-pointer"
        //         placeholder="Search"
        //         disabled
        //     />
        //     <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
        //         <kbd className="inline-flex items-center border border-gray-200 border-opacity-60 rounded px-2 text-sm font-sans font-medium text-gray-400">
        //         ⌘K
        //         </kbd>
        //     </div>
        // </div>
    )
}

export default AlgoliaAutocomplete;
