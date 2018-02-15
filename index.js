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
  'be',
  'by',
  'for',
  'from',
  'hn:',
  'how',
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
    // Get latest stories
    const ids = await api.get('newstories.json')
    const requests = ids.data.map((id) => {
      return api.get(`item/${id}.json`)
    })
    const stories = await Promise.all(requests)

    // Get all the words from the titles
    const titles = stories.map((story) => {
      return story.data.title.toLowerCase().split(' ')
    })
    const words = titles.reduce((acc, cur) => acc.concat(cur), [])

    // Build hash table of indvidual words, exclude the stopwords
    let i = words.length
    const wordsMap = {}
    while (i--) {
      if (wordsMap[words[i]] === undefined && !stopwords.includes(words[i])) {
        wordsMap[words[i]] = 0
      }
      wordsMap[words[i]]++
    }

    // Sort the keys, i.e. the words & return the top 10
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
