export interface EmployeeHierarchyDepartment {
  id: number
  name: string
}

export interface EmployeeHierarchyPosition {
  id: number
  name: string
}

export interface EmployeeHierarchyNode {
  id: number
  employee_id: string
  full_name: string
  profile_photo_url: string | null
  department: EmployeeHierarchyDepartment | null
  position: EmployeeHierarchyPosition | null
  children: EmployeeHierarchyNode[]
}
