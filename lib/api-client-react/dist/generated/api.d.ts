import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdClickRequest, AdminCreateUserRequest, AdminFollowItem, AdminFollowRequest, AdminUpdateUserRequest, AdminUserItem, AuthResponse, ErrorResponse, FollowData, FollowResponse, HealthStatus, LoginRequest, MessageResponse, PlatformSettings, RegisterRequest, UpdateProfileRequest, UserListItem, UserProfile } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Register a new user
 */
export declare const getRegisterUrl: () => string;
export declare const register: (registerRequest: RegisterRequest, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterRequest>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterRequest>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Register a new user
 */
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterRequest>;
}, TContext>;
/**
 * @summary Login
 */
export declare const getLoginUrl: () => string;
export declare const login: (loginRequest: LoginRequest, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginRequest>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginRequest>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Login
 */
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginRequest>;
}, TContext>;
/**
 * @summary Logout
 */
export declare const getLogoutUrl: () => string;
export declare const logout: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
 * @summary Logout
 */
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
/**
 * @summary Get current user
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<UserProfile>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update own profile
 */
export declare const getUpdateMeUrl: () => string;
export declare const updateMe: (updateProfileRequest: UpdateProfileRequest, options?: RequestInit) => Promise<UserProfile>;
export declare const getUpdateMeMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<UpdateProfileRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<UpdateProfileRequest>;
}, TContext>;
export type UpdateMeMutationResult = NonNullable<Awaited<ReturnType<typeof updateMe>>>;
export type UpdateMeMutationBody = BodyType<UpdateProfileRequest>;
export type UpdateMeMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update own profile
 */
export declare const useUpdateMe: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<UpdateProfileRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<UpdateProfileRequest>;
}, TContext>;
/**
 * @summary List all users (for following)
 */
export declare const getListUsersUrl: () => string;
export declare const listUsers: (options?: RequestInit) => Promise<UserListItem[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users (for following)
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get user profile
 */
export declare const getGetUserByIdUrl: (userId: number) => string;
export declare const getUserById: (userId: number, options?: RequestInit) => Promise<UserListItem>;
export declare const getGetUserByIdQueryKey: (userId: number) => readonly [`/api/users/${number}`];
export declare const getGetUserByIdQueryOptions: <TData = Awaited<ReturnType<typeof getUserById>>, TError = ErrorType<unknown>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserById>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUserById>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserByIdQueryResult = NonNullable<Awaited<ReturnType<typeof getUserById>>>;
export type GetUserByIdQueryError = ErrorType<unknown>;
/**
 * @summary Get user profile
 */
export declare function useGetUserById<TData = Awaited<ReturnType<typeof getUserById>>, TError = ErrorType<unknown>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserById>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get who I follow and who follows me
 */
export declare const getGetMyFollowsUrl: () => string;
export declare const getMyFollows: (options?: RequestInit) => Promise<FollowData>;
export declare const getGetMyFollowsQueryKey: () => readonly ["/api/follows"];
export declare const getGetMyFollowsQueryOptions: <TData = Awaited<ReturnType<typeof getMyFollows>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyFollows>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyFollows>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyFollowsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyFollows>>>;
export type GetMyFollowsQueryError = ErrorType<unknown>;
/**
 * @summary Get who I follow and who follows me
 */
export declare function useGetMyFollows<TData = Awaited<ReturnType<typeof getMyFollows>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyFollows>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Follow a user
 */
export declare const getFollowUserUrl: (targetUserId: number) => string;
export declare const followUser: (targetUserId: number, options?: RequestInit) => Promise<FollowResponse>;
export declare const getFollowUserMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
        targetUserId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
    targetUserId: number;
}, TContext>;
export type FollowUserMutationResult = NonNullable<Awaited<ReturnType<typeof followUser>>>;
export type FollowUserMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Follow a user
 */
export declare const useFollowUser: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
        targetUserId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof followUser>>, TError, {
    targetUserId: number;
}, TContext>;
/**
 * @summary Unfollow a user
 */
