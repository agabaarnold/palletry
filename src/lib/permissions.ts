import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statements = { ...defaultStatements } as const;

export const ac = createAccessControl(statements);

const superAdminRole = ac.newRole({ ...adminAc.statements });

const adminRole = ac.newRole({ ...adminAc.statements });

export const roles = {
	admin: adminRole,
	"super-admin": superAdminRole,
} as const;
