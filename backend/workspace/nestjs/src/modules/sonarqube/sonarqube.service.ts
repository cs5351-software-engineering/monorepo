import { Injectable } from '@nestjs/common';

@Injectable()
export class SonarqubeService {
  async helloWorld() {
    return 'Hello World';
  }
}
