# HBot

## Description

HBot is a ops slackbot design to deploy stacks/services on Docker Swarm.
Services/Stacks definitions are suppose to be stored on a github repository as docker-compose files.
The name of the file will defines the stack or service name.

It is composed of 2 parts:

- hbot the Slack bot itself, agnostic of the Swarm configuration
- hbot-proxy which provides a REST api of the Docker socket, see details [here](https://github.com/heXeo/hbot)

HBot is design to be deploy with only 1 replica.
For security reason it should share the same `HBOT_PROXY_AUTH_TOKEN` with the hbot-proxy.

## Environment's variables

- AGENT_TOKEN: authication token for hbot agent
- AGENT_PROXY_USERNAME: username in case you connect the agent through a proxy
- AGENT_PROXY_PASSWORD: password in case you connect the agent through a proxy
- SLACK_BOT_NAME: name of the slackbot
- SLACK_BOT_TOKEN: slackbot token provided at creation [here]( https://my.slack.com/services/new/bot)
- SLACK_BOT_ICON: slackbot icon
- SLACK_CHANNEL: ops slack channel for hbot to listen to
- DOCKER_API_VERSION: version of the docker api (depends of the docker version)
- DOCKER_API_URI: uri of the hbot proxy
- DOCKER_REGISTRY_AUTH_EMAIL: dockerhub email
- DOCKER_REGISTRY_AUTH_USER: dockerhub username
- DOCKER_REGISTRY_AUTH_PASS: dockerhub password
- GITHUB_USERNAME: github username
- GITHUB_PASSWORD: github password or personal token
- GITHUB_REPOSITORY: github repository containing stack/service definitions
- GITHUB_PATH: github repository path containing stack/service definitions

## Reporting bugs and contributing

If you want to report a bug or request a feature, please open an issue.

If want to help us improve hbot, fork and make a pull request.
But before drop an eye on [emoji commit](https://gist.github.com/parmentf/035de27d6ed1dce0b36a).
