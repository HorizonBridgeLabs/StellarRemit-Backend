import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned', type: UserResponseDto })
  @Get('me')
  me(@CurrentUser() user: any) {
    return this.users.findById(user.id);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @Patch('me')
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.users.update(user.id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete current user account' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@CurrentUser() user: any) {
    return this.users.softDelete(user.id);
  }

  @ApiOperation({ summary: 'Get user dashboard stats' })
  @ApiResponse({ status: 200, description: 'Dashboard stats returned' })
  @Get('me/stats')
  stats(@CurrentUser() user: any) {
    return this.users.getStats(user.id);
  }
}
