import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  UserLoginRequestDto,
  UserLoginResponseDto,
  UserSignUpRequestDto,
  UserSignUpResponseDto,
  ValidateTokenRequest,
} from './dto/auth.dto';

@Controller({ path: 'api/v1/auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(
    @Body() body: UserLoginRequestDto,
  ): Promise<UserLoginResponseDto> {
    const { email, password } = body;
    return await this.authService.login(email, password);
  }

  @Post('/signup')
  async signup(
    @Body() body: UserSignUpRequestDto,
  ): Promise<UserSignUpResponseDto> {
    return await this.authService.signup(body);
  }

  @Post('/validate-token')
  async validateToken(@Body() body: ValidateTokenRequest): Promise<boolean> {
    const { token } = body;
    return await this.authService.validateToken(token);
  }
}
