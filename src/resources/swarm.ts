import * as config from 'config';
import dockerApi from './dockerApi';
import SwarmService from '../services/Swarm';

export default new SwarmService(dockerApi, {
  imageTagRequired: true,
  secretKey: config.get<string>('secretKey')
});
