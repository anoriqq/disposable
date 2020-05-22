import { RequestHandler } from "express";
import { ParsedQs } from "qs";
declare module "express-serve-static-core" {
  type Error = {
    code: number;
    message: string;
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
      ResBody = _ResBody<Method, null, any, any, null, any>,
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
      ResBody = _ResBody<
        Method,
        {
          vm: string;
        },
        null,
        any,
        any,
        any
      >,
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
      path: "/vm",
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
      path: "/vm/zones",
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ): T;
  }
}
