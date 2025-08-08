import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signup() {
    return { message: 'Signup successful' };
  }

  signin() {
    return { message: 'Signin' };
  }
}
