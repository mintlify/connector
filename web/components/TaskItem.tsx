import { CheckIcon } from "@heroicons/react/solid";
import Link from "next/link";
import timeAgo from "../services/timeago";
import { Task } from "./ActivityBar";

export default function TaskItem({ task, onCompleteTask }: { task: Task, onCompleteTask: (task: Task) => void }) {
  let taskIcon;
  let actionLabel;
  switch (task.type) {
    case 'update':
      taskIcon = <div className="flex items-center justify-center bg-red-500 p-1.5 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 text-white" viewBox="0 0 512 512" fill="currentColor">
          <path d="M362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32zM421.7 220.3L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3z"/>
        </svg>
      </div>
      actionLabel = 'Update';
      break;
    case 'review':
      taskIcon = <div className="flex items-center justify-center bg-white p-1 rounded-full">
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