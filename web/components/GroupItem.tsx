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
  tasksCount: number;
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
                {
                  group.tasksCount > 0 && <div className="bg-red-500 text-xs py-px px-2 text-white rounded-full">
                  {group.tasksCount} {group.tasksCount > 1 ? 'requests' : 'request'}
                </div>
                }
              </div>
            </h2>
          </span>
        </div>
        <a className="relative group flex items-center space-x-2.5">
          <span className="flex items-center space-x-2.5 text-sm text-gray-500 truncate">
            <div>
            {group.count} documents • Last updated {timeAgo.format(Date.parse(group.lastUpdatedDoc.lastUpdatedAt))}
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