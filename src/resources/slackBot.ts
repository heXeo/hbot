import config from 'config'
const SlackBot = require('slackbots')

export default new SlackBot({
  token: config.get<string>('slack.token'),
  name: config.get<string>('slack.name'),
})
