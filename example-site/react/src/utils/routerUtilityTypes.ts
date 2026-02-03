import { type PathParamOptions } from '@tanstack/react-router'
import type { getRouter } from '../router'
import type { FileRoutesByTo } from '../routeTree.gen'

type RouterType = ReturnType<typeof getRouter>

export type RouterPaths = keyof FileRoutesByTo

export type RouterParams = PathParamOptions<
	RouterType,
	RouterPaths,
	any
>['params']
