import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async create(user: User) {
    return this.userRepository.save(user);
  }

  async update(user: User) {
    return this.userRepository.save(user);
  }

  async delete(id: number) {
    return this.userRepository.delete(id);
  }
}
