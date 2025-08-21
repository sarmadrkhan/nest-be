import { ArgumentsHost, Catch, ExceptionFilter, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PRIMSA_EXCEPTIONS } from '../constants';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let httpException;

    switch (exception.code) {
      case PRIMSA_EXCEPTIONS.CONFLICT.code:
        httpException = new ConflictException(PRIMSA_EXCEPTIONS.CONFLICT.message);
        break;
      case PRIMSA_EXCEPTIONS.NOT_FOUND.code:
        httpException = new BadRequestException(PRIMSA_EXCEPTIONS.NOT_FOUND.message);
        break;
      default:
        httpException = new BadRequestException(PRIMSA_EXCEPTIONS.DATABASE_ERROR.message);
        break;
    }

    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}
