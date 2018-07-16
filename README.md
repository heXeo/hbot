# HBot [![CircleCI](https://circleci.com/gh/heXeo/hbot.svg?style=svg)](https://circleci.com/gh/heXeo/hbot)

## Description

HBot is a ops slackbot design to deploy stacks/services on Docker Swarm.
Services/Stacks definitions are suppose to be stored on a github repository as docker-compose files.
The name of the file will defines the stack or service name.

It is composed of 2 parts:

- hbot the Slack bot itself, agnostic of the Swarm configuration
- hbot-proxy which provides a REST api of the Docker socket, see details [here](https://github.com/heXeo/hbot-proxy)

HBot is design to be deploy with only 1 replica.
For security reason it should share the same `AGENT_TOKEN` with the hbot-proxy.

## Main commands

Once deployed (see next sections) there are a lot of commands available.
You'll need to use them on the bot channel in order to work.
Or you can't invite the bot a channel of your choice.
All the command have an integrated help to see subcommands and options.

Here are the main ones:

- `!swarm info`
- `!swarm node --help`
- `!swarm defintion --help`
- `!swarm stack --help`
- `!swarm service --help`

## Event logs

In addition to the commands, all docker events will logged in a Slack channel (default: ops).

## Environment's variables

- AGENT_URI: uri of the hbot agent
- AGENT_TOKEN: authication token for hbot agent
- AGENT_PROXY_USERNAME: username in case you connect the agent through a proxy
- AGENT_PROXY_PASSWORD: password in case you connect the agent through a proxy
- SLACK_BOT_NAME: name of the slackbot
- SLACK_BOT_TOKEN: slackbot token provided at creation [here]( https://my.slack.com/services/new/bot)
- SLACK_BOT_ICON: slackbot icon
- SLACK_CHANNEL: ops slack channel for hbot to listen to
- DOCKER_API_VERSION: version of the docker api (depends of the docker version)
- DOCKER_REGISTRY_EMAIL: dockerhub email
- DOCKER_REGISTRY_USERNAME: dockerhub username
- DOCKER_REGISTRY_PASSWORD: dockerhub password
- GITHUB_USERNAME: github username
- GITHUB_PASSWORD: github password or personal token
- GITHUB_REPOSITORY: name of the repository containing stack/service definitions
- GITHUB_PATH: repository path containing stack/service definitions

## Deploy

Here is a complete stack exemple including the agent (hbot-proxy):

```yml
version: "3.4"
services:
  bot:
    image: hexeo/hbot
    depends_on:
      - proxy
    networks:
      - ops
    environment:
      - AGENT_TOKEN=token1234
      - AGENT_URI=http://proxy:3000
      - SLACK_BOT_NAME=ops-bot
      - SLACK_BOT_TOKEN=xoxb-123456789012-123456789012-ABCdef123ghj456KLMnopqrs
      - DOCKER_REGISTRY_EMAIL=me@email.com
      - DOCKER_REGISTRY_USERNAME=myusername
      - DOCKER_REGISTRY_PASSWORD=mypassword
      - GITHUB_USERNAME=me
      - GITHUB_PASSWORD=1234567890abcdef1234567890abcdef12345678
      - GITHUB_REPOSITORY=me/ops
      - GITHUB_PATH=definitions
      - SECRET_KEY=mysecretkey
    deploy:
      mode: replicated
      replicas: 1

  proxy:
    image: hexeo/hbot-proxy
    networks:
      - ops
    environment:
      - AUTH_TOKEN=token1234
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    deploy:
      mode: global
      placement:
        constraints:
          - node.role == manager

networks:
  ops:
    external: true
```

## Reporting bugs and contributing

If you want to report a bug or request a feature, please open an issue.

If want to help us improve hbot, fork and make a pull request.
But before drop an eye on [emoji commit](https://github.com/slashsBin/styleguide-git-commit-message).
