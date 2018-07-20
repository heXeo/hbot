import parsePortShortFormat from '../../src/helpers/parsePortShortFormat'
import {expect} from 'chai'

describe('Helper parsePortShortFormat', () => {
  it('should parse single valid port', () => {
    expect(parsePortShortFormat('1234')).deep.equal({
      containerPort: 1234,
    })
  })

  it('should not parse single invalid port', () => {
    expect(parsePortShortFormat('abc')).to.be.null
  })

  it('should parse single valid port range', () => {
    expect(parsePortShortFormat('1234-2000')).deep.equal({
      containerPort: 1234,
      containerPortEnd: 2000,
    })
  })

  it('should not parse single invalid port range', () => {
    expect(parsePortShortFormat('1234-abc')).to.be.null
  })

  it('should parse valid port mapping', () => {
    expect(parsePortShortFormat('5678:1234')).deep.equal({
      containerPort: 1234,
      hostPort: 5678,
    })
  })

  it('should not parse invalid port mapping', () => {
    expect(parsePortShortFormat('abc:1234')).to.be.null
  })

  it('should parse valid tcp protocol', () => {
    expect(parsePortShortFormat('1234/tcp')).deep.equal({
      containerPort: 1234,
      protocol: 'tcp',
    })
  })

  it('should parse valid udp protocol', () => {
    expect(parsePortShortFormat('1234/udp')).deep.equal({
      containerPort: 1234,
      protocol: 'udp',
    })
  })

  it('should not parse invalid protocol', () => {
    expect(parsePortShortFormat('1234/abc')).to.be.null
  })

  it('should parse valid host ipv4', () => {
    expect(parsePortShortFormat('1.1.1.1:5678:1234')).deep.equal({
      containerPort: 1234,
      hostIp: '1.1.1.1',
      hostPort: 5678,
    })
  })

  it('should parse valid host ipv6', () => {
    expect(
      parsePortShortFormat('FE80:0000:0000:0000:0202:B3FF:FE1E:8329:5678:1234')
    ).deep.equal({
      containerPort: 1234,
      hostIp: 'FE80:0000:0000:0000:0202:B3FF:FE1E:8329',
      hostPort: 5678,
    })
  })

  it('should parse valid full expression', () => {
    expect(parsePortShortFormat('1.1.1.1:5678-6000:1234-2000/udp')).deep.equal({
      containerPort: 1234,
      containerPortEnd: 2000,
      hostIp: '1.1.1.1',
      hostPort: 5678,
      hostPortEnd: 6000,
      protocol: 'udp',
    })
  })
})
