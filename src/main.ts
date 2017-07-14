import * as config from 'config';
import * as moment from 'moment';
import * as _ from 'lodash';
import bot from './resources/slackBot';
import swarm from './resources/swarm';

const Commander = require('bot-commander');

Commander.setSend((metadata: any, text: string) => {
  if (!text) {
    return;
  }
  // More information about additional params
  // https://api.slack.com/methods/chat.postMessage
  const botParams = {
    icon_emoji: config.get<string>('slack.icon')
  };
  bot.postMessage(metadata.channel, text, botParams);
});

Commander.load('commands/swarm.ts');

bot.on('start', () => {
  console.log('Started.');
});

bot.on('close', () => {
  console.error(new Error('Connection lost...'));
  process.exit(1);
});

bot.on('message', (data: any) => {
  // all ingoing events https://api.slack.com/rtm
  if (data.type === 'message' && data.subtype === undefined) {
    const command = getBotCommand(data.text);
    if (command !== null) {
      Commander.parse(command, data);
    }
  }
});

function getBotCommand (text: string) {
  if (!text) {
    return null;
  }

  if (text[0] !== '!') {
    return null;
  }

  return text.slice(1);
}

function handleEvent (event: any) {
  const botParams = {
    icon_emoji: config.get<string>('slack.icon')
  };
  const date = moment.unix(event.time).format('HH:mm:ss');
  const message = `\`\`\`[${date}] ${event.Action} :: ${event.Actor.Attributes.name}\`\`\``
  bot.postMessageToChannel(config.get<string>('ops.slackChannel'), message, botParams);
}

swarm.getEventsStream()
.then((stream: any) => {
  stream.on('data', handleEvent);
});
