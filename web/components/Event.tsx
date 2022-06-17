import { DocumentAddIcon } from "@heroicons/react/outline"
import { MinusIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid"
import { useState } from "react"
import { DocTitleIcon } from "../helpers/Icons"
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
  let totalWordsRemoved = 0;
  let totalWordsAdded = 0;

  change.forEach((section) => {
    if (section.removed) {
      totalWordsRemoved += section.value.split(' ').length;
    }
    if (section.added) {
      totalWordsAdded += section.value.split(' ').length;
    }
  });

  return {
    removed: totalWordsRemoved,
    added: totalWordsAdded,
  }
}

const ChangedText = ({ changes }: { changes: Change[] }) => {
  return <div className="text-sm text-gray-700">
    {changes.map((change, i) => {
      if (change.removed) {
        return <span key={i} className="text-red-700 line-through">
          {change.value}
        </span>
      }
      if (change.added) {
        return <span key={i} className="text-green-700">
          {change.value}
        </span>
      } else {
        return <span key={i}>{change.value}</span>
      }
    })
    }
  </div>
}

export default function EventItem({ event }: { event: Event }) {
  const [isShowingChanges, setIsShowingChanges] = useState(false);
  return (
    <li className="py-4">
      <div className="flex space-x-3">
        <DocTitleIcon method={event.doc.method} favicon={event.doc.favicon} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{event.doc.title}</h3>
            <p className="text-sm text-gray-500">{timeAgo.format(Date.parse(event.createdAt))}</p>
          </div>
          {
            event.type === 'change' && event.change && (
              <div>
                {
                  countTotalChanges(event.change).added > 0 && (<div className="flex items-center space-x-1 text-green-700">
                  <PlusIcon className="h-4 w-4" />
                  <p className="text-sm">
                    {countTotalChanges(event.change).added} {countTotalChanges(event.change).added > 1 ? 'words added' : 'word added'}
                  </p>
                </div>)
                }
                {
                  countTotalChanges(event.change).removed > 0 && <div className="flex items-center space-x-1 text-red-700">
                  <MinusIcon className="h-4 w-4" />
                  <p className="text-sm">
                    {countTotalChanges(event.change).removed} {countTotalChanges(event.change).removed > 1 ? 'words deleted' : 'word deleted'}
                  </p>
                </div>
                }
                <button
                  className="mt-2 text-primary flex items-center text-sm font-medium"
                  onClick={() => setIsShowingChanges(!isShowingChanges)}
                >
                  { isShowingChanges ? <><ChevronUpIcon className="h-4 w-4" />Hide changes</> :  <><ChevronDownIcon className="h-4 w-4" />Show changes</> }
                </button>
                {
                  isShowingChanges && <div className="mt-1 px-1">
                  <ChangedText changes={event.change} />
                </div>
                }
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