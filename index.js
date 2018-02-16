/**
 * Node demo app getting the top-10 most used words of story titles
 *
 * @author  Elco Brouwer von Gonzenbach <elco.brouwer@gmail.com>
 * @version 0.1.0
 */
'use strict'

const app = require('express')()
const api = require('./api')
const stopwords = [
  'a',
  'an',
  'and',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'hn:',
  'how',
  'i',
  'in',
  'is',
  'it',
  'not',
  'of',
  'on',
  'the',
  'to',
  'what',
  'why',
  'with',
  '–'
]

app.get('/top-words', async (req, res) => {
  try {
    // Get latest 500 stories
    const ids = await api.get('newstories.json')
    const requests = ids.data.map((id) => {
      return api.get(`item/${id}.json`)
    })
    let stories = await Promise.all(requests)

    // Get the next 100 stories
    const targetNum = stories.length + 100
    let id = ids.data.pop() - 1 // Count down from last ID

    // Get items in chunks of 100 concurrent requests
    while (stories.length < targetNum) {
      let numRequests = 100
      const extraRequests = []
      while (numRequests--) {
        extraRequests.push(api.get(`item/${id}.json`))
        id--
      }
      const items = await Promise.all(extraRequests)

      // Filter out the stories
      const extraStories = items.filter((item) => {
        return item.data.type === 'story'
      })

      // Append stories
      if (extraStories.length < (targetNum - stories.length)) {
        stories = stories.concat(extraStories)
      } else {
        stories = stories.concat(extraStories.slice(0, targetNum - stories.length))
      }
    }

    // Get all the words from the titles
    const words = stories.reduce((arr, story) => {
      if (story.data.title !== undefined) {
        return arr.concat(story.data.title.toLowerCase().split(' '))
      }
      return arr
    }, [])

    const wordsMap = words.reduce((dict, word) => {
      if (!stopwords.includes(word)) {
        dict[word] = (dict[word] || 0) + 1
      }
      return dict
    }, {})

    // Sort the key words & return the top 10
    const keysSorted = Object.keys(wordsMap).sort((a, b) => wordsMap[b] - wordsMap[a])
    const topWords = {}
    for (let i = 0; i < 10; i++) {
      topWords[keysSorted[i]] = wordsMap[keysSorted[i]]
    }
    res.json(topWords)
  } catch (error) {
    console.error(error)
  }
})
app.use((req, res) => res.status(404).send('Not found'))

app.listen(3000, () => {
  console.log(`Process ${process.pid} listening on 3000`)
})
