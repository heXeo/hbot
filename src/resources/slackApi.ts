import config from 'config'
import SlackApi from '../lib/SlackApi'

export default new SlackApi({
  token: config.get<string>('slack.token'),
})
