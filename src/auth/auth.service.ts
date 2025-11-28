import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create(registerDto);
      const tokens = await this.generateTokens(user);
      
      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Error al registrar usuario');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await this.usersService.validatePassword(user, loginDto.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await this.usersService.validatePassword(user, password)) {
      return this.sanitizeUser(user);
    }
    
    return null;
  }

  private async generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const secret = this.configService.get<string>('jwt.secret') || 'your-secret-key';
    const expiresIn = (this.configService.get<string>('jwt.expiresIn') || '1d') as string;
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') || 'your-refresh-secret-key';
    const refreshExpiresIn = (this.configService.get<string>('jwt.refreshExpiresIn') || '7d') as string;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn,
      } as any),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      } as any),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: any) {
    const userObj = user.toObject ? user.toObject() : user;
    const { password, ...sanitized } = userObj;
    return sanitized;
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret') || 'your-refresh-secret-key';
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no válido');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }
}

