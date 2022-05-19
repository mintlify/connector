import { DocumentAddIcon, DocumentTextIcon } from "@heroicons/react/outline"
import { MinusIcon, PlusIcon } from "@heroicons/react/solid"
import { Doc } from "../pages"
import timeAgo from "../services/timeago"

type Change = {
  removed?: boolean,
  added?: boolean,
  count: number,
  value: string,
}

export type Event = {
  _id: string,
  type: 'add' | 'change',
  doc: Doc,
  createdAt: string,
  change?: Change[],
  add?: Object,
}

const countTotalChanges = (change: Change[]) => {
  let totalRemoved = 0;
  let totalAdded = 0;

  change.forEach((section) => {
    if (section.removed) {
      totalRemoved += section.count;
    }
    if (section.added) {
      totalAdded += section.count;
    }
  });

  return {
    removed: totalRemoved,
    added: totalAdded,
  }
}

export default function EventItem({ event }: { event: Event }) {
  return (
    <li className="py-4">
      <div className="flex space-x-3">
        {
          event.doc.favicon ? <img
          className="h-5 w-5 rounded-sm"
          src={event.doc.favicon}
          alt={event.doc.title}
        /> : <DocumentTextIcon className="h-5 w-5 text-gray-600" />
        }
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{event.doc.title}</h3>
            <p className="text-sm text-gray-500">{timeAgo.format(Date.parse(event.createdAt))}</p>
          </div>
          {
            event.type === 'change' && event.change && (
              <div>
                <div className="flex items-center space-x-1 text-green-700">
                  <PlusIcon className="h-4 w-4" />
                  <p className="text-sm">
                    {countTotalChanges(event.change).added} {countTotalChanges(event.change).added > 1 ? 'changes' : 'change'}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-red-700">
                  <MinusIcon className="h-4 w-4" />
                  <p className="text-sm">
                    {countTotalChanges(event.change).removed} {countTotalChanges(event.change).removed > 1 ? 'changes' : 'change'}
                  </p>
                </div>
              </div>
            )
          }
          {
            event.type === 'add' && (
              <div className="flex items-center space-x-1 text-gray-600">
                <DocumentAddIcon className="h-4 w-4" />
                <div className="text-sm">
                  Added document
                </div>
              </div>
            )
          }
        </div>
      </div>
    </li>
  )
}