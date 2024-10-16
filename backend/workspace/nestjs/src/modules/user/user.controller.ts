import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  async getAllUser() {
    return this.userService.getAllUsers();
  }

  @Get('byemail')
  async getUserByEmail(@Query('email') email: string) {
    return this.userService.getUserByEmail(email);
  }
}
