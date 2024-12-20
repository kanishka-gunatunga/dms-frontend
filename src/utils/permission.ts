export const hasPermission = (
    permissions: { [key: string]: string[] },
    group: string,
    permission: string
  ): boolean => {
    return permissions[group]?.includes(permission) || false;
  };
  