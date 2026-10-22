import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTableDto, JoinTableDto } from './dto/table.dto';

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.tablesService.findAll({ type, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  findById(@Param('id') id: string) {
    return this.tablesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new table' })
  create(@Body() dto: CreateTableDto) {
    return this.tablesService.create(dto);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a table' })
  join(
    @Param('id') id: string,
    @Body() dto: JoinTableDto,
    @Request() req: any,
  ) {
    return this.tablesService.joinTable(id, req.user.id, dto.buyIn, dto.seatNumber);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a table' })
  leave(@Param('id') id: string, @Request() req: any) {
    return this.tablesService.leaveTable(id, req.user.id);
  }
}
