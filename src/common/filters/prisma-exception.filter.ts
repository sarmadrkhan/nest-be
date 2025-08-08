import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let httpException;

    switch (exception.code) {
      case 'P2002':
        httpException = new ConflictException('Record already exists');
        break;
      case 'P2025':
        httpException = new BadRequestException('Record not found');
        break;
      default:
        httpException = new BadRequestException('Database error occurred');
        break;
    }

    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}
