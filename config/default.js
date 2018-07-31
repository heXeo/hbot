const env = process.env

module.exports = {
  agent: {
    uri: env.AGENT_URI || 'http://localhost',
    token: env.AGENT_TOKEN,
    proxy: {
      username: env.AGENT_PROXY_USERNAME || null,
      password: env.AGENT_PROXY_PASSWORD || null,
    },
  },
  slack: {
    name: env.SLACK_BOT_NAME,
    token: env.SLACK_BOT_TOKEN,
    icon: env.SLACK_BOT_ICON || ':robot_face:',
    channel: env.SLACK_CHANNEL || 'ops',
  },
  docker: {
    registry: {
      email: env.DOCKER_REGISTRY_EMAIL,
      username: env.DOCKER_REGISTRY_USERNAME,
      password: env.DOCKER_REGISTRY_PASSWORD,
    },
  },
  github: {
    username: env.GITHUB_USERNAME,
    password: env.GITHUB_PASSWORD,
    repository: env.GITHUB_REPOSITORY,
    path: env.GITHUB_PATH,
  },
  secretKey: env.SECRET_KEY,
}
