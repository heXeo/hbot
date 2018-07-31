import config from 'config'
import SlackApi from '../libs/SlackApi'

export default new SlackApi({
  token: config.get<string>('slack.token'),
})
