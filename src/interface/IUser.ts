import { Role } from "../enum/Role";

export interface IUser {
    employeeId: number;
    name: string;
    role: Role;
}
