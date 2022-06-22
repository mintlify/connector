import Doc from '../../models/Doc';
import { OrgType } from '../../models/Org';
import { ConfluencePage } from '../../routes/integrations/confluence';
import { GoogleDoc } from '../../routes/integrations/google';
import { NotionPage } from '../../routes/integrations/notion';
import { indexDocForSearch } from '../../services/algolia';
import { getGoogleDocsPrivateData } from '../../services/googleDocs';
import { track } from '../../services/segment';

export const importDocsFromNotion = async (pages: NotionPage[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const addDocPromises = pages.map((page) => new Promise<void>(async (resolve) => {
    try {
      // Add doc without content
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url: page.url,
        },
        {
          org: orgId,
          url: page.url,
          method: 'notion-private',
          notion: {
            pageId: page.id,
          },
          content: '', // to be scraped
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
      
      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method: 'notion-private',
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
}

export const importDocsFromGoogleDocs = async (docs: GoogleDoc[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const addDocPromises = docs.map((googleDoc) => new Promise<void>(async (resolve) => {
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
          method: 'googledocs-private',
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

      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method: 'googledocs-private',
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
};

export const importDocsFromConfluence = async (pages: ConfluencePage[], org: OrgType, userId: string) => {
  const addDocPromises = pages.map((page) => new Promise<void>(async (resolve) => {
    try {
      const orgId = org._id;
      const firstSpace = org?.integrations?.confluence?.accessibleResources[0];
      if (org?.integrations?.confluence?.accessibleResources[0] == null) {
        throw 'No organization found with accessible resources';
      }
      const url = `${firstSpace?.url}/wiki${page._links.webui}`;
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url,
        },
        {
          org: orgId,
          url,
          method: 'confluence-private',
          confluence: {
            id: page.id,
          },
          content: page.content,
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

      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method: 'googledocs-private',
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
};

export type GitHubReadme = {
  path: string,
  url: string,
  content: string,
  lastUpdatedAt: string
}

export const createDocsFromGitHubReadmes = async (readmes: GitHubReadme[], org: OrgType, userId: string) => {
  const addDocPromises = readmes.map((readme) => new Promise<void>(async (resolve) => {
    try {
      const orgId = org._id;
      const url = readme.url;
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url,
        },
        {
          org: orgId,
          url,
          method: 'github',
          content: readme.content,
          title: readme.path,
          createdBy: userId,
          isJustAdded: false,
          lastUpdatedAt: Date.parse(readme.lastUpdatedAt)
        },
        {
          upsert: true,
          new: true,
        }
      );

      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method: 'github',
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
};