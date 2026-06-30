/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as amoreAuthz from "../amoreAuthz.js";
import type * as amoreProgression from "../amoreProgression.js";
import type * as amoreProjects from "../amoreProjects.js";
import type * as amoreSignals from "../amoreSignals.js";
import type * as auth from "../auth.js";
import type * as authz from "../authz.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as posts from "../posts.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  amoreAuthz: typeof amoreAuthz;
  amoreProgression: typeof amoreProgression;
  amoreProjects: typeof amoreProjects;
  amoreSignals: typeof amoreSignals;
  auth: typeof auth;
  authz: typeof authz;
  http: typeof http;
  images: typeof images;
  posts: typeof posts;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
