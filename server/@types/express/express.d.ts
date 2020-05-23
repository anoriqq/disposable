import { RequestHandler } from "express";
import { ParsedQs } from "qs";
declare module "express-serve-static-core" {
  type Error = {
    code: number;
    message: string;
  };
  type Project = {
    createTime?: string;
    labels?: any;
    lifecycleState?: string;
    name?: string;
    projectId?: string;
    projectNumber?: string;
  };
  type Instance = {
    cpuPlatform?: string;
    creationTimestamp?: string;
    description?: string;
    disks?: {
      autoDelete?: boolean;
      boot?: boolean;
      deviceName?: string;
      diskSizeGb?: string;
      interface?: string;
      kind?: string;
      mode?: string;
      source?: string;
      type?: string;
    }[];
    hostname?: string;
    id?: string;
    kind?: string;
    labels?: any;
    machineType?: string;
    metadata?: {
      items?: {
        key?: string;
        value?: string;
      }[];
    };
    name?: string;
    networkInterfaces?: {
      name?: string;
      network?: string;
      networkIP?: string;
      subnetwork?: string;
    }[];
    status?: string;
    statusMessage?: string;
    zone?: string;
  };
  type _ResBody<
    M extends
      | "all"
      | "get"
      | "post"
      | "put"
      | "delete"
      | "patch"
      | "options"
      | "head" = any,
    GetRes = any,
    PostRes = any,
    PutRes = any,
    DeleteRes = any,
    PatchRes = any
  > = "get" extends M
    ? GetRes
    : "post" extends M
    ? PostRes
    : "put" extends M
    ? PutRes
    : "delete" extends M
    ? DeleteRes
    : "patch" extends M
    ? PatchRes
    : any;
  type _ReqBody<
    M extends
      | "all"
      | "get"
      | "post"
      | "put"
      | "delete"
      | "patch"
      | "options"
      | "head" = any,
    GetRes = any,
    PostRes = any,
    PutRes = any,
    DeleteRes = any,
    PatchRes = any
  > = "get" extends M
    ? GetRes
    : "post" extends M
    ? PostRes
    : "put" extends M
    ? PutRes
    : "delete" extends M
    ? DeleteRes
    : "patch" extends M
    ? PatchRes
    : any;
  type _ReqQuery<
    M extends
      | "all"
      | "get"
      | "post"
      | "put"
      | "delete"
      | "patch"
      | "options"
      | "head" = any,
    GetRes = any,
    PostRes = any,
    PutRes = any,
    DeleteRes = any,
    PatchRes = any
  > = "get" extends M
    ? GetRes
    : "post" extends M
    ? PostRes
    : "put" extends M
    ? PutRes
    : "delete" extends M
    ? DeleteRes
    : "patch" extends M
    ? PatchRes
    : any;
  export interface IRouterMatcher<
    T,
    Method extends
      | "all"
      | "get"
      | "post"
      | "put"
      | "delete"
      | "patch"
      | "options"
      | "head" = any
  > {
    <
      P extends Params = ParamsDictionary,
      ResBody = _ResBody<Method, string, any, any, any, any>,
      ReqBody = _ReqBody<Method, null, any, any, any, any>,
      ReqQuery = _ReqQuery<Method, null, ParsedQs, ParsedQs, ParsedQs, ParsedQs>
    >(
      path: "/health",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
    <
      P extends Params = ParamsDictionary,
      ResBody = _ResBody<
        Method,
        {
          displayName?: string;
          hasProject?: boolean;
          hasInstance?: boolean;
        },
        any,
        any,
        null,
        any
      >,
      ReqBody = _ReqBody<Method, null, any, any, null, any>,
      ReqQuery = _ReqQuery<Method, null, ParsedQs, ParsedQs, null, ParsedQs>
    >(
      path: "/user",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
    <
      P extends Params = ParamsDictionary,
      ResBody = _ResBody<Method, null, any, any, any, any>,
      ReqBody = _ReqBody<Method, null, any, any, any, any>,
      ReqQuery = _ReqQuery<Method, null, ParsedQs, ParsedQs, ParsedQs, ParsedQs>
    >(
      path: "/user/logout",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
    <
      P extends Params = ParamsDictionary,
      ResBody = _ResBody<Method, null, any, any, any, any>,
      ReqBody = _ReqBody<Method, null, any, any, any, any>,
      ReqQuery = _ReqQuery<Method, null, ParsedQs, ParsedQs, ParsedQs, ParsedQs>
    >(
      path: "/user/auth",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
    <
      P extends Params = ParamsDictionary,
      ResBody = _ResBody<Method, null, any, any, any, any>,
      ReqBody = _ReqBody<Method, null, any, any, any, any>,
      ReqQuery = _ReqQuery<Method, null, ParsedQs, ParsedQs, ParsedQs, ParsedQs>
    >(
      path: "/user/auth/callback",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
    <
      P extends Params = ParamsDictionary,
      ResBody = _ResBody<Method, Project, Project, any, null, any>,
      ReqBody = _ReqBody<Method, null, null, any, null, any>,
      ReqQuery = _ReqQuery<Method, null, null, ParsedQs, null, ParsedQs>
    >(
      path: "/project",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
    <
      P extends Params = ParamsDictionary,
      ResBody = _ResBody<Method, Instance, Instance, any, any, any>,
      ReqBody = _ReqBody<
        Method,
        null,
        {
          region: string;
          zone: string;
          machineType: string;
          imageProject: string;
          imageFamily: string;
          diskSizeGb: string;
          sshPublicKey: string;
        },
        any,
        any,
        any
      >,
      ReqQuery = _ReqQuery<Method, null, null, ParsedQs, ParsedQs, ParsedQs>
    >(
      path: "/instance",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
    <
      P extends Params = ParamsDictionary,
      ResBody = _ResBody<
        Method,
        {
          name?: string;
          region?: string;
        }[],
        any,
        any,
        any,
        any
      >,
      ReqBody = _ReqBody<Method, null, any, any, any, any>,
      ReqQuery = _ReqQuery<Method, null, ParsedQs, ParsedQs, ParsedQs, ParsedQs>
    >(
      path: "/instance/zones",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
  }
}
