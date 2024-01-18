import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserLoginRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UserLoginResponseDto {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export class UserSignUpRequestDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UserSignUpResponseDto {
  id: number;
  name: string;
  email: string;
}

export class ValidateTokenRequest {
  @IsNotEmpty()
  token: string;
}
