Patch Assign Permission dialog behavior.

Requirement:
If a permission is inherited from the user's role, show its checkbox as checked but disabled.

Rules:

- direct_permissions = permissions manually assigned to the user
- role_permissions = permissions inherited from role
- all_permissions = direct_permissions + role_permissions

Checkbox behavior:

1. If permission exists in role_permissions:
   - checked = true
   - disabled = true
   - show small label/tag: "Inherited"
   - user cannot uncheck it

2. If permission exists in direct_permissions:
   - checked = true
   - disabled = false
   - user can uncheck it

3. If permission exists in neither:
   - checked = false
   - disabled = false
   - user can check it

Implementation logic:

const selectedPermissions = ref<string[]>([])
const rolePermissions = ref<string[]>([])

After fetching GET /api/users/{user}/permissions:

selectedPermissions.value = [...res.data.all_permissions]
rolePermissions.value = [...res.data.role_permissions]

Checkbox group:

<el-checkbox-group v-model="selectedPermissions">
  <el-checkbox
    v-for="permission in availablePermissions"
    :key="permission"
    :label="permission"
    :disabled="rolePermissions.includes(permission)"
  >
    <span>{{ permission }}</span>

    <el-tag
      v-if="rolePermissions.includes(permission)"
      size="small"
      type="info"
      class="ml-2"
    >
      Inherited
    </el-tag>

  </el-checkbox>
</el-checkbox-group>

Save payload:
Do not send inherited role permissions as direct permissions.

const permissionsToSave = selectedPermissions.value.filter(
(permission) => !rolePermissions.value.includes(permission),
)

await syncUserPermissions(userId, {
permissions: permissionsToSave,
})

Important:

- Do not use all_permissions directly as save payload.
- Do not allow inherited permissions to be removed here.
- Do not convert inherited role permissions into direct permissions.
- Only direct permissions should be synced.
- Do not rewrite working Users code, only patch Assign Permission dialog behavior.
