import { Role } from "../enums/Role";

export interface IUser {
    employeeId: number;
    name: string;
    role: Role;
}
