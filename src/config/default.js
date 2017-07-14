
const env = process.env;

module.exports = {
  slack: {
    name: env.SLACK_BOT_NAME,
    token: env.SLACK_BOT_TOKEN,
    icon: env.SLACK_BOT_ICON || ':robot_face:'
  },
  docker: {
    api: {
      version: env.DOCKER_API_VERSION || '1.26',
      uri: env.DOCKER_API_URI || 'http://localhost',
    },
    proxy: {
      auth: {
        token: env.HBOT_PROXY_AUTH_TOKEN,
        username: env.HBOT_PROXY_AUTH_USER,
        password: env.HBOT_PROXY_AUTH_PASS
      }
    },
    registry: {
      auth: {
        email: env.DOCKER_REGISTRY_AUTH_EMAIL,
        username: env.DOCKER_REGISTRY_AUTH_USER,
        password: env.DOCKER_REGISTRY_AUTH_PASS
      }
    }
  },
  github: {
    username: env.GITHUB_USERNAME,
    password: env.GITHUB_PASSWORD
  },
  ops: {
    repository: env.OPS_REPOSITORY,
    path: env.OPS_PATH,
    slackChannel: env.OPS_SLACK_CHANNEL || 'ops'
  },
  secretKey: env.SECRET_KEY
};
