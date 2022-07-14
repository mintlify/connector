import { Code } from './git';

export type Doc = {
	_id: string;
	org: string;
	url: string;
	method: string;
	content?: string;
	lastUpdatedAt?: Date;
	createdAt?: Date;
	title: string;
};

export type Link = {
	doc: Doc;
	codes: Code[];
};
