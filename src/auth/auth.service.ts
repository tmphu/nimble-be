import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import {
  UserLoginResponseDto,
  UserSignUpRequestDto,
  UserSignUpResponseDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}
  private prisma = new PrismaClient();

  private secretKey = this.configService.get('SECRET_KEY') || 'DUMMY';

  async login(email: string, password: string): Promise<UserLoginResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new NotFoundException('Incorrect username or password');
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        throw new NotFoundException('Incorrect username or password');
      }

      const token = this.jwtService.sign({
        name: user.name,
        email: user.email,
      });
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: token,
      };
    } catch (err) {
      throw err;
    }
  }

  async signup(payload: UserSignUpRequestDto): Promise<UserSignUpResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
      },
    });
    if (user) {
      throw new ConflictException(
        'This email address has been registered in another account. Please use another one or login using this email',
      );
    }
    try {
      const response = await this.prisma.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          password: bcrypt.hashSync(payload.password, 10),
        },
      });
      return {
        id: response.id,
        name: response.name,
        email: response.email,
      };
    } catch (err) {
      throw new InternalServerErrorException('error when creating user');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verify(token, {
        secret: this.secretKey,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}
