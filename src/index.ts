import { Hono } from 'hono'
import { TimeTable } from './api/timetable'
const app = new Hono()

app.get('/', (c) => c.text('this is nuce-portal-api'))
app.get('/api/timetable', TimeTable)

export default app
