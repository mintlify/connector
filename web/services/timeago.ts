import TimeAgo from 'javascript-time-ago'

// TimeAgo
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

export default timeAgo