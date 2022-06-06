export default function AddWebpage({value, setValue}: { value: string, setValue: (url: string) => void }) {
  return <div className="relative rounded-md shadow-sm">
  <input
    type="url"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    name="company-website"
    id="company-website"
    className="focus:ring-primary focus:border-primary block w-full px-3 sm:text-sm border-gray-300 rounded-md"
    placeholder="https://example.com/docs"
    autoFocus
  />
</div>
}