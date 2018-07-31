import composeVersionChecker from '../../src/helpers/composeVersionChecker'
import {expect} from 'chai'

describe('Helper composeVersionChecker', () => {
  it('should succeed for valid compose version', async () => {
    const nodesInfo: Array<any> = [
      {Description: {Engine: {EngineVersion: '18.03.1-ce'}}},
    ]
    expect(composeVersionChecker('3.1', nodesInfo)).to.be.true
  })

  it('should fail for too high compose version', async () => {
    const nodesInfo: Array<any> = [
      {Description: {Engine: {EngineVersion: '18.03.1-ce'}}},
    ]
    expect(composeVersionChecker('3.7', nodesInfo)).to.be.false
  })

  it('should take the api version into account', async () => {
    const nodesInfo: Array<any> = [
      {Description: {Engine: {EngineVersion: '18.03.1-ce'}}},
    ]
    expect(composeVersionChecker('3.1', nodesInfo, '1.24')).to.be.false
  })

  it('should consider the lower version of all nodes', async () => {
    const nodesInfo: Array<any> = [
      {Description: {Engine: {EngineVersion: '18.03.1-ce'}}},
      {Description: {Engine: {EngineVersion: '1.13.0'}}},
    ]
    expect(composeVersionChecker('3.1', nodesInfo)).to.be.false
  })
})