export declare const getUnfollowUserUrl: (targetUserId: number) => string;
export declare const unfollowUser: (targetUserId: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getUnfollowUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unfollowUser>>, TError, {
        targetUserId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof unfollowUser>>, TError, {
    targetUserId: number;
}, TContext>;
export type UnfollowUserMutationResult = NonNullable<Awaited<ReturnType<typeof unfollowUser>>>;
export type UnfollowUserMutationError = ErrorType<unknown>;
/**
 * @summary Unfollow a user
 */
export declare const useUnfollowUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unfollowUser>>, TError, {
        targetUserId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof unfollowUser>>, TError, {
    targetUserId: number;
}, TContext>;
/**
 * @summary Admin - get platform settings
 */
export declare const getAdminGetSettingsUrl: () => string;
export declare const adminGetSettings: (options?: RequestInit) => Promise<PlatformSettings>;
export declare const getAdminGetSettingsQueryKey: () => readonly ["/api/admin/settings"];
export declare const getAdminGetSettingsQueryOptions: <TData = Awaited<ReturnType<typeof adminGetSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetSettings>>>;
export type AdminGetSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Admin - get platform settings
 */
export declare function useAdminGetSettings<TData = Awaited<ReturnType<typeof adminGetSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin - update platform settings
 */
export declare const getAdminUpdateSettingsUrl: () => string;
export declare const adminUpdateSettings: (platformSettings: PlatformSettings, options?: RequestInit) => Promise<PlatformSettings>;
export declare const getAdminUpdateSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateSettings>>, TError, {
        data: BodyType<PlatformSettings>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateSettings>>, TError, {
    data: BodyType<PlatformSettings>;
}, TContext>;
export type AdminUpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateSettings>>>;
export type AdminUpdateSettingsMutationBody = BodyType<PlatformSettings>;
export type AdminUpdateSettingsMutationError = ErrorType<unknown>;
/**
 * @summary Admin - update platform settings
 */
export declare const useAdminUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateSettings>>, TError, {
        data: BodyType<PlatformSettings>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateSettings>>, TError, {
    data: BodyType<PlatformSettings>;
}, TContext>;
/**
 * @summary Get public platform settings (active ad links etc)
 */
export declare const getGetPublicSettingsUrl: () => string;
export declare const getPublicSettings: (options?: RequestInit) => Promise<PlatformSettings>;
export declare const getGetPublicSettingsQueryKey: () => readonly ["/api/admin/settings/public"];
export declare const getGetPublicSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getPublicSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPublicSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPublicSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getPublicSettings>>>;
export type GetPublicSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get public platform settings (active ad links etc)
 */
export declare function useGetPublicSettings<TData = Awaited<ReturnType<typeof getPublicSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Record a click on an ad link (public - no auth required)
 */
export declare const getRecordAdClickUrl: () => string;
export declare const recordAdClick: (adClickRequest: AdClickRequest, options?: RequestInit) => Promise<MessageResponse>;
export declare const getRecordAdClickMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordAdClick>>, TError, {
        data: BodyType<AdClickRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof recordAdClick>>, TError, {
    data: BodyType<AdClickRequest>;
}, TContext>;
export type RecordAdClickMutationResult = NonNullable<Awaited<ReturnType<typeof recordAdClick>>>;
export type RecordAdClickMutationBody = BodyType<AdClickRequest>;
export type RecordAdClickMutationError = ErrorType<unknown>;
/**
 * @summary Record a click on an ad link (public - no auth required)
 */
export declare const useRecordAdClick: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordAdClick>>, TError, {
        data: BodyType<AdClickRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof recordAdClick>>, TError, {
    data: BodyType<AdClickRequest>;
}, TContext>;
/**
 * @summary Admin - list all users with details
 */
export declare const getAdminListUsersUrl: () => string;
export declare const adminListUsers: (options?: RequestInit) => Promise<AdminUserItem[]>;
export declare const getAdminListUsersQueryKey: () => readonly ["/api/admin/users"];
export declare const getAdminListUsersQueryOptions: <TData = Awaited<ReturnType<typeof adminListUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof adminListUsers>>>;
export type AdminListUsersQueryError = ErrorType<unknown>;
/**
 * @summary Admin - list all users with details
 */
export declare function useAdminListUsers<TData = Awaited<ReturnType<typeof adminListUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin - create a new user
 */
export declare const getAdminCreateUserUrl: () => string;
export declare const adminCreateUser: (adminCreateUserRequest: AdminCreateUserRequest, options?: RequestInit) => Promise<AdminUserItem>;
export declare const getAdminCreateUserMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateUser>>, TError, {
        data: BodyType<AdminCreateUserRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminCreateUser>>, TError, {
    data: BodyType<AdminCreateUserRequest>;
}, TContext>;
export type AdminCreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof adminCreateUser>>>;
export type AdminCreateUserMutationBody = BodyType<AdminCreateUserRequest>;
export type AdminCreateUserMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Admin - create a new user
 */
export declare const useAdminCreateUser: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateUser>>, TError, {
        data: BodyType<AdminCreateUserRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminCreateUser>>, TError, {
    data: BodyType<AdminCreateUserRequest>;
}, TContext>;
/**
 * @summary Admin - update user
 */
export declare const getAdminUpdateUserUrl: (userId: number) => string;
export declare const adminUpdateUser: (userId: number, adminUpdateUserRequest: AdminUpdateUserRequest, options?: RequestInit) => Promise<AdminUserItem>;
export declare const getAdminUpdateUserMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUser>>, TError, {
        userId: number;
        data: BodyType<AdminUpdateUserRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUser>>, TError, {
    userId: number;
    data: BodyType<AdminUpdateUserRequest>;
}, TContext>;
export type AdminUpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateUser>>>;
export type AdminUpdateUserMutationBody = BodyType<AdminUpdateUserRequest>;
export type AdminUpdateUserMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Admin - update user
 */
export declare const useAdminUpdateUser: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUser>>, TError, {
        userId: number;
        data: BodyType<AdminUpdateUserRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateUser>>, TError, {
    userId: number;
    data: BodyType<AdminUpdateUserRequest>;
}, TContext>;
/**
 * @summary Admin - delete user
 */
export declare const getAdminDeleteUserUrl: (userId: number) => string;
export declare const adminDeleteUser: (userId: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getAdminDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteUser>>, TError, {
        userId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteUser>>, TError, {
    userId: number;
}, TContext>;
export type AdminDeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteUser>>>;
export type AdminDeleteUserMutationError = ErrorType<unknown>;
/**
 * @summary Admin - delete user
 */
export declare const useAdminDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteUser>>, TError, {
        userId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteUser>>, TError, {
    userId: number;
}, TContext>;
/**
 * @summary Admin - list all follow relationships
 */
export declare const getAdminListFollowsUrl: () => string;
export declare const adminListFollows: (options?: RequestInit) => Promise<AdminFollowItem[]>;
export declare const getAdminListFollowsQueryKey: () => readonly ["/api/admin/follows"];
export declare const getAdminListFollowsQueryOptions: <TData = Awaited<ReturnType<typeof adminListFollows>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListFollows>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListFollows>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListFollowsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListFollows>>>;
export type AdminListFollowsQueryError = ErrorType<unknown>;
/**
 * @summary Admin - list all follow relationships
 */
export declare function useAdminListFollows<TData = Awaited<ReturnType<typeof adminListFollows>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListFollows>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin - create a follow relationship
 */
export declare const getAdminCreateFollowUrl: () => string;
export declare const adminCreateFollow: (adminFollowRequest: AdminFollowRequest, options?: RequestInit) => Promise<MessageResponse>;
export declare const getAdminCreateFollowMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateFollow>>, TError, {
        data: BodyType<AdminFollowRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminCreateFollow>>, TError, {
    data: BodyType<AdminFollowRequest>;
}, TContext>;
export type AdminCreateFollowMutationResult = NonNullable<Awaited<ReturnType<typeof adminCreateFollow>>>;
export type AdminCreateFollowMutationBody = BodyType<AdminFollowRequest>;
export type AdminCreateFollowMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Admin - create a follow relationship
 */
export declare const useAdminCreateFollow: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateFollow>>, TError, {
        data: BodyType<AdminFollowRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminCreateFollow>>, TError, {
    data: BodyType<AdminFollowRequest>;
}, TContext>;
/**
 * @summary Admin - delete a follow relationship
 */
export declare const getAdminDeleteFollowUrl: (followId: number) => string;
export declare const adminDeleteFollow: (followId: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getAdminDeleteFollowMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteFollow>>, TError, {
        followId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteFollow>>, TError, {
    followId: number;
}, TContext>;
export type AdminDeleteFollowMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteFollow>>>;
export type AdminDeleteFollowMutationError = ErrorType<unknown>;
/**
 * @summary Admin - delete a follow relationship
 */
export declare const useAdminDeleteFollow: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteFollow>>, TError, {
        followId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteFollow>>, TError, {
    followId: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map