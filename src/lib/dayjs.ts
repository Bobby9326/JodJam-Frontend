import dayjs from 'dayjs'
import 'dayjs/locale/th'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import isLeapYear from 'dayjs/plugin/isLeapYear'

dayjs.extend(dayOfYear)
dayjs.extend(isLeapYear)
dayjs.locale('th')

export default dayjs
