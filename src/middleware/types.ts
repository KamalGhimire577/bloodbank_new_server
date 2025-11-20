import type {Request} from "express"

export enum UserRole {
  user = "user",
  donor = "donor",
  admin = "admin",
}
export interface IextendedRequest extends Request  {

  user?:{
  id:string;
  phoneNumber: string;
  userName?:string
  email?:string
  role:UserRole
}};
