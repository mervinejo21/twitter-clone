import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ status: 200, description: 'Return the user' })
    @ApiResponse({ status: 404, description: 'User not found' })
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Get('username/:username')
    @ApiOperation({ summary: 'Get a user by username' })
    @ApiResponse({ status: 200, description: 'Return the user' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findByUsername(@Param('username') username: string) {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new NotFoundException(`User with username ${username} not found`);
        }
        const { password, ...result } = user;
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req,
    ) {
        // Only allow users to update their own profile
        if (req.user.id !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }
        return this.usersService.update(id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async remove(@Param('id') id: string, @Request() req) {
        // Only allow users to delete their own profile
        if (req.user.id !== id) {
            throw new ForbiddenException('You can only delete your own profile');
        }
        return this.usersService.remove(id);
    }

    @Get(':id/followers')
    @ApiOperation({ summary: 'Get followers of a user' })
    @ApiResponse({ status: 200, description: 'Return the followers' })
    @ApiResponse({ status: 404, description: 'User not found' })
    getFollowers(@Param('id') id: string) {
        return this.usersService.getFollowers(id);
    }

    @Get(':id/following')
    @ApiOperation({ summary: 'Get users followed by a user' })
    @ApiResponse({ status: 200, description: 'Return the following users' })
    @ApiResponse({ status: 404, description: 'User not found' })
    getFollowing(@Param('id') id: string) {
        return this.usersService.getFollowing(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/follow')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Follow a user' })
    @ApiResponse({ status: 201, description: 'User followed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'User not found' })
    followUser(@Param('id') id: string, @Request() req) {
        return this.usersService.followUser(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/follow')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unfollow a user' })
    @ApiResponse({ status: 200, description: 'User unfollowed successfully' })
    @ApiResponse({ status: 404, description: 'User not found or not following' })
    unfollowUser(@Param('id') id: string, @Request() req) {
        return this.usersService.unfollowUser(req.user.id, id);
    }
} 