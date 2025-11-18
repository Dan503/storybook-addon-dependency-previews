import { type PathParamOptions } from '@tanstack/react-router'
import type { getRouter } from '../router'
import type { FileRoutesByFullPath, FileRoutesByTo } from '../routeTree.gen'

type RouterType = ReturnType<typeof getRouter>

export type RouterPaths = keyof FileRoutesByFullPath

export type RouterParams = PathParamOptions<
	RouterType,
	keyof FileRoutesByTo,
	any
>['params']
