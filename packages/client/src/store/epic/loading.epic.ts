import { combineEpics } from 'redux-observable'
import { catchError, filter, flatMap, map, switchMap } from 'rxjs/operators'
import { isActionOf } from 'typesafe-actions'
import { AppEpic } from '.'
import {
  AppAction,
  loadingActions,
  routerActions,
  syncActions
} from '../actions'
import { isCurrentPageLoginOrRegister } from './util'

const loadContent: AppEpic = (
  action$,
  state$,
  { openGtdApi, handleOpenGtdApiError }
) =>
  action$.pipe(
    filter(isActionOf(loadingActions.loadContent.request)),
    switchMap(async () => ({
      tasks: (await openGtdApi.getTaskList()).data,
      contexts: (await openGtdApi.getContextList()).data
    })),
    map(content => loadingActions.loadContent.success(content)),
    catchError(handleOpenGtdApiError(loadingActions.loadContent.failure))
  )

const loadContentSuccess: AppEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(loadingActions.loadContent.success)),
    flatMap(() => {
      const actions: AppAction[] = [syncActions.enableSync.request()]
      if (isCurrentPageLoginOrRegister(state$)) {
        actions.push(routerActions.push('/'))
      }
      return actions
    })
  )

export const loadingEpic = combineEpics(loadContent, loadContentSuccess)