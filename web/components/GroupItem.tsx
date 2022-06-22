import { useEffect } from 'react'
import {
  ChevronRightIcon,
} from '@heroicons/react/solid'
import { DocTitleIcon } from '../helpers/Icons'
import timeAgo from '../services/timeago'
import { useProfile } from '../context/ProfileContext';
import { Doc } from '../pages';

export type Group = {
  _id: string;
  name: string;
  count: number;
  lastUpdatedDoc: Doc;
}

type GroupItemProps = {
  group: Group,
  setSelectedGroup: (group: Group) => void,
}

export default function GroupItem({ group, setSelectedGroup }: GroupItemProps) {
  const { profile } = useProfile();

  useEffect(() => {
    const { user } = profile;
    if (user == null) {
      return;
    }
  
  }, [profile]);

  return <div key={group._id}>
    <div className="ml-4 mr-6 h-px bg-gray-200 sm:ml-6 lg:ml-8 xl:ml-6 xl:border-t-0"></div>
  <li
    className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:pl-6 lg:pl-8 xl:pl-6 cursor-pointer"
    onClick={() => setSelectedGroup(group)}
  >
    <div className="flex items-center justify-between space-x-4">
      {/* Repo name and link */}
      <div className="min-w-0 space-y-2">
        <div className="flex items-center space-x-3">
          <span className="block">
            <h2 className="text-sm font-medium text-gray-700">
              <div className="flex items-center space-x-2">
                <DocTitleIcon method={group._id} />
                <a target="_blank" className="space-x-1 group flex items-center decoration-gray-300">
                  <span>
                    {group.name}
                  </span>
                </a>
                <div className="bg-slate-400 text-xs py-px px-2 text-white rounded-full">
                  {group.count} documents
                </div>
              </div>
            </h2>
          </span>
        </div>
        <a className="relative group flex items-center space-x-2.5">
          <span className="flex items-center space-x-2.5 text-sm text-gray-500 truncate">
            <div>
              <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" className="w-3 h-3 text-gray-500">
                <path fill="currentColor" fillRule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path>
              </svg>
            </div>
            <div>
              Last updated {timeAgo.format(Date.parse(group.lastUpdatedDoc.lastUpdatedAt))}
            </div>
          </span>
        </a>
      </div>
      <div>
        <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  </li>
  </div>
}