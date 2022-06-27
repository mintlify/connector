import { TrashIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { ConnectionIcon } from "../helpers/Icons";
import { Code } from "../pages";

export default function CodeItem({ code, onDeleteCode }: { code: Code, onDeleteCode: (code: Code) => void }) {
  return <li className="flex items-center py-4 space-x-3">
  <ConnectionIcon outerSize={6} innerSize={4} />
  <div className="min-w-0 flex-1">
    <Link href={code.url}>
      <div className="group cursor-pointer">
        <a target="_blank" className="text-sm font-medium text-gray-700 group-hover:underline">
          <span>{code.file}</span>
        </a>
        <p className="text-sm text-gray-500 group-hover:underline">
          View on GitHub
        </p>
      </div>
    </Link>
  </div>
  <div className="flex-shrink-0">
    <button
      type="button"
      className="items-center justify-center py-1 px-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full"
      onClick={() => onDeleteCode(code)}
    >
      <span><TrashIcon className="h-4 text-gray-700" /></span>
    </button>
  </div>
</li>
}