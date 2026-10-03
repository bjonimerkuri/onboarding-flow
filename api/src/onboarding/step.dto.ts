import { Equals, IsEmail, IsString, Length, MinLength } from 'class-validator';

export class PersonalDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;
}

export class AddressDto {
  @IsString()
  @Length(2, 2, { message: 'country must be a 2-letter code' })
  country: string;

  @IsString()
  @MinLength(2)
  city: string;
}

export class ConfirmDto {
  @Equals(true, { message: 'You must accept the terms' })
  acceptTerms: boolean;
}

export const STEP_DTOS: Record<number, new () => object> = {
  1: PersonalDto,
  2: AddressDto,
  3: ConfirmDto,
};

export const TOTAL_STEPS = Object.keys(STEP_DTOS).length;
