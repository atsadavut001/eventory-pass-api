import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { ReqUser } from "./decorators/user.decorator";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {
    // Triggers Google OAuth redirect
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const user = await this.authService.validateGoogleUser(req.user);
    const loginResult = await this.authService.login(user);
    const frontendUrl = process.env.FRONTEND_URL || "https://eventory-pass-web.vercel.app";

    // Redirect to frontend callback page with JWT token and user info
    const token = encodeURIComponent(loginResult.accessToken);
    const userStr = encodeURIComponent(JSON.stringify(loginResult.user));
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${userStr}`);
  }

  @Post("google/signin")
  async googleSignIn(
    @Body()
    body: {
      googleId: string;
      email: string;
      firstName: string;
      lastName: string;
      picture?: string;
    },
  ) {
    // Allows direct sign-in from frontend Google OAuth SDK / Custom Google Login button
    const userProfile = {
      googleId: body.googleId,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      picture: body.picture || "",
    };
    const user = await this.authService.validateGoogleUser(userProfile);
    return this.authService.login(user);
  }

  @Post("mock-login")
  async mockLogin(
    @Body()
    body: {
      email: string;
      firstName?: string;
      lastName?: string;
      isAdmin?: boolean;
    },
  ) {
    // Developer convenience route to bypass Google API setup barriers
    const email = body.email || "guest@example.com";
    const profile = {
      googleId: `mock-${email}`,
      email,
      firstName: body.firstName || "Mock",
      lastName: body.lastName || "User",
      picture:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    };
    let user = await this.authService.validateGoogleUser(profile);

    // Force admin flag if requested
    if (body.isAdmin !== undefined && user.isAdmin !== body.isAdmin) {
      user = await this.usersService.update(user.id, { isAdmin: body.isAdmin });
    }

    return this.authService.login(user);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@ReqUser() user: User) {
    return user;
  }
}
