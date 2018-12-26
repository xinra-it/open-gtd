import {
  HttpException,
  OpenGtdApi,
  TypedHttpException,
  UnauthorizedHttpException,
  ValidationException
} from '@open-gtd/api'
import Axios from 'axios'
import { createConsumer } from 'rest-ts-axios'
import { of } from 'rxjs'
import { ApiErrorHandler } from '.'

const driver = Axios.create({
  baseURL: 'http://localhost:3001/api'
})

export const openGtdApi = createConsumer(OpenGtdApi, driver)

export type OpenGtdApiConsumer = typeof openGtdApi

export const handleOpenGtdApiError: ApiErrorHandler = failureActionCreator => (
  err,
  caught
) => {
  // See https://gist.github.com/fgilio/230ccd514e9381fafa51608fcf137253
  if (err.response) {
    // The request was made and the server responded with a non 2xx status code
    err = reconstructOriginalHttpException(err.response.data)
  }
  return of(failureActionCreator(err))
}

interface ClassType<T> {
  new (...args: any[]): T
}

/**
 * Exception types that should recustructed. Every other `TypedException` is
 * turned into an `HttpException`.
 */
const RECONSTRUCTABLE_HTTP_EXCEPTIONS: ReadonlyArray<
  ClassType<HttpException>
> = [ValidationException, UnauthorizedHttpException]

/**
 * Creates an instance of the original exception type that can be used with
 * `instanceof`.
 */
function reconstructOriginalHttpException(
  typedException: TypedHttpException
): HttpException {
  let reconstructedType: ClassType<HttpException> = HttpException
  for (const reconstructableType of RECONSTRUCTABLE_HTTP_EXCEPTIONS) {
    if (reconstructableType.name === typedException.type) {
      reconstructedType = reconstructableType
    }
  }
  const reconstructedException = { ...typedException }
  delete reconstructedException.type
  Object.setPrototypeOf(reconstructedException, reconstructedType.prototype)
  return (reconstructedException as unknown) as HttpException
}