import { Context } from 'hono'
import { JSDOM } from 'jsdom'

type Lesson = {
  periods: string[]
  title: string
  teachers: string[]
  rooms: string[]
}

export const TimeTable = async (c: Context) => {
  const { userId, userPass } = c.req.header()
  const form = new FormData()
  form.append('loginForm', 'loginForm')
  form.append('loginForm:userId', userId)
  form.append('loginForm:password', userPass)
  // loginForm%3AloginButton = ""
  form.append('javax.faces.ViewState', 'stateless')

  const fetcher = await fetch(
    'https://portal.uprx.ce.nihon-u.ac.jp/uprx/up/pk/pky001/Pky00101.xhtml',
    {
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        Referer: 'https://portal.uprx.ce.nihon-u.ac.jp/uprx/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      body: form,
      method: 'POST',
    }
  )

  const dom = new JSDOM(await fetcher.text())

  const lessons: Lesson[] = []
  const lessonAreaDoms =
    dom.window.document.getElementsByClassName('lessonArea')

  for (let i = 0; i < lessonAreaDoms.length; i++) {
    const lessonAreaDom = lessonAreaDoms[i]

    const periods: string[] = []
    lessonAreaDom
      .querySelectorAll('.period')
      .forEach((v) => periods.push(v.innerHTML.trim()))

    const lessonTitle = lessonAreaDom
      .getElementsByClassName('lessonTitle')[0]
      .innerHTML.trim()

    const teachers: string[] = []
    lessonAreaDom
      .querySelectorAll('.lessonDetail > p > a')
      .forEach((v) => teachers.push(v.innerHTML.trim()))

    const rooms =
      lessonAreaDom
        .querySelector('.lessonDetail  > div')
        ?.innerHTML.trim()
        .split(/<.*>/) ?? []

    lessons.push({
      periods,
      title: lessonTitle,
      teachers,
      rooms,
    })
  }

  return c.json(lessons)
}
