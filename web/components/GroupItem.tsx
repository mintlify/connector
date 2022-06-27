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
  isLoading: boolean;
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
    className="relative pl-4 pr-6 py-4 hover:bg-gray-50 sm:pl-6 lg:pl-8 xl:pl-6 cursor-pointer"
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
                  group.tasksCount > 0 && <div className="flex items-center bg-red-100 text-red-800 text-xs py-px px-2 rounded-full">
                    <svg className="mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx={4} cy={4} r={3} />
                  </svg>
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
              { group.isLoading
                ? <span className="flex items-center text-gran-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512" className="h-3 w-3 text-gray-500 animate-spin mr-2">
                    <path d="M449.9 39.96l-48.5 48.53C362.5 53.19 311.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.97 5.5 34.86-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c37.96 0 73 14.18 100.2 37.8L311.1 178C295.1 194.8 306.8 223.4 330.4 224h146.9C487.7 223.7 496 215.3 496 204.9V59.04C496 34.99 466.9 22.95 449.9 39.96zM441.8 289.6c-16.94-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-37.96 0-73-14.18-100.2-37.8L200 334C216.9 317.2 205.2 288.6 181.6 288H34.66C24.32 288.3 16 296.7 16 307.1v145.9c0 24.04 29.07 36.08 46.07 19.07l48.5-48.53C149.5 458.8 200.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"/>
                  </svg>
                  Importing</span>
                : <>{group.count} documents • Last updated {timeAgo.format(Date.parse(group.lastUpdatedDoc.lastUpdatedAt))}</> }
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