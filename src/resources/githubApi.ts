import config from 'config'
import GithubApi from '../libs/GithubApi'

export default new GithubApi({
  username: config.get<string>('github.username'),
  password: config.get<string>('github.password'),
})
