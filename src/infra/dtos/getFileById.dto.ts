import { IsNotEmpty, IsString, IsUUID } from "class-validator";
export class GetFileByIdDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}