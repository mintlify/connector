import { Types } from 'mongoose';
import Doc, { DocType } from '../../models/Doc';
import Org, { OrgType } from '../../models/Org';
import { ConfluencePage } from '../../routes/integrations/confluence';
import { GoogleDoc } from '../../routes/integrations/google';
import { NotionPage } from '../../routes/integrations/notion';
import { clearIndexWithMethod, indexDocsForSearch } from '../../services/algolia';
import { getGoogleDocsPrivateData } from '../../services/googleDocs';
import { getNotionPageDataWithId } from '../../services/notion';
import { track } from '../../services/segment';
import { ScrapingMethod } from '../../services/webscraper';
import { replaceRelativeWithAbsolutePathsInMarkdown } from './markdown';

export const updateImportStatus = (orgId: Types.ObjectId, app: 'notion' | 'github' | 'confluence' | 'googledocs', isLoading: boolean) => {
  const query: Record<string, boolean> = {};
  query[`importStatus.${app}`] = isLoading;
  return Org.findByIdAndUpdate(orgId, query)
}

const deleteDocsWithoutTasksOrCode = (orgId: Types.ObjectId, method: ScrapingMethod) => {
  return new Promise<void>(async (resolve) => {
    const docs = await Doc.aggregate([
      {
        $match: {
          org: orgId,
          method,
        }
      },
      {
        $lookup: {
          from: 'code',
          foreignField: 'doc',
          localField: '_id',
          as: 'code',
        },
      },
      {
        $lookup: {
          from: "tasks",
          let: { doc: "$_id" },
          pipeline: [
             { $match:
                { $expr:
                   { $and:
                      [
                        { $eq: [ "$doc",  "$$doc" ] },
                        { $eq: [ "$status", "todo" ] }
                      ]
                   }
                }
             },
          ],
          as: "tasks"
        },
      },
      {
        $match: {
          'tasks.0': { $exists: false },
          'code.0': { $exists: false }
        }
      }
    ]);

    const docIds = docs.map((doc) => doc._id);
    await Doc.deleteMany({ _id: { $in: docIds } });

    resolve();
  })
}

const clearDocsWithMethod = (orgId: Types.ObjectId, method: ScrapingMethod) => {
  return Promise.all([clearIndexWithMethod(orgId.toString(), method), deleteDocsWithoutTasksOrCode(orgId, method)])
}

const addTrackEventForAddingDoc = (userId: string, orgId: Types.ObjectId, doc: DocType): void => {
  track(userId, 'Add documentation', {
    doc: doc._id.toString(),
    method: doc.method,
    org: orgId.toString(),
  });
}

export const importDocsFromNotion = async (pages: NotionPage[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const method = 'notion-private';
  await clearDocsWithMethod(orgId, method);
  const addDocPromises = pages.map((page) => new Promise<DocType | null>(async (resolve) => {
    try {
      if (org.integrations?.notion?.access_token == null) {
        throw 'No Notion credentials'
      };
      let content;
      try {
        const contentResponse = await getNotionPageDataWithId(page.id, org.integrations.notion.access_token);
        content = contentResponse.content;
      } catch {
        // TBD: find ways to detect contect async or mark docs that still need scraping
        content = ''
      }
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url: page.url,
        },
        {
          org: orgId,
          url: page.url,
          method,
          notion: {
            pageId: page.id,
          },
          content,
          title: `${page.icon?.emoji ? `${page.icon?.emoji} ` : ''}${page.title}`,
          favicon: page.icon?.file,
          createdBy: userId,
          isJustAdded: true,
          lastUpdatedAt: Date.parse(page.lastEditedTime)
        },
        {
          upsert: true,
          new: true,
        }
      );
      addTrackEventForAddingDoc(userId, orgId, doc);
      resolve(doc);
    }
    catch {
      resolve(null);
    }
  }));

  const docsResponses = await Promise.all(addDocPromises);
  const docs = docsResponses.filter((doc) => doc != null) as DocType[];
  indexDocsForSearch(docs);
  await updateImportStatus(orgId, 'notion', false);
}

