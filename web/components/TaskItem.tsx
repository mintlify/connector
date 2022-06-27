import { CheckIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { DocTitleIcon } from "../helpers/Icons";
import { Doc } from "../pages";
import { Task } from "./ActivityBar";

type TaskItemProps = {
  task: Task,
  onCompleteTask: (task: Task) => void,
  selectedDoc?: Doc
}

export default function TaskItem({ task, onCompleteTask, selectedDoc }: TaskItemProps) {
  let actionLabel;
  let subtitle;
  switch (task.type) {
    case 'update':
      actionLabel = 'Update';
      subtitle = 'View document'
      break;
    case 'review':
      actionLabel = 'Review';
      subtitle = 'View on GitHub'
      break;
    default:
      break;
  }

  return <li key={task._id} className="flex items-center py-4 space-x-3">
  { selectedDoc == null && <DocTitleIcon method={task.doc.method} favicon={task.doc.favicon} /> }
  <div className="min-w-0 flex-1">
    <Link href={task.url || ''}>
      <a target="_blank" className="group cursor-pointer">
      <span className="text-sm font-medium text-gray-700 group-hover:underline">
        <span>{actionLabel} {task.doc.title}</span>
      </span>
      <p className="text-sm text-gray-500 group-hover:underline">
        {subtitle}
      </p>
      </a>
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