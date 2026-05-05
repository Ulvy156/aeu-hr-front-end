## Reset User Password (Admin Only)

implement new Reset Password user in user page

RULE:
dont touch working code, only implement new feature

### Endpoint POST /api/users/{user_id}/reset-password

                                                                                                                                                                                                         ### Headers

Authorization: Bearer {admin_token}
Content-Type: application/json
Accept: application/json

### Request Body

{
"password": "newpassword123",
"password_confirmation": "newpassword123"
}

### Validation Rules

- password: required, min 8 characters, must match password_confirmation

### Success Response (200)

{
"success": true,
"message": "Password reset successfully.",
"data": null
}

### Error Responses

// Validation error (422)
{
"message": "The password field confirmation does not match.",
"errors": {
"password": ["The password field confirmation does not match."]
}
}

// Unauthorized - not admin or missing permission (403)
{
"message": "This action is unauthorized."
}

// User not found (404)
{
"message": "No query results for model [App\\Models\\User]."
}

### Behavior

- After a successful reset, the target user is automatically logged out
  (all their tokens are revoked). They must log in again with the new password.
- Only users with role "admin" and permission "users.reset_password" can call this.
- The actor (admin) performing the reset is recorded in the audit log.

### UI Suggestions

- Place a "Reset Password" button in the user detail/edit page (visible to admin only)
- Show a modal/dialog with two fields: New Password + Confirm Password
- After success, show a toast: "Password has been reset. The user will need to log in again."
- No need to show the new password to the user after reset — admin sets it and communicates it manually.