export const importDocsFromGoogleDocs = async (googleDocs: GoogleDoc[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const method = 'googledocs-private';
  await clearDocsWithMethod(orgId, method);
  const addDocPromises = googleDocs.map((googleDoc) => new Promise<DocType | null>(async (resolve) => {
    try {
      if (org.integrations?.google == null) {
        throw 'No Google credentials'
      };
      
      const { content } = await getGoogleDocsPrivateData(googleDoc.id, org.integrations.google);
      const doc = await Doc.findOneAndUpdate(
        {
          org: org._id,
          url: `https://docs.google.com/document/d/${googleDoc.id}`,
        },
        {
          org: orgId,
          url: `https://docs.google.com/document/d/${googleDoc.id}`,
          method,
          googledocs: {
            id: googleDoc.id,
          },
          content,
          title: googleDoc.name,
          createdBy: userId,
          isJustAdded: true,
          lastUpdatedAt: Date.parse(googleDoc.modifiedTime)
        },
        {
          upsert: true,
          new: true,
        }
      );

      addTrackEventForAddingDoc(userId, orgId, doc);
      resolve(doc);
    }
    catch {
      resolve(null);
    }
  }));

  const docsResponses = await Promise.all(addDocPromises);
  const docs = docsResponses.filter((doc) => doc != null) as DocType[];
  indexDocsForSearch(docs);
  await updateImportStatus(orgId, 'googledocs', false);
};

export const importDocsFromConfluence = async (pages: ConfluencePage[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const method = 'confluence-private';
  await clearDocsWithMethod(orgId, method);
  const addDocPromises = pages.map((page) => new Promise<DocType | null>(async (resolve) => {
    try {
      const firstSpace = org?.integrations?.confluence?.accessibleResources[0];
      if (firstSpace == null) {
        throw 'No organization found with accessible resources';
      }
      const url = `${firstSpace.url}/wiki${page._links.webui}`;
      const content = replaceRelativeWithAbsolutePathsInMarkdown(page.content, { img: firstSpace.url, link: firstSpace.url });
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url,
        },
        {
          org: orgId,
          url,
          method,
          confluence: {
            id: page.id,
          },
          content,
          title: page.title,
          createdBy: userId,
          isJustAdded: false,
          lastUpdatedAt: Date.parse(page.history.lastUpdated.when)
        },
        {
          upsert: true,
          new: true,
        }
      );

      addTrackEventForAddingDoc(userId, orgId, doc);
      resolve(doc);
    }
    catch {
      resolve(null);
    }
  }));

  const docsResponses = await Promise.all(addDocPromises);
  const docs = docsResponses.filter((doc) => doc != null) as DocType[];
  indexDocsForSearch(docs);
  await updateImportStatus(orgId, 'confluence', false);
};

export type GitHubMarkdown = {
  path: string,
  url: string,
  content: string,
  lastUpdatedAt: string,
  repo?: any,
}

export const importDocsFromGitHub = async (markdowns: GitHubMarkdown[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const method = 'github';
  await clearDocsWithMethod(orgId, method);
  const addDocPromises = markdowns.map((markdown) => new Promise<DocType | null>(async (resolve) => {
    try {
      const orgId = org._id;
      const url = markdown.url;
      const rootPath = `${markdown.repo?.full_name}/${markdown.repo?.default_branch}`;
      const path = `${rootPath}/${markdown.path}`;
      const content = replaceRelativeWithAbsolutePathsInMarkdown(
        markdown.content,
        {
          img: `https://raw.githubusercontent.com/${path}`,
          link: `https://github.com/${path}`
        },
        rootPath
      )
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url,
        },
        {
          org: orgId,
          url,
          method,
          content,
          title: `${markdown.repo?.name}/${markdown.path}`,
          createdBy: userId,
          isJustAdded: false,
          lastUpdatedAt: Date.parse(markdown.lastUpdatedAt)
        },
        {
          upsert: true,
          new: true,
        }
      );

      addTrackEventForAddingDoc(userId, orgId, doc);
      resolve(doc);
    }
    catch {
      resolve(null);
    }
  }));

  const docsResponses = await Promise.all(addDocPromises);
  const docs = docsResponses.filter((doc) => doc != null) as DocType[];
  indexDocsForSearch(docs);
  await updateImportStatus(orgId, 'github', false);
};