import _ from 'lodash'

interface ParsedPort {
  hostIp?: string
  hostPort?: number
  hostPortEnd?: number
  containerPort: number
  containerPortEnd?: number
  protocol?: string
  [key: string]: string | number | undefined
}

export default function parsePortShortFormat(port: string): any | null {
  // Short synthax works like this:
  // [[published_ip:]published_port[-published_port_end]:]<target_port>[-target_port_end][/protocol]
  const pattern = [
    '^',
    '(?:',
    '(?:(?<hostIp>[a-fA-F\\d.:]+):)?',
    '(?<hostPort>[\\d]*)(?:-(?<hostPortEnd>[\\d]+))?:',
    ')?',
    '(?<containerPort>[\\d]+)(?:-(?<containerPortEnd>[\\d]+))?',
    '(?:/(?<protocol>udp|tcp))?',
    '$',
  ].join('')
  const regExp = new RegExp(pattern)
  const match = port.match(regExp)

  if (match === null) {
    return null
  }

  return _.reduce(
    match['groups'],
    (parsedPort: ParsedPort, value: string, key: string) => {
      if (value !== undefined) {
        if (['hostIp', 'protocol'].includes(key)) {
          parsedPort[key] = value
        } else {
          parsedPort[key] = parseInt(value, 10)
        }
      }
      return parsedPort
    },
    {}
  )
}
