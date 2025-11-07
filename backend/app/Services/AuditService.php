<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditService
{
    /**
     * Log an action.
     */
    public static function log(
        string $action,
        ?User $user = null,
        ?string $entityType = null,
        ?string $entityId = null,
        ?array $meta = null,
        ?Request $request = null
    ): AuditLog {
        $data = [
            'user_id' => $user?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'meta' => $meta,
            'ip' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ];

        return AuditLog::create($data);
    }

    /**
     * Log a login success.
     */
    public static function logLogin(User $user, Request $request): AuditLog
    {
        return self::log(
            'login_success',
            $user,
            'User',
            (string) $user->id,
            ['email' => $user->email],
            $request
        );
    }

    /**
     * Log a logout.
     */
    public static function logLogout(User $user, Request $request): AuditLog
    {
        return self::log(
            'logout',
            $user,
            'User',
            (string) $user->id,
            null,
            $request
        );
    }

    /**
     * Log OTP sent.
     */
    public static function logOtpSent(User $user, Request $request): AuditLog
    {
        return self::log(
            'otp_sent',
            $user,
            'User',
            (string) $user->id,
            ['email' => $user->email],
            $request
        );
    }

    /**
     * Log OTP verified.
     */
    public static function logOtpVerified(User $user, Request $request): AuditLog
    {
        return self::log(
            'otp_verified',
            $user,
            'User',
            (string) $user->id,
            null,
            $request
        );
    }

    /**
     * Log OTP failed.
     */
    public static function logOtpFailed(User $user, Request $request): AuditLog
    {
        return self::log(
            'otp_failed',
            $user,
            'User',
            (string) $user->id,
            null,
            $request
        );
    }

    /**
     * Log tool submitted.
     */
    public static function logToolSubmitted(User $user, int $toolId, string $toolName, Request $request): AuditLog
    {
        return self::log(
            'tool_submitted',
            $user,
            'Tool',
            (string) $toolId,
            ['tool_name' => $toolName],
            $request
        );
    }

    /**
     * Log tool approved.
     */
    public static function logToolApproved(User $user, int $toolId, string $toolName, Request $request): AuditLog
    {
        return self::log(
            'tool_approved',
            $user,
            'Tool',
            (string) $toolId,
            ['tool_name' => $toolName],
            $request
        );
    }

    /**
     * Log tool rejected.
     */
    public static function logToolRejected(User $user, int $toolId, string $toolName, Request $request): AuditLog
    {
        return self::log(
            'tool_rejected',
            $user,
            'Tool',
            (string) $toolId,
            ['tool_name' => $toolName],
            $request
        );
    }

    /**
     * Log tool archived.
     */
    public static function logToolArchived(User $user, int $toolId, string $toolName, Request $request): AuditLog
    {
        return self::log(
            'tool_archived',
            $user,
            'Tool',
            (string) $toolId,
            ['tool_name' => $toolName],
            $request
        );
    }

    /**
     * Log role assigned.
     */
    public static function logRoleAssigned(User $admin, int $userId, string $roleName, Request $request): AuditLog
    {
        return self::log(
            'role_assigned',
            $admin,
            'User',
            (string) $userId,
            ['role' => $roleName],
            $request
        );
    }

    /**
     * Log role removed.
     */
    public static function logRoleRemoved(User $admin, int $userId, string $roleName, Request $request): AuditLog
    {
        return self::log(
            'role_removed',
            $admin,
            'User',
            (string) $userId,
            ['role' => $roleName],
            $request
        );
    }
}
