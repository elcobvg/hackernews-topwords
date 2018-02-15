'use strict'

const axios = require('axios')

// Hackernews API
const api = axios.create({
  baseURL: 'https://hacker-news.firebaseio.com/v0/',
  timeout: 60000,
  headers: {
    'Accept': 'application/json'
  }
})

module.exports = api
