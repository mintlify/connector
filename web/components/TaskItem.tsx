import { CheckIcon } from "@heroicons/react/solid";
import Link from "next/link";
import timeAgo from "../services/timeago";
import { Task } from "./ActivityBar";

export default function TaskItem({ task, onCompleteTask }: { task: Task, onCompleteTask: (task: Task) => void }) {
  let taskIcon;
  let actionLabel;
  switch (task.type) {
    case 'update':
      taskIcon = <div className="flex items-center justify-center bg-red-100 h-6 w-6 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-red-400"></span>
      </div>
      actionLabel = 'Update';
      break;
    case 'review':
      taskIcon = <div className="flex items-center justify-center">
        <img src="assets/integrations/github.svg" className="h-6" alt="GitHub" />
      </div>
      actionLabel = 'Review';
      break;
    default:
      taskIcon = null;
  }

  return <li key={task._id} className="flex items-center py-4 space-x-3">
  {taskIcon}
  <div className="min-w-0 flex-1">
    <Link href={task.url || ''}>
      <div className="group cursor-pointer">
      <a target="_blank" className="text-sm font-medium text-gray-700 group-hover:underline">
        <span>{actionLabel} {task.doc.title}</span>
      </a>
      <p className="text-sm text-gray-500 group-hover:underline">
        Created {timeAgo.format(Date.parse(task.createdAt))}
      </p>
      </div>
    </Link>
  </div>
  <div className="flex-shrink-0">
    <button
      type="button"
      className="items-center justify-center py-1 px-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full"
      onClick={() => onCompleteTask(task)}
    >
      <span><CheckIcon className="h-4 text-green-700" /></span>
    </button>
  </div>
</li>
}