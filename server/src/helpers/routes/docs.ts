import axios from 'axios';
import { Types } from 'mongoose';
import Doc from '../../models/Doc';
import Org from '../../models/Org';
import { createEvent } from '../../routes/events';
import { ConfluencePage } from '../../routes/integrations/confluence';
import { GoogleDoc } from '../../routes/integrations/google';
import { NotionPage } from '../../routes/integrations/notion';
import { indexDocForSearch } from '../../services/algolia';
import { track } from '../../services/segment';
import { extractDataFromHTML } from '../../services/webscraper';

// userId is the _id of the user not `userId`
export const createDocFromUrl = async (url: string, orgId: string, userId: Types.ObjectId) => {
  const response = await axios.get(url);
  const { content, method, title, favicon } = await extractDataFromHTML(url, response.data);
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
      title,
      favicon,
      createdBy: userId,
      isJustAdded: true,
    },
    {
      upsert: true,
      new: true,
    }
  );

  return { content, doc, method };
};

export const createDocsFromNotionPageId = async (pages: NotionPage[], orgId: Types.ObjectId, userId: string) => {
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

      await createEvent(orgId, doc._id, 'add', {});
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

export const createDocsFromGoogleDocs = async (docs: GoogleDoc[], orgId: Types.ObjectId, userId: string) => {
  const addDocPromises = docs.map((googleDoc) => new Promise<void>(async (resolve) => {
    try {
      // Add doc without content
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url: `https://docs.google.com/document/d/${googleDoc.id}`,
        },
        {
          org: orgId,
          url: `https://docs.google.com/document/d/${googleDoc.id}`,
          method: 'googledocs-private',
          googledocs: {
            id: googleDoc.id,
          },
          content: '', // to be scraped
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

      await createEvent(orgId, doc._id, 'add', {});
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

export const createDocsFromConfluencePages = async (pages: ConfluencePage[], orgId: Types.ObjectId, userId: string) => {
  const addDocPromises = pages.map((page) => new Promise<void>(async (resolve) => {
    try {
      const org = await Org.findById(orgId);
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

      await createEvent(orgId, doc._id, 'add', {});
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